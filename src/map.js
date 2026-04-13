import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import '../styles/style.css';

import { collection, getDocs, getDoc, updateDoc, doc, serverTimestamp } from './main.js';
import { db } from './firebaseConfig.js';
import { auth } from './firebaseConfig.js';
import { onAuthReady } from './authentication.js';
import { query } from "firebase/firestore";

// ------------------------------------------------------------
// Global variable to store user location, hike data - good practice
// ------------------------------------------------------------
const list_locations = {
  places: [],
  userLngLat: null
};

// ------------------------------------------------------------
// This top level function initializes the MapLibre map, adds controls
// It waits for the map to load before trying to add sources/layers.
// ------------------------------------------------------------
function showMap() {
  // Initialize MapLibre
  // Centered at BCIT
  const map = new maplibregl.Map({
    container: "map",
    style: `https://api.maptiler.com/maps/streets/style.json?key=${import.meta.env.VITE_MAPTILER_KEY}`,
    center: [-122.9975, 49.2520],
    zoom: 16,
    minZoom: 15,
    maxZoom: 18,
    maxBounds: [
      [-123.0065, 49.2465],
      [-122.9890, 49.2575]
    ]
  });

  // Add controls (zoom, rotation, etc.) shown in top-right corner of map
  addControls(map);

  // Once the map loads, we can add the user location and hike markers, etc. 
  // We wait for the "load" event to ensure the map is fully initialized before we try to add sources/layers.
  map.once("load", async () => {
    // Choose either the built-in geolocate control or the manual pin method
    addGeolocationControl(map);

    map.getStyle().layers.forEach((layer) => {
      if (layer.type === 'symbol' && layer.layout?.['icon-image']) {
        map.setLayoutProperty(layer.id, 'visibility', 'none');
      }
    });


    // await location markers
    await addLocationMarkers(map);

    // signal when data is ready
    resolveReady(list_locations);

    // await addUserPin(map);
    console.log("map loaded, placed user pin!");
    console.log("Markers loaded into list_locations.places:", list_locations.places);

    const params = new URLSearchParams(window.location.search);
    const urlQuery = params.get('search');
    
    if (urlQuery) {
        executeSearch(urlQuery, map); 
    }
    // The page wont refresh any time someone does a search
    window.addEventListener('navbarSearch', (e) => {
        const query = e.detail.query;
        executeSearch(query, map);
    });

    const searchBtn = document.getElementById('nav-search-btn');
    const searchInput = document.getElementById('nav-search-input');

    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value.toLowerCase().trim();
        // Find the location in global array
        const target = list_locations.places.find(loc =>
          loc.name.toLowerCase().includes(searchTerm)
        );

        if (target) {
          map.flyTo({ center: [target.longitude, target.latitude], zoom: 19 });
        } else {
          alert("Search failed.");
        }
      });
    }
  });
  
  function addControls(map) {
    // Zoom and rotation
    map.addControl(new maplibregl.NavigationControl(), "top-right");
  }




  async function addLocationMarkers(map) {

    const locationCollectionRef = collection(db, "locations");



    try {

      const querySnapshot = await getDocs(locationCollectionRef);
      list_locations.places = [];

      querySnapshot.forEach((docSnap) => {
        const location = docSnap.data();

        list_locations.places.push({ ...location, id: docSnap.id });
        const { latitude, longitude, name, currentCongestion, estimatedWaitTime } = location;
        if (!latitude || !longitude) return;

        // Build the popup DOM element
        const popupEl = document.createElement('div');
        popupEl.style.minWidth = '220px';
        popupEl.innerHTML = `
            <h5>${name}</h5>
            <p class="mb-1"><strong>Crowd Level:</strong> ${currentCongestion}</p>
            <p class="mb-2"><strong>Wait:</strong> ${estimatedWaitTime}</p>
            <button class="btn btn-primary btn-sm w-100 mb-1 confirm-btn">Confirm Wait Time</button>
            <div class="confirm-msg mb-0" style="display:none">
              <p>Thanks for confirming!</p>
            </div>
            <button class="btn btn-outline-secondary btn-sm w-100 update-btn">Update Wait Time</button>
            <div class="update-options mt-1" style="display:none;">
              <button class="btn btn-secondary btn-sm m-1 time-btn" data-time="5 mins">5 mins</button>
              <button class="btn btn-secondary btn-sm m-1 time-btn" data-time="10 mins">10 mins</button>
              <button class="btn btn-secondary btn-sm m-1 time-btn" data-time="15 mins">15 mins</button>
            </div>
            <div class="update-message mt-1" style="display:none">
              <p class="update-msg mb-0">Wait time updated!</p>
            </div>
          `;

        // Attach the same logic as main.js
        const locationDocRef = doc(db, 'locations', docSnap.id);

        popupEl.querySelector('.confirm-btn').addEventListener('click', () => {
          const confirmMsg = popupEl.querySelector('.confirm-msg');
          updateDoc(locationDocRef, { lastUpdated: serverTimestamp() });
          confirmMsg.style.display = 'block';
        });

        popupEl.querySelector('.update-btn').addEventListener('click', () => {
          const opts = popupEl.querySelector('.update-options');
          opts.style.display = opts.style.display === 'none' ? 'block' : 'none';
        });

        const congestionMap = {
          '5 mins': 'none',
          '10 mins': 'normal',
          '15 mins': 'busy'
        }

        popupEl.querySelectorAll('.time-btn').forEach(btn => {
          btn.addEventListener('click', () => {

            const newCongestion = congestionMap[btn.dataset.time];
            const updateMsg = popupEl.querySelector('.update-message');

            updateDoc(locationDocRef, { estimatedWaitTime: btn.dataset.time, currentCongestion: newCongestion, lastUpdated: serverTimestamp() });
            popupEl.querySelector('.mb-2').innerHTML = `<strong>Wait:</strong> ${btn.dataset.time}`;
            popupEl.querySelector('.mb-1').innerHTML = `<strong>Crowd Level:</strong> ${newCongestion}`;
            updateMsg.style.display = 'block';
            const element = marker.getElement();
            const svg = element.querySelector('svg');
            svg.querySelector('path').setAttribute('fill', getCongestionColor(newCongestion));
          });
        });

        const popup = new maplibregl.Popup({ offset: 25 }).setDOMContent(popupEl);



        const marker =new maplibregl.Marker({ color: getCongestionColor(currentCongestion) })
          .setLngLat([longitude, latitude])
          .setPopup(popup)
          .addTo(map);

      });



    } catch (error) {
      console.error("Error fetching location data:", error);

    }


  }


}
async function executeSearch(query, mapInstance) {
    console.log("Searching for:", query);
    
    // Wait for the mapReady promise to ensure data is loaded
    await mapReady; 

    const searchTerm = query.toLowerCase().trim();

    // Find the location in your global array
    const target = list_locations.places.find(loc =>
        loc.name.toLowerCase().includes(searchTerm)
    );

    if (target && mapInstance) {
        mapInstance.flyTo({ 
            center: [target.longitude, target.latitude], 
            zoom: 19,
            essential: true 
        });
        
        // Optional: Open the popup automatically
        // This is advanced, but for now, flyTo is the priority.
    } else {
        console.warn("Location not found for query:", query);
    }
}

// Helper to pick color based on congestion
function getCongestionColor(congestion) {
  if (congestion === 'none') return '#22c55e';    // green
  if (congestion === 'normal') return '#eab308';  // yellow
  if (congestion === 'busy') return '#ef4444';    // red
  return '#6b7280'; // grey fallback for unknown values
}




showMap();

function addGeolocationControl(map) {
  const geolocate = new maplibregl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: false,
    showUserHeading: true
  });
  map.addControl(geolocate, "top-right");

  // alert message for outside users
  const alertBox = document.getElementById("campus-alert");

  const campusBounds = [
    [-123.0065, 49.2465],
    [-122.9890, 49.2575]
  ];

  geolocate.on("geolocate", (e) => {

    list_locations.userLngLat = [e.coords.longitude, e.coords.latitude];
    const userLng = e.coords.longitude;
    const userLat = e.coords.latitude;

    const isInside =
      userLng >= campusBounds[0][0] &&
      userLng <= campusBounds[1][0] &&
      userLat >= campusBounds[0][1] &&
      userLat <= campusBounds[1][1];

    if (isInside) {
      map.flyTo({
        center: [userLng, userLat],
        zoom: 17
      });

      // hide alert if inside
      alertBox.classList.add("d-none");

    } else {
      // show alert if outside
      alertBox.classList.remove("d-none");
    }
  });

  // Optional: trigger a locate once the control is added
  geolocate.on("trackuserlocationstart", () => {
    // You can react to tracking start here if needed
  });
}

let resolveReady;
export const mapReady = new Promise(resolve => { resolveReady = resolve; });


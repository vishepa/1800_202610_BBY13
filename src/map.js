import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import '../styles/style.css';

import { collection, getDocs, getDoc, updateDoc, doc, serverTimestamp} from './main.js';
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
    // await addUserPin(map);
    console.log("map loaded, placed user pin!");
    console.log("Markers loaded into list_locations.places:", list_locations.places);

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
                map.flyTo({ center: [target.longitude, target.latitude], zoom: 17 });
            } else {
                alert("Search failed.");
    }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchBtn.click();
        });
    }
});

  // Define these helper functions inside showMap so they have map access
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
            <p class="confirm-msg mb-1" style="display:none">Thanks for confirming!</p>
            <button class="btn btn-outline-secondary btn-sm w-100 update-btn">Update Wait Time</button>
            <div class="update-options mt-1" style="display:none">
              <button class="btn btn-secondary btn-sm m-1 time-btn" data-time="5 mins">5 mins</button>
              <button class="btn btn-secondary btn-sm m-1 time-btn" data-time="10 mins">10 mins</button>
              <button class="btn btn-secondary btn-sm m-1 time-btn" data-time="15 mins">15 mins</button>
            </div>
          `;

          // Attach the same logic as main.js
          const locationDocRef = doc(db, 'locations', docSnap.id);

          popupEl.querySelector('.confirm-btn').addEventListener('click', () => {
            updateDoc(locationDocRef, { lastUpdated: serverTimestamp() });
            popupEl.querySelector('.confirm-msg').style.display = 'block';
          });

          popupEl.querySelector('.update-btn').addEventListener('click', () => {
            const opts = popupEl.querySelector('.update-options');
            opts.style.display = opts.style.display === 'none' ? 'block' : 'none';
          });

          popupEl.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              updateDoc(locationDocRef, { estimatedWaitTime: btn.dataset.time });
              popupEl.querySelector('.mb-2').innerHTML = `<strong>Wait:</strong> ${btn.dataset.time}`;
            });
          });

          const popup = new maplibregl.Popup({ offset: 25 }).setDOMContent(popupEl);


          
          new maplibregl.Marker({ color: getCongestionColor(currentCongestion) })
            .setLngLat([longitude, latitude])
            .setPopup(popup)
            .addTo(map);
  
      });



    } catch (error) {
        console.error("Error fetching location data:", error);

    }


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

  const campusBounds = [
    [-123.0065, 49.2465],
    [-122.9890, 49.2575]
  ];

  geolocate.on("geolocate", (e) => {
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
    } else {
      console.log("User is outside BCIT campus");
    }
  });

  // Optional: trigger a locate once the control is added
  geolocate.on("trackuserlocationstart", () => {
    // You can react to tracking start here if needed
  });
}
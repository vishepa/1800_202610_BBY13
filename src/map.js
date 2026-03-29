import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import '../styles/style.css';

import { collection, getDocs, getDoc, updateDoc} from './main.js';
import { db } from './firebaseConfig.js';
import { auth } from './firebaseConfig.js';
import { onAuthReady } from './authentication.js';
import { query } from "firebase/firestore";

// ------------------------------------------------------------
// Global variable to store user location, hike data - good practice
// ------------------------------------------------------------
const appState = {
  hikes: [],
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
    // await addUserPin(map);

    // await location markers
    await addLocationMarkers(map);
    console.log("map loaded, placed user pin!");
  });

  function addControls(map) {
    // Zoom and rotation
    map.addControl(new maplibregl.NavigationControl(), "top-right");
  }

  


  async function addLocationMarkers(map) {

    const locationCollectionRef = collection(db, "locations");

    
    
    try {
      
      const querySnapshot = await getDocs(locationCollectionRef);

      querySnapshot.forEach((docSnap) => {
  
          const location = docSnap.data();

          const { latitude, longitude, name, currentCongestion, estimatedWaitTime } = location;
          if (!latitude || !longitude) return;

          const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
            <strong>${name}</strong><br>
            Congestion: ${currentCongestion}<br>
            Wait: ${estimatedWaitTime}
          `);

          
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
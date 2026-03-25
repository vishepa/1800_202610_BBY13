import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import '../styles/style.css';

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
    // await addUserPin(map);
    console.log("map loaded, placed user pin!");
  });

  function addControls(map) {
    // Zoom and rotation
    map.addControl(new maplibregl.NavigationControl(), "top-right");
  }
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
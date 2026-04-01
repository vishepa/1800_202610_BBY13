import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { Collapse } from 'bootstrap';
import { collection, getDocs, serverTimestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig.js';
import { auth } from './firebaseConfig.js';
import '../styles/style.css';
import { onAuthReady } from './authentication.js';

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export { collection, getDocs, getDoc, updateDoc, serverTimestamp, doc };

// Recent locations management
const MAX_RECENTS = 10;
let currentUser = null;
let userRecents = [];

// Set current user and load recents FIRST
onAuthReady((user) => {
    currentUser = user;
    if (user) {
        loadRecentsFromFirestore().then(() => {
            displayCardsDynamically();
            setupRecentsToggle();
        });
    } else {
        displayCardsDynamically();
        setupRecentsToggle();
    }
});

async function loadRecentsFromFirestore() {
    if (!currentUser) return;
    
    try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists() && userDocSnap.data().recentLocations) {
            userRecents = userDocSnap.data().recentLocations;
            // Sort by timestamp descending (newest first)
            userRecents.sort((a, b) => b.timestamp - a.timestamp);
        } else {
            userRecents = [];
        }
    } catch (error) {
        console.error("Error loading recents from Firestore:", error);
        userRecents = [];
    }
}

async function addToRecents(locationId, locationName) {
    if (!currentUser) return;
    
    try {
        // Remove if already exists
        userRecents = userRecents.filter(item => item.id !== locationId);
        
        // Add to front
        userRecents.unshift({ id: locationId, name: locationName, timestamp: Date.now() });
        
        // Keep only last 10
        userRecents = userRecents.slice(0, MAX_RECENTS);
        
        // Save to Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, {
            recentLocations: userRecents
        });
    } catch (error) {
        console.error("Error saving recents to Firestore:", error);
    }
}

function getRecents() {
    // Return sorted by timestamp descending (newest first)
    return [...userRecents].sort((a, b) => b.timestamp - a.timestamp);
}

function isInRecents(locationId) {
    return userRecents.some(item => item.id === locationId);
}

// Get user's current location with Promises
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        resolve({ lat, lng });
      },
      (error) => {
        reject(new Error("Could not get user location: " + error.message));
      }
    );
  });
}

// Map congestion status to colors
function getCongestionColor(congestion) {
  if (congestion === 'none') return '#22c55e';    // green
  if (congestion === 'normal') return '#eab308';  // yellow
  if (congestion === 'busy') return '#ef4444';    // red
  return '#6b7280'; // grey fallback
}

// Convert Firestore timestamp to "time ago" format
function getTimeAgo(firestoreTimestamp) {
    if (!firestoreTimestamp) return "Never updated";

    const lastUpdated = firestoreTimestamp.toDate(); // convert to JS Date
    const diffMs = Date.now() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

// Main function to display cards based on Firestore data
async function displayCardsDynamically() {    
  const cardTemplate = document.getElementById("tile-template");
  if (!cardTemplate) return; // stop if template doesn't exist

  const locationCollectionRef = collection(db, "locations");

  try {
    const querySnapshot = await getDocs(locationCollectionRef);

    let userCoords = null;
    try {
      userCoords = await getUserLocation();
    } catch (err) {
      console.warn("Location unavailable", err.message);
    }

    const cardEntries = [];

    querySnapshot.forEach((docSnap) => {
      const location = docSnap.data();

      // Clone the template
      let newCard = cardTemplate.content.cloneNode(true);

      let distance = Infinity;

      if (userCoords) {
        // Distance calculation (Haversine)
        const { lat, lng } = userCoords;
        const R = 6371e3; // metres
        const φ1 = location.latitude * Math.PI/180; // φ, λ in radians
        const φ2 =  lat * Math.PI/180;
        const Δφ = (lat - location.latitude) * Math.PI/180;
        const Δλ = (lng - location.longitude) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        const d = R * c; // in metres

        distance = d;

        if (d > 1000) {
            newCard.querySelector("#card-distance").textContent = ` ${(d/1000).toFixed(2)} km`;
            newCard.querySelector("#collapse-card-distance").textContent = `Distance: ${(d/1000).toFixed(2)} km`;
        } else {

            newCard.querySelector("#card-distance").textContent = ` ${(d).toFixed(1)} m`;
            newCard.querySelector("#collapse-card-distance").textContent = `Distance: ${(d).toFixed(1)} m`;

        }

        

      } 
      // Populate card fields
      newCard.querySelector("#card-title").textContent = location.name;
      const currentCongestionField = newCard.querySelector("#card-current-congestion");
        currentCongestionField.textContent = location.currentCongestion;
        currentCongestionField.style.color = getCongestionColor(location.currentCongestion);
      newCard.querySelector("#card-expected-wait-time").textContent =
        location.estimatedWaitTime;

        newCard.querySelector("#card-last-updated").textContent = getTimeAgo(location.lastUpdated);


        // Populate collapse card fiels
          // Populate card fields
      newCard.querySelector("#collapse-card-title").textContent = location.name;
      newCard.querySelector("#collapse-card-congestion").textContent =
        location.currentCongestion;
      newCard.querySelector("#collapse-card-wait-time").textContent =
        "Estimated Wait Time: " + location.estimatedWaitTime;

      const img = document.createElement("img");
      img.src = `../images/${location.image}`;
      img.alt = location.image;

      const test = newCard.querySelector("#img-wrapper");
      test.appendChild(img);

      // Append to DOM first
      const wrapper = document.createElement("div");
      wrapper.appendChild(newCard);
      const thisRow = wrapper.firstElementChild;
      thisRow.dataset.locationId = docSnap.id; // store location ID for later use

      const collapseEl = thisRow.querySelector(".location-collapse");
      const updateCollapseEl = thisRow.querySelector(".update-collapse");
      const confirmBtn = thisRow.querySelector(".confirm");
      const updateBtn = thisRow.querySelector(".update");
      const fiveMinBtn = thisRow.querySelector("#five-min-btn");
      const tenMinBtn = thisRow.querySelector("#ten-min-btn");
      const fifteenMinBtn = thisRow.querySelector("#fifteen-min-btn");

            // Lazily create Collapse instances only on first interaction
            let detailCollapse = null;
            let updateCollapse = null;

            const locationDocRef = doc(db, "locations", docSnap.id);

      const getDetailCollapse = () => {
        if (!detailCollapse)
          detailCollapse = new Collapse(collapseEl, { toggle: false });
        return detailCollapse;
      };

      const getUpdateCollapse = () => {
        if (!updateCollapse)
          updateCollapse = new Collapse(updateCollapseEl, { toggle: false });
        return updateCollapse;
      };

            // Clicking the tile row toggles the detail panel
            thisRow.addEventListener('click', () => {
                const collapse = getDetailCollapse();
                collapse.toggle();
                // Add to recents when detail panel is expanded
                if (!collapseEl.classList.contains('show')) {
                    addToRecents(docSnap.id, location.name);
                }
            });

      // Stop clicks inside the detail panel from bubbling up to the tile
      collapseEl.addEventListener("click", (e) => {
        e.stopPropagation();
      });

            confirmBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const confirmMsg = thisRow.querySelector('.confirm-msg');
                if (confirmMsg) {
                    confirmMsg.style.visibility = 'visible';
                    updateDoc(locationDocRef, {
                        lastUpdated: serverTimestamp()
                    });
                }
                // alert('Wait time confirmed! Thank you for your feedback.');
            });
            fiveMinBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                updateDoc(locationDocRef, { estimatedWaitTime: '5 mins', currentCongestion: 'none', lastUpdated: serverTimestamp() });
                updateCardDisplay(thisRow, '5 mins', 'none');
            });

            tenMinBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                updateDoc(locationDocRef, { estimatedWaitTime: '10 mins', currentCongestion: 'normal', lastUpdated: serverTimestamp() });
                updateCardDisplay(thisRow, '10 mins', 'normal');
            });

            fifteenMinBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                updateDoc(locationDocRef, { estimatedWaitTime: '15 mins', currentCongestion: 'busy', lastUpdated: serverTimestamp() });
                updateCardDisplay(thisRow, '15 mins', 'busy');
            });

      updateBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        getUpdateCollapse().toggle();
      });

      cardEntries.push({ distance, element: thisRow });

    });
    // sort my closest to farthest before appending to DOM
    cardEntries.sort((a, b) => a.distance - b.distance);

    const container = document.getElementById("locations-go-here");
    cardEntries.forEach(({ element }) => container.appendChild(element));
  } catch (error) {
    console.error("Error getting documents: ", error);
  }
}

// Update card display after user feedback
function updateCardDisplay(row, waitTime, congestion) {

    const congestionField = row.querySelector("#card-current-congestion");
    congestionField.textContent = congestion;
    congestionField.style.color = getCongestionColor(congestion);

    row.querySelector("#card-expected-wait-time").textContent = waitTime;
    row.querySelector("#collapse-card-wait-time").textContent = `Estimated Wait Time: ${waitTime}`;
    row.querySelector("#collapse-card-congestion").textContent = congestion;
    row.querySelector("#card-last-updated").textContent = "Just now";
}



// Toggle between All and Recents
function setupRecentsToggle() {
    if (!window.location.pathname.endsWith("congestion.html")) {

        return;
    }
    const recentsToggle = document.getElementById('recents-toggle');
    if (!recentsToggle) {
        console.error('Recents toggle element not found!');
        return;
    }
    
    console.log('Setting up recents toggle, current recents:', getRecents());
    
    recentsToggle.addEventListener('change', () => {
        console.log('Toggle changed, checked:', recentsToggle.checked);
        filterTiles(recentsToggle.checked);
    });
}

function filterTiles(showOnlyRecents) {
    console.log('filterTiles called with showOnlyRecents:', showOnlyRecents);
    
    const container = document.getElementById("locations-go-here");
    const tiles = document.querySelectorAll('.tile-row');
    const recents = getRecents();
    
    console.log('Found tiles:', tiles.length);
    console.log('Recents:', recents);
    
    const recentsMap = new Map(recents.map(item => [item.id, item]));
    
    if (showOnlyRecents) {
        // Get all recent tiles and sort by recency
        const recentTiles = Array.from(tiles).filter(tile => recentsMap.has(tile.dataset.locationId));
        
        console.log('Recent tiles found:', recentTiles.length);
        
        // Sort tiles by recency order
        recentTiles.sort((a, b) => {
            const indexA = recents.findIndex(item => item.id === a.dataset.locationId);
            const indexB = recents.findIndex(item => item.id === b.dataset.locationId);
            return indexA - indexB;
        });
        
        // Hide all tiles first using Bootstrap d-none class
        tiles.forEach(tile => {
            tile.classList.add('d-none');
            console.log('Hiding tile:', tile.dataset.locationId);
        });
        
        // Show and reorder recent tiles
        recentTiles.forEach(tile => {
            tile.classList.remove('d-none');
            console.log('Showing recent tile:', tile.dataset.locationId);
            container.appendChild(tile);
        });
    } else {
        // Show all tiles
        tiles.forEach(tile => {
            tile.classList.remove('d-none');
        });
    }
}

function showName() {
  const nameElement = document.getElementById("name-goes-here");

  onAuthReady((user) => {
    if (!user) {
      if (window.location.pathname.endsWith("main.html")) {
        location.href = "index.html";
        return;
      }
      return;
    }

    const name = user.displayName || user.email;
    if (nameElement) {
      nameElement.textContent = `${name}!`;
    }
  });
}

showName();

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { Collapse } from 'bootstrap';
import { collection, getDocs, serverTimestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig.js';
import { auth } from './firebaseConfig.js';
import '../styles/style.css';
import { onAuthReady } from './authentication.js';

export { collection, getDocs, getDoc, updateDoc};

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

async function displayCardsDynamically() {    
  let cardTemplate = document.getElementById("tile-template");
  if (!cardTemplate) return; // stop if template doesn't exist

  const locationCollectionRef = collection(db, "locations");

  try {
    const querySnapshot = await getDocs(locationCollectionRef);

    querySnapshot.forEach((docSnap) => {
      const location = docSnap.data();

      // Clone the template
      let newCard = cardTemplate.content.cloneNode(true);

      // Populate card fields
      newCard.querySelector("#card-title").textContent = location.name;
      newCard.querySelector("#card-current-congestion").textContent =
        location.currentCongestion;
      newCard.querySelector("#card-expected-wait-time").textContent =
        location.estimatedWaitTime;

      const img = document.createElement("img");
      img.src = `../images/${location.image}`;
      img.alt = location.image;

      const test = newCard.querySelector("#img-wrapper");
      test.appendChild(img);

      // Append to DOM first
      const container = document.getElementById("locations-go-here");
      container.appendChild(newCard);

            // lastElementChild is always the card we just appended
            const thisRow = container.lastElementChild;
            thisRow.dataset.locationId = docSnap.id;

      const collapseEl = thisRow.querySelector(".location-collapse");
      const updateCollapseEl = thisRow.querySelector(".update-collapse");
      const confirmBtn = thisRow.querySelector(".confirm");
      const updateBtn = thisRow.querySelector(".update");

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

      updateBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        getUpdateCollapse().toggle();
      });
    });
  } catch (error) {
    console.error("Error getting documents: ", error);
  }
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

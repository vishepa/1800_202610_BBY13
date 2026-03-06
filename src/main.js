import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

import { db } from './firebaseConfig.js';
import { doc, onSnapshot } from "firebase/firestore";

// If you have custom global styles, import them as well:
import '../styles/style.css';

import '../src/location-tiles.js';

import {
    onAuthReady,
} from './authentication.js';
import { add } from 'firebase/firestore/pipelines';

function sayHello() {

}

function addLocationData() {
    const locationRef = collection(db, 'locations');

    addDoc(locationRef, {
        code: "TIMS", name: "Tim Hortons", congestion: "Busy", wait_time: "10-15 mins", distance: "150m away", last_updated: serverTimestamp()
    });
    addDoc(locationRef, {
        code: "STARBUCKS", name: "Starbucks", congestion: "Moderate", wait_time: "5-10 mins", distance: "200m away", last_updated: serverTimestamp()
    });
    addDoc(locationRef, {
        code: "TRIPLEO", name: "Triple O's", congestion: "Light", wait_time: "0-5 mins", distance: "300m away", last_updated: serverTimestamp()
    });
}

async function seedLocations() {
    const locationRef = collection(db, 'locations');

    // retrieve all documents in the 'locations' collection
    const querySnapshot = await getDocs(locationRef);

    if (querySnapshot.empty) {
        console.log('No location data found, seeding initial data...');

        addLocationData();
    } else {
        console.log('Location data already exists, skipping seeding.');
    }
}

seedLocations();


function showName() {
  const nameElement = document.getElementById("name-goes-here");

  // Wait for Firebase to determine the current authentication state.
  // onAuthReady() runs the callback once Firebase finishes checking the signed-in user.
  // The user's name is extracted from the Firebase Authentication object
  // You can "go to console" to check out current users. 

  onAuthReady((user) => {
    if (!user) {
      if (window.location.pathname.endsWith('main.html')) {

        // If no user is signed in → redirect back to login page.
        location.href = "index.html";
        return;
      }
      
    }

    // If a user is logged in:
    // Use their display name if available, otherwise show their email.
    if (!user) {

      return;
    }
    const name = user.displayName || user.email;

    console.log(name);
    // Update the welcome message with their name/email.
    if (nameElement) {
      nameElement.textContent = `${name}!`;
      
    }
  });
}
showName();
// document.addEventListener('DOMContentLoaded', sayHello);

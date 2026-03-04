import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

// If you have custom global styles, import them as well:
import '../styles/style.css';

import '../src/location-tiles.js';

function sayHello() {

}


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

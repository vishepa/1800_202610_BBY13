import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { Collapse } from 'bootstrap';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig.js';
import '../styles/style.css';
import { onAuthReady } from './authentication.js';

async function displayCardsDynamically() {
    let cardTemplate = document.getElementById("tile-template");
    const locationCollectionRef = collection(db, "locations");

    try {
        const querySnapshot = await getDocs(locationCollectionRef);

        querySnapshot.forEach(docSnap => {
            const location = docSnap.data();

            // Clone the template
            let newCard = cardTemplate.content.cloneNode(true);

            // Populate card fields
            newCard.querySelector('#card-title').textContent = location.name;
            newCard.querySelector('#card-current-congestion').textContent = location.currentCongestion;
            newCard.querySelector('#card-expected-wait-time').textContent = location.estimatedWaitTime;

            // Append to DOM first
            const container = document.getElementById("locations-go-here");
            container.appendChild(newCard);

            // lastElementChild is always the card we just appended
            const thisRow = container.lastElementChild;

            const collapseEl = thisRow.querySelector('.location-collapse');
            const updateCollapseEl = thisRow.querySelector('.update-collapse');
            const confirmBtn = thisRow.querySelector('.confirm');
            const updateBtn = thisRow.querySelector('.update');

            // Lazily create Collapse instances only on first interaction
            let detailCollapse = null;
            let updateCollapse = null;

            const getDetailCollapse = () => {
                if (!detailCollapse) detailCollapse = new Collapse(collapseEl, { toggle: false });
                return detailCollapse;
            };

            const getUpdateCollapse = () => {
                if (!updateCollapse) updateCollapse = new Collapse(updateCollapseEl, { toggle: false });
                return updateCollapse;
            };

            // Clicking the tile row toggles the detail panel
            thisRow.addEventListener('click', () => {
                getDetailCollapse().toggle();
            });

            // Stop clicks inside the detail panel from bubbling up to the tile
            collapseEl.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            confirmBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                alert('Wait time confirmed! Thank you for your feedback.');
            });

            updateBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                getUpdateCollapse().toggle();
            });
        });

    } catch (error) {
        console.error("Error getting documents: ", error);
    }
}

displayCardsDynamically();

function showName() {
    const nameElement = document.getElementById("name-goes-here");

    onAuthReady((user) => {
        if (!user) {
            if (window.location.pathname.endsWith('main.html')) {
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
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '/src/firebaseConfig.js';
import { logoutUser } from '/src/authentication.js';
import "../../styles/style.css";

class SiteNavbar extends HTMLElement {

    constructor() {
        super();
        this.renderNavbar();
        this.renderAuthControls();
    }

    renderNavbar() {
        this.innerHTML = `

            <nav class="navbar navbar-expand-lg navbar-light nav-bg nav-padding">
                <div class="container-fluid nav-height">
                    <a class="navbar-brand navbar-text-color" href="./index.html">TheShortCut</a>
                <button
                class="navbar-toggler toggle-color"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent"
                aria-expanded="false"
                aria-label="Toggle navigation"
                >
                <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse navbar-collapse-color" id="navbarSupportedContent">
                
                <form class="d-flex">
                    <input
                    id="nav-search-input"
                    class="form-control me-2"
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                    />
                    <button id="nav-search-btn" class="btn btn-search-custom" type="submit">
                    Search
                    </button>
                </form>
                <div id="authControls" class="auth-controls d-flex align-items-center gap-2 my-2 my-lg-0">
                    <!-- populated by JS -->
                </div>
                </div>
            </div>
            </nav>
        `;
    }

    renderAuthControls(){
        const authControls = this.querySelector('#authControls');

        authControls.innerHTML = `<div class="btn btn-outline-light" style="visibility: hidden; min-width: 80px;">Log out</div>`;

        onAuthStateChanged(auth, (user) => {
            let updatedAuthControl;
            if (user) {
                updatedAuthControl = `<button class="btn btn-outline-light" id="signOutBtn" type="button" style="min-width: 80px;">Log out</button>`;
                authControls.innerHTML = updatedAuthControl;
                const signOutBtn = authControls.querySelector('#signOutBtn');
                signOutBtn?.addEventListener('click', logoutUser);
            } else {
                updatedAuthControl = `<a class="btn btn-outline-light" id="loginBtn" href="/login.html" style="min-width: 80px;">Log in</a>`;
                authControls.innerHTML = updatedAuthControl;
            }
        });
    }
    connectedCallback() {
    // 1. Select the form itself, not just the button
    const searchForm = this.querySelector('form');
    const searchInput = this.querySelector('#nav-search-input');

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            // 2. This is CRITICAL: it stops the "Enter" key from refreshing the page
            e.preventDefault(); 

            const query = searchInput.value.trim();
            if (!query) return;

            // 3. Your existing logic
            if (window.location.pathname.includes('map.html')) {
                console.log("Searching via Enter/Click without reload...");
                
                const searchEvent = new CustomEvent('navbarSearch', { 
                    detail: { query: query } 
                });
                window.dispatchEvent(searchEvent);
                
            } else {
                window.location.href = `map.html?search=${encodeURIComponent(query)}`;
            }
        });
    }
}
}

customElements.define('site-navbar', SiteNavbar)

//pre navbar modification
// <ul class="navbar-nav me-auto mb-2 mb-lg-0">
//     <li class="nav-item">
//     <p>&#9786;</p>
//     </li>
// </ul>
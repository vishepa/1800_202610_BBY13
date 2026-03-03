// import { onAuthChanged } from "firebase/auth";
// import { auth } from '/src/firebaseConfig.js';
// import { logoutUser } from '/src/authentication.js';

class SiteNavbar extends HTMLElement {

    constructor() {
        super();
        this.renderNavbar();
        this.renderAuthControls();
    }

    renderNavbar() {
        this.innerHTML = `

            <nav class="navbar navbar-expand-lg navbar-light nav-bg">
                <div class="container-fluid nav-height">
                    <a class="navbar-brand navbar-text-color" href="./index.html">Find your way</a>
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
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                    <p>&#9786;</p>
                    </li>
                </ul>
                <form class="d-flex">
                    <input
                    class="form-control me-2"
                    type="search"
                    placeholder="Search"
                    aria-label="Search"
                    />
                    <button class="btn btn-outline-success" type="submit">
                    Search
                    </button>
                </form>
                </div>
            </div>
            </nav>
        `;
    }

    // renderAuthControls(){
    //     const authControls = this.querySelector('#authControls');

    //     authControls.innerHTML = `<div class="btn btn-outline-light" style="visibility: hidden; min-width: 80px;">Log out</div>`;

    //     onAuthStateChanged(auth, (user) => {
    //         let updatedAuthControl;
    //         if (user) {
    //             updatedAuthControl = `<button class="btn btn-outline-light" id="signOutBtn" type="button" style="min-width: 80px;">Log out</button>`;
    //             authControls.innerHTML = updatedAuthControl;
    //             const signOutBtn = authControls.querySelector('#signOutBtn');
    //             signOutBtn?.addEventListener('click', logoutUser);
    //         } else {
    //             updatedAuthControl = `<a class="btn btn-outline-light" id="loginBtn" href="/login.html" style="min-width: 80px;">Log in</a>`;
    //             authControls.innerHTML = updatedAuthControl;
    //         }
    //     });
    // }
}

customElements.define('site-navbar', SiteNavbar)
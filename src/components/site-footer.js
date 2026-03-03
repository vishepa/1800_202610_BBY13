// import { onAuthChanged } from "firebase/auth";
// import { auth } from '/src/firebaseConfig.js';
// import { logoutUser } from '/src/authentication.js';

class SiteFooter extends HTMLElement {

    constructor() {
        super();
        this.renderFooter();
        // this.renderAuthControls();
    }

    renderFooter() {
        this.innerHTML = `

            <footer class="d-flex flex-wrap sticky-bottom justify-content-between align-items-center py-3 border-top">
                <a href="/" class="col-md-4 d-flex align-items-center justify-content-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none">
                    <svg class="bi me-2" width="40" height="32">
                        <use xlink:href="#bootstrap" />
                    </svg>
                </a>
                <div class="container d-flex justify-content-around">
                    <a href="./review.html">
                        <span class="material-icons">favorite</span>
                    </a>
                    <a href="./index.html">
                        <span class="material-icons">home</span>
                    </a>
                    <a href="./BC_Place_map.html">
                        <span class="material-icons">map</span>
                    </a>
                </div>
            </footer>


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

customElements.define('site-footer', SiteFooter)
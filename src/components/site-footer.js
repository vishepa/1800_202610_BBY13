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

            <footer class="d-flex flex-wrap sticky-bottom justify-content-between align-items-center py-3 border-top footer-bg">
                
              <div class="container d-flex justify-content-around text-center">
                  <a href="./congestion.html" class="footer-item">
                    <span class="material-icons icon-color">hourglass_top</span>
                    <p class="icon-name">Congestion</p>
                  </a>

                  <a href="./index.html" class="footer-item">
                      <span class="material-icons icon-color">home</span>
                      <p class="icon-name">Home</p>
                  </a>

                  <a href="./account.html" class="footer-item">
                      <span class="material-icons icon-color">person</span>
                      <p class="icon-name">Account</p>
                  </a>
              </div>
                
            </footer>


        `;
  }

  //   //deleted the a tag of the footer, comes right after <footer class"d-flex....> it was messing with the user click
  //   <a href="/" class="col-md-4 d-flex align-items-center justify-content-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none">
  //                     <svg class="bi me-2" width="40" height="32">
  //                         <use xlink:href="#bootstrap" />
  //                     </svg>
  //                 </a>

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

customElements.define("site-footer", SiteFooter);

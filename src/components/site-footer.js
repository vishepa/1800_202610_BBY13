//import { getAuth, onAuthStateChanged } from "firebase/auth";

import { auth, onAuthStateChanged } from "../firebaseConfig.js";
// import { logoutUser } from '/src/authentication.js';

class SiteFooter extends HTMLElement {
  constructor() {
    super();
    this.renderFooter();
    // this.renderAuthControls();
    this.setupAccountButton(); //dont forget to call the method here!
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

                  <a id = "accountBtn" class="footer-item">
                      <span class="material-icons icon-color">person</span>
                      <p class="icon-name">Account</p>
                  </a>
              </div>
                
            </footer>


        `;
  }

  //when the attribute of href="./account.html" in <a> The browser navigates immediately to account.html
  //JavaScript never gets a chance to run,the redirect logic and click handler is ignored,never checks Firebase auth,
  /* footer is a custom element, not part of the global DOM at the moment the script runs.
    the document.getElementById() can return null if the component hasn’t been attached to the DOM yet.
    Inside a custom element, the HTML is not part of the global document until after the component renders.
    Inside a custom element, you should always query inside the component, not the global document.
    This guarantees the element is found because it searches inside the footer, not the whole page.
    this.querySelector waits until the box is filled and is the correct way to access elements inside a custom element.
    */
  // clicking the account page button brings the user to the login page if the user is not logged in
  setupAccountButton() {
    const accountBtn = document.getElementById("accountBtn");
    /*const accountBtn = this.querySelector("#accountBtn"); 
    use this.querySelector() instead if footer is a custom element 
     whose HTML is not part of the global document until after the component renders.
     This guarantees the element is found because it searches inside the footer, not the whole page.
*/
    let currentUser = null;

    onAuthStateChanged(auth, (user) => {
      currentUser = user;
    });

    accountBtn.addEventListener("click", () => {
      if (currentUser) {
        window.location.href = "../../account.html";
      } else {
        window.location.href = "../../login.html";
      }
    });
  }

  // setupAccountButton() {
  //   const accountBtn = this.querySelector("#accountBtn");

  //   accountBtn.addEventListener("click", () => {
  //     onAuthStateChanged(auth, (user) => {
  //       if (user) {
  //         window.location.href = "../../account.html";
  //       } else {
  //         window.location.href = "../../login.html";
  //       }
  //     });
  //   });
  // }
  //   addAccountClickHandler() {
  //     const accountBtn = this.querySelector("#accountBtn");

  //     accountBtn.addEventListener("click", () => {
  //       const isLoggedIn = localStorage.getItem("userToken"); // or your real check

  //       if (!isLoggedIn) {
  //         window.location.href = "./login.html";
  //         return;
  //       }

  //       window.location.href = "./account.html";
  //     });
  //   }

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

import { auth, onAuthStateChanged } from "../js/firebaseConfig.js";

class SiteFooter extends HTMLElement {
  constructor() {
    super();
    this.renderFooter();
    this.setupAccountButton();
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

  // clicking the account page button brings the user to the login page if the user is not logged in
  setupAccountButton() {
    const accountBtn = document.getElementById("accountBtn");

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


}

customElements.define("site-footer", SiteFooter);

// document.getElementById("logoutBtn").addEventListener("click", function () {
//   // remove saved login info
//   localStorage.removeItem("user");

//   // go back to login page
//   window.location.href = "login.html";
// });

import { getAuth, signOut } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";

const auth = getAuth();

document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.log(error);
    });
});

// document.getElementById("homeBtn").addEventListener("click", function () {
//   window.location.href = "index.html";
// });

// fetch and read the doc data from firestore, then display them in account input box

const db = getFirestore();

async function loadUser() {
  const docRef = doc(db, "accounts", "ZD1LPEawi58669ZKZbZD");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();

    document.getElementById("name").value = data.name;
    document.getElementById("email").value = data.email;
    document.getElementById("club").value = data.club;
    document.getElementById("password").value = data.password;
  }
}

loadUser();

// document.getElementById("logoutBtn").addEventListener("click", function () {
//   // remove saved login info
//   localStorage.removeItem("user");

//   // go back to login page
//   window.location.href = "login.html";
// });

import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
//import { db } from "./firebase.js";
import { initializeApp } from "firebase/app";

import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  setDoc,
} from "firebase/firestore";

const db = getFirestore();
const auth = getAuth();
const authButton = document.getElementById("logoutBtn");

//test in console to see if uid is generated.
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User UID:", user.uid);
    // User is logged in → enable fields
    document.getElementById("name").disabled = false;
    document.getElementById("club").disabled = false;
    document.getElementById("email").disabled = false;
    document.getElementById("password").disabled = false;

    // User is logged in
    authButton.textContent = "Log Out";
    authButton.onclick = () => {
      signOut(auth).then(() => {
        window.location.href = "index.html";
        document.getElementById("email").value = "";
        document.getElementById("password").value = "";
      });
    };
  } else {
    console.log("No user logged in");
    // User is logged out → keep fields disabled
    document.getElementById("name").disabled = true;
    document.getElementById("club").disabled = true;
    document.getElementById("email").disabled = true;
    document.getElementById("password").disabled = true;
    // User is logged out
    authButton.textContent = "Log In";
    authButton.onclick = () => {
      window.location.href = "login.html";
    };
  }
});

// document.getElementById("logoutBtn").addEventListener("click", () => {
//   signOut(auth)
//     .then(() => {
//       document.getElementById("email").value = "";
//       document.getElementById("password").value = "";

//       window.location.href = "index.html";
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// });

// document.getElementById("homeBtn").addEventListener("click", function () {
//   window.location.href = "index.html";
// });
//use save changes button to upadate doc to firestore.
document
  .getElementById("saveChangesBtn")
  .addEventListener("click", async () => {
    console.log("Save clicked");

    const user = auth.currentUser;

    if (!user) {
      alert("User not logged in");
      return;
    }

    console.log("UID:", user.uid);

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const club = document.getElementById("club").value;

    const docRef = doc(db, "accounts", user.uid);

    console.log("Writing to Firestore:", docRef.path);

    await setDoc(docRef, {
      name: name,
      email: email,
      club: club,
    });

    alert("Account saved!");
    console.log("Firestore write finished");
    window.location.href = "../index.html";
  });

// fetch and read the doc data from firestore, then display them in account input box

async function loadUser() {
  const user = auth.currentUser;

  const docRef = doc(db, "accounts", user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();

    document.getElementById("name").value = data.name || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("club").value = data.club || "";
    //document.getElementById("password").value = data.password;
  } else {
    await setDoc(
      docRef,
      {
        name: "",
        email: user.email,
        club: "",
      },
      // { merge: true }, //create doc if it does not exist, update if exists. comment it out as we want to use the Save button to update doc
    );
  }
}
//it's safer to wait for authentication, then calling loadUser()
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadUser();
  }
  if (!user) {
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
  }
});

// document
//   .getElementById("saveChangesBtn")
//   .addEventListener("click", async () => {
//     const user = auth.currentUser;

//     const name = document.getElementById("name").value;
//     const email = document.getElementById("email").value;
//     const club = document.getElementById("club").value;

//     const docRef = doc(db, "accounts", "account");

//     await updateDoc(docRef, {
//       name: name,
//       email: email,
//       club: club,
//     });

//     alert("Profile updated!");
//   });

//Disable the button until the user is logged in:

// if (!auth.currentUser) {
//   alert("You must be logged in.");
//   return;
// }

// auth.onAuthStateChanged(auth, async (user) => {
//   if (user) {
//     const docRef = doc(db, "accounts", user.uid);
//     const docSnap = await getDoc(docRef);

//     if (docSnap.exists()) {
//       const data = docSnap.data();

//       document.getElementById("name").value = data.name;
//       document.getElementById("club").textContent = data.club;
//       document.getElementById("email").textContent = data.email;
//     }
//   }
// });

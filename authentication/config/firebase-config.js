import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDy-tZhiEVdMUvufApNTHsNtkJHC19MTNM",
  authDomain: "library-project-1e7a9.firebaseapp.com",
  projectId: "library-project-1e7a9",
  storageBucket: "library-project-1e7a9.firebasestorage.app",
  messagingSenderId: "144298710018",
  appId: "1:144298710018:web:7c95379581f632cbfd431b",
  measurementId: "G-RPSKSCQQGZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase web configuration for the inventory-53b1f project.
<<<<<<< HEAD
=======
// These values identify the Firebase web app and are intended for client-side use.
>>>>>>> 8790b48 (Update frontend and backend for campus supply tracker)
const firebaseConfig = {
  apiKey: "AIzaSyBAoGP77GMIOJCPelE67f8zy3qyLWHZaLE",
  authDomain: "inventory-53b1f.firebaseapp.com",
  projectId: "inventory-53b1f",
  storageBucket: "inventory-53b1f.firebasestorage.app",
  messagingSenderId: "979846521821",
  appId: "1:979846521821:web:5021cc32df36b0991c0c34"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
<<<<<<< HEAD

// Ask Google to show the account chooser on every sign-in attempt.
googleProvider.setCustomParameters({
  prompt: "select_account"
});
=======
>>>>>>> 8790b48 (Update frontend and backend for campus supply tracker)
export const db = getFirestore(app);

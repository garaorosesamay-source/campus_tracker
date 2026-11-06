import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase web configuration for the inventory-53b1f project.
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
export const db = getFirestore(app);

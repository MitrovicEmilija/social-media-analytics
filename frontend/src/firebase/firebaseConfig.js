import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCqeAhJj9mOqoQgvd7-y_tkOc-FLnq1DpM",
  authDomain: "social-media-analytics-b1bd7.firebaseapp.com",
  projectId: "social-media-analytics-b1bd7",
  storageBucket: "social-media-analytics-b1bd7.firebasestorage.app",
  messagingSenderId: "237644034383",
  appId: "1:237644034383:web:5afd22de121483c847153a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

export const functionsUrl = window.location.hostname === "localhost"
  ? "http://127.0.0.1:5001/social-media-analytics-b1bd7/us-central1"
  : "https://europe-west1-social-media-analytics-b1bd7.cloudfunctions.net";
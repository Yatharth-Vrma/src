// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDFtT2nhIfs2LK-zDUrHFr92VakSaBqhMA",
  authDomain: "first-c362d.firebaseapp.com",
  projectId: "first-c362d",
  storageBucket: "first-c362d.firebasestorage.app",
  messagingSenderId: "961822509276",
  appId: "1:961822509276:web:baedce90b3d225f5220c19",
  measurementId: "G-XQ02YV11YY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db }; // ✅ Ensure 'db' is exported

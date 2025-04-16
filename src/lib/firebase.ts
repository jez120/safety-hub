// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app"; // Import FirebaseApp type
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: "safety-hub-lqzg4.firebaseapp.com",
    projectId: "safety-hub-lqzg4",
    storageBucket: "safety-hub-lqzg4.appspot.com", // Corrected storage bucket name if needed
    messagingSenderId: "379696949296",
    appId: "1:379696949296:web:b96447ae38849fb80d65f5"
};

// Initialize Firebase
let app: FirebaseApp; // Explicitly type app

if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export { app }; // Export the typed app instance

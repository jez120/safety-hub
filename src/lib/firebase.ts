// Import the functions you need from the SDKs you need
  import { initializeApp } from "firebase/app";
  import { getAuth } from "firebase/auth"; // Import getAuth

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: "safety-hub-lqzg4.firebaseapp.com",
    projectId: "safety-hub-lqzg4",
    storageBucket: "safety-hub-lqzg4.firebasestorage.app",
    messagingSenderId: "379696949296",
    appId: "1:379696949296:web:b96447ae38849fb80d65f5"
  };

  // Initialize Firebase
  export const app = initializeApp(firebaseConfig);

  // Initialize Firebase Authentication and get a reference to the service
  export const auth = getAuth(app);


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBM-CJ-0HQep6R9kBb8TwNXdat9Zdko8Qw",
  authDomain: "hangangecopark.firebaseapp.com",
  projectId: "hangangecopark",
  storageBucket: "hangangecopark.appspot.com",
  messagingSenderId: "529202012876",
  appId: "1:529202012876:web:503792c4e8f6c065a55869",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

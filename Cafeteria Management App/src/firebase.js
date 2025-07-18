// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDbPeugi8ffTqoxt77_f_BeNCpmxXgk_K4",
  authDomain: "cafeteria-management-app-8eb23.firebaseapp.com",
  projectId: "cafeteria-management-app-8eb23",
  storageBucket: "cafeteria-management-app-8eb23.firebasestorage.app",
  messagingSenderId: "551548668310",
  appId: "1:551548668310:web:2eeddd85031f4054d575b7",
  measurementId: "G-GV3NHE8G1V"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const auth = getAuth(app);

export { auth };

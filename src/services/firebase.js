import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDckxi6pdWyXtDEfSebOuCEKzfRTi56aqQ",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "serverccpyradio.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "serverccpyradio",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "serverccpyradio.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "667905363599",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:667905363599:web:8482fac36b6f3e45992afa",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-CN9SM7H53N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore especificando el nombre de la base de datos "ctnradio"
export const db = getFirestore(app, "ctnradio");

// Inicializar Storage especificando el bucket "ctnradio"
export const storage = getStorage(app, "gs://ctnradio");

export const auth = getAuth(app);

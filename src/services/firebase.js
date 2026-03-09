import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDckxi6pdWyXtDEfSebOuCEKzfRTi56aqQ",
    authDomain: "serverccpyradio.firebaseapp.com",
    projectId: "serverccpyradio",
    storageBucket: "serverccpyradio.firebasestorage.app",
    messagingSenderId: "667905363599",
    appId: "1:667905363599:web:8482fac36b6f3e45992afa",
    measurementId: "G-CN9SM7H53N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore especificando el nombre de la base de datos "ctnradio"
export const db = getFirestore(app, "ctnradio");

// Inicializar Storage especificando el bucket "ctnradio"
export const storage = getStorage(app, "gs://ctnradio");

export const auth = getAuth(app);

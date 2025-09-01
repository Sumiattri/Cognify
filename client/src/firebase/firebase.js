import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBRz8rOX25jTPGtkgB3Au1b4ihjtW2QstA",
  authDomain: "cognify-smart.firebaseapp.com",
  projectId: "cognify-smart",
  storageBucket: "cognify-smart.firebasestorage.app",
  messagingSenderId: "994193143468",
  appId: "1:994193143468:web:06a0e6c454211ef4a71109",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

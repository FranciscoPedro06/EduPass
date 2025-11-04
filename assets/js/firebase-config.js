import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";

// Configuração Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC1dXCNpVWQK9GViPhNfpB8EH2H-ovx4ZA",
  authDomain: "edupass-e5141.firebaseapp.com",
  projectId: "edupass-e5141",
  storageBucket: "edupass-e5141.appspot.com",
  messagingSenderId: "326972343143",
  appId: "1:326972343143:web:c37aac6258820336c5e5c2",
  measurementId: "G-838CBWYCXR"
};

// Inicializa Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

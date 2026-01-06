// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAlMyf_NFJ8xrQLt24EhxAzWZTnQbPr6aQ",
    authDomain: "desksetup-web.firebaseapp.com",
    projectId: "desksetup-web",
    storageBucket: "desksetup-web.firebasestorage.app",
    messagingSenderId: "540303783708",
    appId: "1:540303783708:web:ef169c5fb08b7d9a822cd9",
    measurementId: "G-N1ZDZ3JWF0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a a time.
        // ...
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        // ...
    }
});
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;

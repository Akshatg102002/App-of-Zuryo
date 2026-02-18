
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBrjDlJeHPo66cf8EpM0YQjXSsjmighNXU",
  authDomain: "zuryo-2f32a.firebaseapp.com",
  projectId: "zuryo-2f32a",
  storageBucket: "zuryo-2f32a.firebasestorage.app",
  messagingSenderId: "1061685847140",
  appId: "1:1061685847140:web:2d2a120bd0775fb0132b71",
  measurementId: "G-CE8JBG676X"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export default firebase;
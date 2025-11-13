// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDqrHG1Iqz74IGPeCh6keWD9__xhGhHV9g",
  authDomain: "trip-expense-report-generation.firebaseapp.com",
  projectId: "trip-expense-report-generation",
  storageBucket: "trip-expense-report-generation.firebasestorage.app",
  messagingSenderId: "665365656767",
  appId: "1:665365656767:web:d8fea6b2c96f8ef20b820a",
  measurementId: "G-9Q51MZTWS8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 認証インスタンスをエクスポート
export const auth = getAuth(app);
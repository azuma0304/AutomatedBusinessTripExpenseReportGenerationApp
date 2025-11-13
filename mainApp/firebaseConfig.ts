// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
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

// AnalyticsはWeb環境（ブラウザ）でのみ動的インポートして初期化
// SSR環境やReact Native環境では初期化しない
if (typeof window !== 'undefined') {
  // 動的インポートを使用して、モジュール読み込み時のwindow参照を回避
  import("firebase/analytics").then(({ getAnalytics }) => {
    try {
      getAnalytics(app);
    } catch (error) {
      // Analyticsの初期化に失敗した場合（例：モバイル環境など）
      console.log('Firebase Analytics is not available in this environment');
    }
  }).catch((error) => {
    // 動的インポートに失敗した場合（例：モバイル環境など）
    console.log('Firebase Analytics module could not be loaded');
  });
}

// 認証インスタンスをエクスポート
export const auth = getAuth(app);
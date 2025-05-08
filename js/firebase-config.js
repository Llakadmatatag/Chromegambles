// Firebase configuration
const firebaseConfig = {
  // Masukkan konfigurasi Firebase Anda di sini
  apiKey: "AIzaSyAVUqUZvYLOfglGRdgKrIsG6k6KDAxvFu4",
  authDomain: "xfun-lb-web-chrome.firebaseapp.com",
  projectId: "xfun-lb-web-chrome",
  storageBucket: "xfun-lb-web-chrome.firebasestorage.app",
  messagingSenderId: "749066968777",
  appId: "1:749066968777:web:1482e4011829dbce35f718",
  measurementId: "G-BFDDTMSPX3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

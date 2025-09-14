// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyB9v97rncwzVAZYUY8kQ4kfftsS20HXDUI",
  authDomain: "codeorbitera-123.firebaseapp.com",
  projectId: "codeorbitera-123",
  storageBucket: "codeorbitera-123.firebasestorage.app",
  messagingSenderId: "423802624486",
  appId: "1:423802624486:web:d417cc8d9b1640be455e27"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
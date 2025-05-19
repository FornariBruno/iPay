import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyB4OpCx6YiUbNEMre7i-gV7KS-RJH1jevY",
    authDomain: "ipay-8075c.firebaseapp.com",
    projectId: "ipay-8075c",
    storageBucket: "ipay-8075c.firebasestorage.app",
    messagingSenderId: "356258934166",
    appId: "1:356258934166:web:141e27d775f0d6659641b7"
  };

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
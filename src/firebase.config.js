import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBsvJDcxvyVTR5h_NVC8XAsJyOxxGBJVzc',
  authDomain: 'house-market-place-28c68.firebaseapp.com',
  projectId: 'house-market-place-28c68',
  storageBucket: 'house-market-place-28c68.appspot.com',
  messagingSenderId: '177479404944',
  appId: '1:177479404944:web:00490a1e4a94e5de19f715',
}

// Initialize Firebase
initializeApp(firebaseConfig)

export const db = getFirestore()

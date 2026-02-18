import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBWgj0-DKD_DSPtc2oMZUkHLw5n44faOGM",
  authDomain: "jebchit-app.firebaseapp.com",
  projectId: "jebchit-app",
  storageBucket: "jebchit-app.firebasestorage.app",
  messagingSenderId: "184845059109",
  appId: "1:184845059109:web:bbe57d82f30fd1f63d2bcc"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

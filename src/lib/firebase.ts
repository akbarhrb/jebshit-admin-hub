import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCOCAwb56z_n7iAtbAl-2SGXhk_h3qwXfc",
  authDomain: "jebshit-app.firebaseapp.com",
  projectId: "jebshit-app",
  storageBucket: "jebshit-app.firebasestorage.app",
  messagingSenderId: "320047615482",
  appId: "1:320047615482:web:2fe9f24086c3890f5be843"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

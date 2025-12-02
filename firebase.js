// firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAK6vqcaDsR0uAFeQ_YeT6DZXz122lqEo4',
  authDomain: 'kronik-hatirlatici.firebaseapp.com',
  projectId: 'kronik-hatirlatici',
  storageBucket: 'kronik-hatirlatici.firebasestorage.app',
  messagingSenderId: '240505161492',
  appId: '1:240505161492:web:c8e6d32a83a0c38102a401',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const appId = firebaseConfig.appId;
export const db = getFirestore(app);

// React Native: öncelikle AsyncStorage persistence ile initialize etmeye çalış
let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Eğer zaten init edildiyse yeniden kullan
  authInstance = getAuth(app);
}
export const auth = authInstance;

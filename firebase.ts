import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBR3QPvGp4Zu6GHxua2vp1SQHVB2JECVkc",
  authDomain: "mozzerp.firebaseapp.com",
  projectId: "mozzerp",
  storageBucket: "mozzerp.firebasestorage.app",
  messagingSenderId: "930538856184",
  appId: "1:930538856184:web:b78a13453da6d11dca650d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Helper for the specific artifact path
export const getArtifactCollection = (collectionName: string) => {
  // Updated to match your new project ID "mozzerp"
  return collection(db, "artifacts", "mozzerp", `mozza_${collectionName}`);
};
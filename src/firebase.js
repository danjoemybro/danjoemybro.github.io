import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAW_dQEsnt0R3OSfzTKDGnjtEMWrvQmy6k",
  authDomain: "mac-comparison.firebaseapp.com",
  projectId: "mac-comparison",
  storageBucket: "mac-comparison.appspot.com",
  messagingSenderId: "123745312698",
  appId: "1:123745312698:web:db27575c2ac1d407a78783",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Get a list of cities from your database
async function getCities(db) {
  const citiesCol = collection(db, "cities");
  const citySnapshot = await getDocs(citiesCol);
  const cityList = citySnapshot.docs.map((doc) => doc.data());
  return cityList;
}

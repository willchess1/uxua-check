import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";

export const firebaseConfig = {
  "projectId": "studio-1092480126-4c1de",
  "appId": "1:62121828856:web:0438ee01e3573047e8f60d",
  "apiKey": "AIzaSyDFH_b2yGrQPC8FQzpUFSMoKMvmvIcc4_E",
  "authDomain": "studio-1092480126-4c1de.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "62121828856"
};

export function getFirebaseApp(): FirebaseApp {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFirebaseApp, type firebaseConfig } from "./config";
import type { FirebaseApp } from "firebase/app";

type FirebaseContextType = {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
};

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  db: null,
});

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [firebase, setFirebase] = useState<FirebaseContextType>({
    app: null,
    auth: null,
    db: null,
  });

  useEffect(() => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    const db = getFirestore(app);

    setFirebase({ app, auth, db });
  }, []);

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => useContext(FirebaseContext);
export const useAuth = () => {
    const { auth } = useFirebase();
    return { auth };
};
export const useDb = () => {
    const { db } = useFirebase();
    return { db };
}

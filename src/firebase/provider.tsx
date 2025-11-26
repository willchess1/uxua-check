"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getAuth, onAuthStateChanged, type Auth, type User } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFirebaseApp } from "./config";
import type { FirebaseApp } from "firebase/app";

type FirebaseContextType = {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
  user: User | null;
  loading: boolean;
};

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  db: null,
  user: null,
  loading: true,
});

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [firebase, setFirebase] = useState<Omit<FirebaseContextType, 'user' | 'loading'>>({
    app: null,
    auth: null,
    db: null,
  });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    setFirebase({ app, auth, db });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseContext.Provider value={{ ...firebase, user, loading }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => useContext(FirebaseContext);
export const useAuth = () => {
    return useContext(FirebaseContext);
};
export const useDb = () => {
    const { db } = useFirebase();
    return { db };
}

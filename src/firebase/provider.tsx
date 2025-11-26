"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getAuth, onAuthStateChanged, type Auth, type User } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getFirebaseApp } from "./config";
import type { FirebaseApp } from "firebase/app";

type FirebaseContextType = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  user: User | null;
  loading: boolean;
};

// Criação do Contexto do Firebase
const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

// Provedor do Firebase
export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [app] = useState(getFirebaseApp());
  const [auth] = useState(getAuth(app));
  const [db] = useState(getFirestore(app));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Começa como true para indicar que a autenticação está carregando

  useEffect(() => {
    // onAuthStateChanged observa o estado de login do usuário
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user); // Define o usuário (pode ser null se deslogado)
      setLoading(false); // Marca o carregamento como concluído
    });

    // Limpa o listener quando o componente é desmontado
    return () => unsubscribe();
  }, [auth]);

  const value = { app, auth, db, user, loading };

  return (
    <FirebaseContext.Provider value={value}>
      {!loading && children}
    </FirebaseContext.Provider>
  );
}

// Hook para acessar o contexto completo do Firebase
export const useFirebase = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error("useFirebase must be used within a FirebaseProvider");
    }
    return context;
};

// Hook simplificado para acessar apenas a autenticação e o estado do usuário
export const useAuth = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within a FirebaseProvider");
    }
    return { auth: context.auth, user: context.user, loading: context.loading };
};

// Hook para acessar a instância do Firestore
export const useDb = () => {
    const context = useContext(FirebaseContext);
    if (context === undefined) {
        throw new Error("useDb must be used within a FirebaseProvider");
    }
    return { db: context.db };
}

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";

// Lê as variáveis de ambiente do arquivo .env.local
// O prefixo NEXT_PUBLIC_ é necessário para que o Next.js exponha essas variáveis para o navegador.
export const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

export function getFirebaseApp(): FirebaseApp {
  // Garante que a inicialização só aconteça uma vez.
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

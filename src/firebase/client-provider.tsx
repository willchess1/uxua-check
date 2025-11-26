'use client';

import { useEffect, useState } from 'react';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Renderiza o FirebaseProvider apenas no lado do cliente, após a montagem.
  // Isso garante que nenhuma inicialização do Firebase aconteça no servidor.
  if (!isClient) {
    return null; // Ou um componente de loading, se preferir
  }

  return <FirebaseProvider>{children}</FirebaseProvider>;
}

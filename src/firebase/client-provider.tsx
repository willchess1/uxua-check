'use client';

import { useEffect, useState } from 'react';
import { FirebaseProvider } from './provider';

/**
 * Este componente garante que o FirebaseProvider (e, portanto, a inicialização do Firebase)
 * só seja renderizado no lado do cliente. Isso é crucial para evitar erros de hidratação
 * e tentativas de inicialização do Firebase no servidor.
 */
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  // useEffect só roda no cliente, então podemos definir com segurança que estamos no cliente.
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Se não estivermos no cliente, não renderizamos nada, esperando a hidratação do cliente.
  if (!isClient) {
    return null; // Ou um componente de loading global, se preferir.
  }

  return <FirebaseProvider>{children}</FirebaseProvider>;
}

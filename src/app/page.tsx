'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase/provider';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { USERS } from '@/lib/data';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/app/components/Logo';

export default function LoginPage() {
  const { user, auth, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    if (!email) {
      toast({
        title: 'Campo incompleto',
        description: 'Por favor, selecione um colaborador.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoggingIn(true);
    const password = 'uxua123';

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Login bem-sucedido!',
        description: 'Redirecionando para o painel...',
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      let description = 'Ocorreu um erro desconhecido.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = 'Colaborador não encontrado ou não ativado no sistema. Fale com o administrador.';
      } else if (error.code === 'auth/invalid-api-key') {
        description = 'Erro de configuração: Chave de API do Firebase inválida. Contate o suporte.';
      }

      toast({
        title: 'Falha no Login',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading || (!loading && user)) {
    return <div className="flex h-screen w-full items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-fit">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Acessar Painel de Vistorias</CardTitle>
          <CardDescription>Selecione seu usuário para continuar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Colaborador</Label>
            <Select onValueChange={setEmail} value={email}>
              <SelectTrigger id="email">
                <SelectValue placeholder="Selecione o colaborador" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(USERS).map(([userEmail, userData]) => (
                  <SelectItem key={userEmail} value={userEmail}>
                    {userData.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin} disabled={isLoggingIn}>
            {isLoggingIn ? 'Entrando...' : 'Iniciar Vistoria'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

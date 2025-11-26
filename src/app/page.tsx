
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/app/components/Logo';
import { USERS } from '@/lib/data';
import { useAuth } from '@/firebase/provider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedEmail, setSelectedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { auth } = useAuth();
  
  const handleLogin = async () => {
    setIsLoading(true);
    const password = 'uxua123'; // Senha padrão para todos os usuários

    if (!auth) {
        toast({
            title: 'Erro de Autenticação',
            description: 'O serviço de autenticação não está disponível. Tente novamente mais tarde.',
            variant: 'destructive',
        });
        setIsLoading(false);
        return;
    }

    if (!selectedEmail) {
      toast({
        title: 'Seleção Incompleta',
        description: 'Por favor, selecione um usuário para continuar.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, selectedEmail, password);
      const user = userCredential.user;
      const userEmail = user.email;

      if (userEmail && USERS[userEmail]) {
        const userInfo = USERS[userEmail];
        toast({
          title: 'Login bem-sucedido!',
          description: `Bem-vindo, ${userInfo.name}! Redirecionando...`,
        });
        
        router.push('/dashboard');
      } else {
        throw new Error("Usuário não encontrado em nossa lista de permissões.");
      }

    } catch (error) {
      console.error("Firebase Auth Error:", error);
      toast({
        title: 'Erro no Login',
        description: 'Não foi possível fazer o login. Verifique se o usuário está ativo no Firebase.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Logo className="h-8 w-auto mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl font-extrabold">Bem-vindo</CardTitle>
          <CardDescription className="pt-1">Selecione sua conta para começar.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="user-select">Conta</Label>
               <Select onValueChange={setSelectedEmail} value={selectedEmail}>
                  <SelectTrigger id="user-select">
                    <SelectValue placeholder="-- Selecione um usuário --" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(USERS).map(([email, user]) => (
                      <SelectItem key={email} value={email}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
            
            <Button onClick={handleLogin} size="lg" disabled={isLoading || !selectedEmail}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

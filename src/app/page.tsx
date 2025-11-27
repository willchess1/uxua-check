'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/app/components/Logo';
import { useAuth } from '@/firebase/provider';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth, user, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Se o usuário já estiver logado, redirecione para o dashboard
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);


  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor, insira e-mail e senha.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoggingIn(true);

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
        description = 'E-mail ou senha inválidos. Verifique suas credenciais.';
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

  if (loading || user) {
    return <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">Carregando...</div>
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <Logo className="h-8 w-auto mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl font-extrabold">Bem-vindo</CardTitle>
          <CardDescription className="pt-1">Faça login para acessar o checklist de manutenção</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4">
               <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seu.email@uxua.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoggingIn}
                  />
               </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input 
                    id="password" 
                    type="password"
                    placeholder='********'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoggingIn}
                  />
               </div>
            </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <Button onClick={handleLogin} className="w-full" disabled={isLoggingIn}>
                {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoggingIn ? 'Entrando...' : 'Entrar'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">A senha para todos os usuários de teste é: uxua123</p>
        </CardFooter>
      </Card>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/app/components/Logo';
import { USERS } from '@/lib/data';
import { useAuth } from '@/lib/firebase/provider';

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { auth } = useAuth();
  
  const handleLogin = async () => {
    setIsLoading(true);

    if (!auth) {
        toast({
            title: 'Erro de Autenticação',
            description: 'O serviço de autenticação não está disponível. Tente novamente mais tarde.',
            variant: 'destructive',
        });
        setIsLoading(false);
        return;
    }

    if (!email || !password) {
      toast({
        title: 'Campos Incompletos',
        description: 'Por favor, preencha o e-mail e a senha.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
        title: 'Credenciais Inválidas',
        description: 'Verifique seu e-mail e senha e tente novamente.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Logo className="h-8 w-auto mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl font-extrabold">Bem-vindo</CardTitle>
          <CardDescription className="pt-1">Faça login para acessar o sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@uxua.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                onKeyPress={handleKeyPress}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
            <Button onClick={handleLogin} size="lg" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
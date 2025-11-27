"use client";

import { useState } from 'react';
import { useAuth } from '@/firebase/provider';
import { USERS } from '@/lib/data';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';

interface AdminAccessProps {
  onAdminAccessGranted: () => void;
}

export default function AdminAccessModal({ onAdminAccessGranted }: AdminAccessProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!user || !user.email) return null;

  const currentUserData = USERS[user.email];
  const isAuthorizedUser = currentUserData?.role === 'dev' || currentUserData?.role === 'manager';

  if (!isAuthorizedUser) {
    return null; // Não mostra o botão se o usuário não for dev ou gerente
  }

  const handleVerifyPassword = () => {
    setIsLoading(true);
    // Senha codificada para acesso administrativo
    const adminPassword = 'uxua1234';

    if (password === adminPassword) {
      toast({ title: 'Acesso concedido!', description: 'Funções administrativas liberadas.' });
      onAdminAccessGranted(); // Informa o componente pai que o acesso foi concedido
      setIsOpen(false);
    } else {
      toast({ title: 'Senha incorreta', description: 'Tente novamente.', variant: 'destructive' });
    } 
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Acesso Restrito (Gerente/Dev)</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Acesso à Área Restrita</DialogTitle>
          <DialogDescription>
            Digite a senha de administrador para acessar as funções de gerenciamento.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              className="col-span-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleVerifyPassword()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleVerifyPassword} disabled={isLoading}>
            {isLoading ? 'Verificando...' : 'Liberar Acesso'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

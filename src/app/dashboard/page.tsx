'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { TECHNICIANS, HOUSES, HOUSES_TO_INSPECT, USERS } from '@/lib/data';
import { Logo } from '@/app/components/Logo';
import type { User, House } from '@/lib/types';
import { ListChecks, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [technician, setTechnician] = useState('');
  const [houseId, setHouseId] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availableHouses, setAvailableHouses] = useState<House[]>([]);

  useEffect(() => {
    // This is a workaround for client-side auth. Will be replaced by server-side auth.
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    const fullUser = USERS[parsedUser.email];
    if (fullUser) {
        setCurrentUser(fullUser);
        setTechnician(fullUser.name); // Pre-select user's name

        // Determine which houses to display
        if (fullUser.role === 'supervisor') {
            setAvailableHouses(HOUSES.filter(h => HOUSES_TO_INSPECT.includes(h.id)));
        } else {
            setAvailableHouses(HOUSES);
        }

    } else {
         router.push('/');
    }

  }, [router]);

  const handleStartChecklist = () => {
    if (!technician || !houseId) {
      toast({
        title: 'Seleção Incompleta',
        description: 'Por favor, selecione seu nome e a casa antes de começar.',
        variant: 'destructive',
      });
      return;
    }
    router.push(`/checklist/${houseId}?technician=${encodeURIComponent(technician)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast({ title: 'Logout realizado com sucesso.' });
    router.push('/');
  }

  const getWelcomeMessage = () => {
    if (!currentUser) return 'Selecione para Iniciar a Vistoria';
    switch (currentUser.role) {
      case 'manager':
        return 'Bem-vinda, Gerente. O que faremos hoje?';
      case 'supervisor':
        return 'Bem-vindo, Supervisor. Revise as vistorias pendentes.';
      default:
        return 'Selecione para Iniciar a Vistoria';
    }
  };

  const isSelectionDisabled = currentUser?.role === 'supervisor';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Logo className="h-8 w-auto mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl font-extrabold">{currentUser?.name || 'Manutenção'}</CardTitle>
          <CardDescription className="pt-1">{getWelcomeMessage()}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentUser?.role === 'manager' && (
            <div className="grid gap-4">
               <Button onClick={() => router.push('/dashboard/select-houses')} size="lg">
                <ListChecks className="mr-2" />
                Selecionar Casas para Vistoria
              </Button>
               <Button size="lg" variant="secondary">
                Ver Relatórios (em breve)
              </Button>
            </div>
          )}

          {(currentUser?.role === 'dev' || currentUser?.role === 'technician' || currentUser?.role === 'supervisor') && (
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="technician-select">Seu Nome</Label>
                <Select onValueChange={setTechnician} value={technician} disabled={isSelectionDisabled}>
                  <SelectTrigger id="technician-select">
                    <SelectValue placeholder="-- Selecione seu nome --" />
                  </SelectTrigger>
                  <SelectContent>
                    {TECHNICIANS.map((tech) => (
                      <SelectItem key={tech} value={tech}>
                        {tech}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                 <Label htmlFor="house-select">
                  {currentUser?.role === 'supervisor' ? 'Casa a Inspecionar (Pendentes)' : 'Casa a Inspecionar'}
                </Label>
                <Select onValueChange={setHouseId} value={houseId}>
                  <SelectTrigger id="house-select">
                    <SelectValue placeholder={availableHouses.length > 0 ? "-- Selecione a Casa --" : "Nenhuma casa pendente"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableHouses.length > 0 ? (
                        availableHouses.map((house) => (
                        <SelectItem key={house.id} value={house.id}>
                            {house.name}
                        </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="no-houses" disabled>Nenhuma casa para vistoria</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleStartChecklist} size="lg" disabled={availableHouses.length === 0}>
                Iniciar Checklist
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
             <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
        </CardFooter>
      </Card>
    </main>
  );
}

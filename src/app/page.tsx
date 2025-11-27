'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { TECHNICIANS, HOUSES, USERS, HOUSES_TO_INSPECT } from '@/lib/data';
import { Logo } from '@/app/components/Logo';
import type { User, House } from '@/lib/types';
import { ListChecks, CalendarPlus, AreaChart, CheckSquare } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Start with a default user, bypassing Firebase auth for initial load.
  const [currentUser, setCurrentUser] = useState<User>(USERS['william@uxua.com']);
  const [technician, setTechnician] = useState(currentUser.name);
  const [houseId, setHouseId] = useState('');
  const [availableHouses, setAvailableHouses] = useState<House[]>([]);

  // Effect to update user-dependent state
  useEffect(() => {
    if (currentUser) {
      // Set the technician name based on the current user's role
      if (['technician', 'supervisor', 'dev'].includes(currentUser.role)) {
        setTechnician(currentUser.name);
      } else {
        setTechnician(''); // Clear technician if manager is selected who is not a tech
      }
      
      // Determine which houses are available based on role
      if (currentUser.role === 'manager' || currentUser.role === 'dev') {
        setAvailableHouses(HOUSES);
      } else {
        const housesToInspect = HOUSES.filter(h => HOUSES_TO_INSPECT.includes(h.id));
        setAvailableHouses(housesToInspect);
      }
      
      // Reset house selection when user changes
      setHouseId('');

    }
  }, [currentUser]);

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
  
  const handleUserChange = (email: string) => {
      const newUser = USERS[email];
      if (newUser) {
          setCurrentUser(newUser);
          toast({
              title: `Visão Alterada`,
              description: `Visualizando o painel como ${newUser.name} (${newUser.role}).`
          })
      }
  }

  const getWelcomeMessage = () => {
    if (!currentUser) return 'Selecione para Iniciar a Vistoria';
    switch (currentUser.role) {
      case 'manager':
        return 'Bem-vinda, Gerente. O que faremos hoje?';
      case 'supervisor':
        return 'Bem-vindo, Supervisor. Revise as vistorias pendentes.';
       case 'technician':
        return 'Bem-vindo, Técnico. Selecione uma casa para iniciar.';
      case 'dev':
        return 'Bem-vindo, Dev. Acesso total ao sistema.';
      default:
        return 'Bem-vindo! Selecione para iniciar.';
    }
  };
  
  const isTechnicianListDisabled = currentUser?.role !== 'dev' && currentUser?.role !== 'manager';
  
  const getHouseSelectLabel = () => {
    if (!currentUser) return 'Casa a Inspecionar';
    switch (currentUser.role) {
        case 'supervisor':
        case 'technician':
            return 'Casa para Vistoria (Pendentes)';
        case 'manager':
        case 'dev':
            return 'Casa a Inspecionar (Todas)';
        default:
            return 'Selecione a Casa';
    }
  }

  const showManagerTools = currentUser?.role === 'manager' || currentUser?.role === 'dev';
  const showTechnicianTools = currentUser?.role === 'technician' || currentUser?.role === 'supervisor' || currentUser?.role === 'dev';

  if (!currentUser) {
      return <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">Carregando...</div>
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Logo className="h-8 w-auto mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl font-extrabold">{currentUser.name}</CardTitle>
          <CardDescription className="pt-1">{getWelcomeMessage()}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4">
              {showManagerTools && (
                <div className="grid gap-4">
                  <Button onClick={() => router.push('/dashboard/select-houses')} size="lg">
                    <ListChecks className="mr-2" />
                    Selecionar Casas para Vistoria
                  </Button>
                  <Button onClick={() => router.push('/dashboard/schedule')} size="lg">
                    <CalendarPlus className="mr-2" />
                    Agendar Vistorias
                  </Button>
                  <Button onClick={() => router.push('/dashboard/completed-reports')} size="lg">
                    <CheckSquare className="mr-2" />
                    Vistorias Concluídas
                  </Button>
                  <Button onClick={() => router.push('/dashboard/reports')} size="lg" variant="secondary">
                     <AreaChart className="mr-2" />
                    Ver Relatórios com IA
                  </Button>
                </div>
              )}

              {showTechnicianTools && (
                <div className="grid gap-6 pt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="technician-select">Seu Nome</Label>
                    <Select onValueChange={setTechnician} value={technician} disabled={isTechnicianListDisabled}>
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
                      {getHouseSelectLabel()}
                    </Label>
                    <Select onValueChange={setHouseId} value={houseId}>
                      <SelectTrigger id="house-select">
                        <SelectValue placeholder={availableHouses.length > 0 ? "-- Selecione a Casa --" : "Nenhuma casa para vistoria"} />
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
            </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <Label htmlFor="user-switcher">Trocar Visão de Usuário</Label>
            <Select onValueChange={handleUserChange} defaultValue="william@uxua.com">
                <SelectTrigger id="user-switcher">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {Object.entries(USERS).map(([email, user]) => (
                        <SelectItem key={email} value={email}>
                            {user.name} ({user.role})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </CardFooter>
      </Card>
    </main>
  );
}

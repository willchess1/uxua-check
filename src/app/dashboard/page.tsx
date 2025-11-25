'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { TECHNICIANS, HOUSES } from '@/lib/data';
import { Logo } from '@/app/components/Logo';

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [technician, setTechnician] = useState('');
  const [houseId, setHouseId] = useState('');

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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <Logo className="h-8 w-auto mx-auto text-primary mb-4" />
          <CardTitle className="text-3xl font-extrabold">Manutenção</CardTitle>
          <CardDescription className="pt-1">Selecione para Iniciar a Vistoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="technician-select">Seu Nome (Técnico)</Label>
              <Select onValueChange={setTechnician} value={technician}>
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
              <Label htmlFor="house-select">Casa a Inspecionar</Label>
              <Select onValueChange={setHouseId} value={houseId}>
                <SelectTrigger id="house-select">
                  <SelectValue placeholder="-- Selecione a Casa --" />
                </SelectTrigger>
                <SelectContent>
                  {HOUSES.map((house) => (
                    <SelectItem key={house.id} value={house.id}>
                      {house.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleStartChecklist} size="lg">
              Iniciar Checklist
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

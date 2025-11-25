'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Calendar as CalendarIcon, CalendarPlus, X } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { HOUSES, TECHNICIANS, MOCK_SCHEDULED_INSPECTIONS, USERS } from '@/lib/data';
import type { User, ScheduledInspection, InspectionType } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

const INSPECTION_TYPES: InspectionType[] = ['Preventiva', 'Corretiva', 'Pós Check-out', 'Pré Check-in'];

export default function SchedulePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [houseId, setHouseId] = useState<string>('');
  const [technicianName, setTechnicianName] = useState<string>('');
  const [inspectionType, setInspectionType] = useState<InspectionType>('Preventiva');
  const [scheduledDate, setScheduledDate] = React.useState<Date>();
  
  const [inspections, setInspections] = useState<ScheduledInspection[]>(MOCK_SCHEDULED_INSPECTIONS);
  const [isCanceling, setIsCanceling] = useState<ScheduledInspection | null>(null);


  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    const fullUser = USERS[parsedUser.email];
    
    if (fullUser.role !== 'manager' && fullUser.role !== 'dev') {
        toast({
            title: 'Acesso Negado',
            description: 'Você não tem permissão para acessar esta página.',
            variant: 'destructive',
        });
        router.push('/dashboard');
        return;
    }
    setCurrentUser(fullUser);
  }, [router, toast]);

  const handleScheduleInspection = () => {
    if (!houseId || !technicianName || !scheduledDate || !inspectionType) {
        toast({
            title: 'Campos Incompletos',
            description: 'Por favor, preencha todos os campos para agendar a vistoria.',
            variant: 'destructive',
        });
        return;
    }

    const newInspection: ScheduledInspection = {
        id: new Date().toISOString(),
        houseId,
        houseName: HOUSES.find(h => h.id === houseId)?.name || 'Desconhecida',
        technicianName,
        scheduledDate,
        type: inspectionType,
        status: 'Agendada',
    };

    // This is a mock update. In a real app, this would be a server action.
    setInspections(prev => [...prev, newInspection].sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime()));
    
    toast({
        title: 'Vistoria Agendada!',
        description: `A vistoria na ${newInspection.houseName} foi agendada para ${technicianName}.`,
    });
    
    // Reset form
    setHouseId('');
    setTechnicianName('');
    setScheduledDate(undefined);
    setInspectionType('Preventiva');
  };
  
  const handleCancelInspection = (inspection: ScheduledInspection) => {
    // Mock update
    setInspections(prev => prev.map(i => i.id === inspection.id ? { ...i, status: 'Cancelada' } : i));
    toast({
        title: 'Vistoria Cancelada',
        description: `A vistoria na ${inspection.houseName} foi cancelada.`,
        variant: 'destructive',
    });
    setIsCanceling(null);
  };
  
  const handleMarkAsDone = (inspection: ScheduledInspection) => {
    // Mock update
    setInspections(prev => prev.map(i => i.id === inspection.id ? { ...i, status: 'Concluída' } : i));
    toast({
        title: 'Vistoria Concluída',
        description: `A vistoria na ${inspection.houseName} foi marcada como concluída.`,
    });
  };

  const getStatusBadgeVariant = (status: ScheduledInspection['status']) => {
    switch (status) {
        case 'Agendada': return 'default';
        case 'Concluída': return 'secondary';
        case 'Cancelada': return 'destructive';
        default: return 'outline';
    }
  }


  if (!currentUser) {
    return null; // or a loading spinner
  }

  return (
    <>
    <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20">
      <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold">Agendamento de Vistorias</h1>
          <Button asChild variant="ghost">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Dashboard
            </Link>
          </Button>
      </header>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Coluna de Agendamento */}
        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                <CardTitle>Agendar Nova Vistoria</CardTitle>
                <CardDescription>
                    Preencha os detalhes para criar um novo agendamento.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="house-select">Casa</Label>
                        <Select onValueChange={setHouseId} value={houseId}>
                            <SelectTrigger id="house-select">
                                <SelectValue placeholder="Selecione a Casa" />
                            </SelectTrigger>
                            <SelectContent>
                                {HOUSES.map((house) => (
                                    <SelectItem key={house.id} value={house.id}>{house.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="technician-select">Técnico</Label>
                        <Select onValueChange={setTechnicianName} value={technicianName}>
                            <SelectTrigger id="technician-select">
                                <SelectValue placeholder="Selecione o Técnico" />
                            </SelectTrigger>
                            <SelectContent>
                                {TECHNICIANS.map((tech) => (
                                    <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="inspection-type">Tipo de Vistoria</Label>
                        <Select onValueChange={(value: InspectionType) => setInspectionType(value)} value={inspectionType}>
                            <SelectTrigger id="inspection-type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {INSPECTION_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                         <Label>Data da Vistoria</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !scheduledDate && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {scheduledDate ? format(scheduledDate, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={scheduledDate}
                                onSelect={setScheduledDate}
                                initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <Button onClick={handleScheduleInspection} className="w-full">
                        <CalendarPlus className="mr-2" /> Agendar Vistoria
                    </Button>
                </CardContent>
            </Card>
        </div>
        
        {/* Coluna de Lista */}
        <div className="md:col-span-2">
            <Card>
                 <CardHeader>
                    <CardTitle>Vistorias Agendadas</CardTitle>
                    <CardDescription>Lista de vistorias futuras e passadas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {inspections.map(insp => (
                            <li key={insp.id} className="p-3 bg-secondary/50 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="font-bold text-card-foreground">{insp.houseName}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {insp.technicianName} • {format(insp.scheduledDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                    </div>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Badge variant={getStatusBadgeVariant(insp.status)}>{insp.status}</Badge>
                                        <Badge variant="outline">{insp.type}</Badge>
                                    </div>
                                </div>
                                {insp.status === 'Agendada' && (
                                <div className="flex gap-2 shrink-0">
                                    <Button size="sm" variant="outline" onClick={() => handleMarkAsDone(insp)}>Marcar como Concluída</Button>
                                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setIsCanceling(insp)}>
                                        <X className="mr-1.5 h-4 w-4" /> Cancelar
                                    </Button>
                                </div>
                                )}
                            </li>
                        ))}
                        {inspections.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma vistoria agendada.</p>}
                    </ul>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
    
    <AlertDialog open={!!isCanceling} onOpenChange={(open) => !open && setIsCanceling(null)}>
        <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
                Você tem certeza que deseja cancelar a vistoria na casa <strong>{isCanceling?.houseName}</strong> agendada para <strong>{isCanceling?.technicianName}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsCanceling(null)}>Manter Agendamento</AlertDialogCancel>
            <AlertDialogAction onClick={() => isCanceling && handleCancelInspection(isCanceling)} className="bg-destructive hover:bg-destructive/90">
                Sim, Cancelar
            </AlertDialogAction>
        </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

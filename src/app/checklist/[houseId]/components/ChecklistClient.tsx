'use client';

import { useState, useMemo, useRef } from 'react';
import { Wand2, X, ChevronRight, Camera, Trash2 } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { CHECKLIST_ITEMS, INITIAL_STATE, STATUS_MAP } from '@/lib/data';
import type { ChecklistItem, ChecklistState, Status } from '@/lib/types';
import { getSummary } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ChecklistClientProps {
  houseId: string;
  houseName: string;
  technician: string;
}

const generateInitialState = (): ChecklistState => {
  const state: ChecklistState = {};
  CHECKLIST_ITEMS.forEach(item => {
    state[item.id] = { ...INITIAL_STATE };
  });
  return state;
};

const MAX_PHOTOS = 3;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;


export function ChecklistClient({ houseName }: ChecklistClientProps) {
  const [checklistState, setChecklistState] = useState<ChecklistState>(generateInitialState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<ChecklistItem | null>(null);
  const [modalStatus, setModalStatus] = useState<Status>(0);
  const [modalNote, setModalNote] = useState('');
  const [modalPhotos, setModalPhotos] = useState<string[]>([]);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summary, setSummary] = useState({title: '', description: ''});
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleItemClick = (item: ChecklistItem) => {
    setCurrentItem(item);
    const state = checklistState[item.id] || INITIAL_STATE;
    setModalStatus(state.status);
    setModalNote(state.note);
    setModalPhotos(state.photos);
    setIsModalOpen(true);
  };

  const handleSaveModal = () => {
    if (!currentItem) return;

    if (modalStatus === 3 && modalNote.trim() === '') {
      toast({
        title: 'Observação Obrigatória',
        description: 'Para o status "Problema Persistente", a descrição é obrigatória.',
        variant: 'destructive',
      });
      return;
    }

    const newChecklistState = {
      ...checklistState,
      [currentItem.id]: {
        status: modalStatus,
        note: (modalStatus === 2 || modalStatus === 3) ? modalNote : '',
        photos: modalPhotos,
      },
    };
    setChecklistState(newChecklistState);
    toast({
        title: "Item Atualizado",
        description: `${currentItem.description} foi salvo com sucesso.`,
    });
    setIsModalOpen(false);
  };

  const handleResetChecklist = () => {
    setChecklistState(generateInitialState());
    toast({
        title: `Checklist de ${houseName} Redefinido`,
        description: "Todos os itens foram marcados como 'Pendente'.",
        variant: 'destructive'
    });
  };
  
  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    const problematicItems = Object.entries(checklistState)
      .filter(([, state]) => state.status === 3)
      .reduce((acc, [id, state]) => {
        const item = CHECKLIST_ITEMS.find(i => i.id === id);
        if (item) {
          acc[item.description] = { status: state.status, note: state.note };
        }
        return acc;
      }, {} as Record<string, { status: number; note: string }>);

    if (Object.keys(problematicItems).length === 0) {
      toast({
        title: 'Nenhum problema persistente',
        description: 'Não há itens marcados como "Problema Persistente" para resumir.',
      });
      setIsSummaryLoading(false);
      return;
    }

    const result = await getSummary({ houseName, checklistData: problematicItems });
    setIsSummaryLoading(false);

    if (result.success && result.summary) {
        setSummary({
            title: `Resumo de Problemas - ${houseName}`,
            description: result.summary,
        });
        setIsSummaryDialogOpen(true);
    } else {
      toast({
        title: 'Erro ao gerar resumo',
        description: result.error || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    }
  };

  const handlePhotoUploadClick = () => {
    fileInputRef.current?.click();
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
        const file = event.target.files[0];
        if (modalPhotos.length >= MAX_PHOTOS) {
            toast({
                title: 'Limite de fotos atingido',
                description: `Você só pode adicionar até ${MAX_PHOTOS} fotos por item.`,
                variant: 'destructive',
            });
            return;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            toast({
                title: 'Arquivo muito grande',
                description: `A foto deve ter no máximo ${MAX_FILE_SIZE_MB}MB.`,
                variant: 'destructive',
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setModalPhotos(prev => [...prev, e.target.result as string]);
            }
        };
        reader.readAsDataURL(file);
    }
  }

  const handleRemovePhoto = (index: number) => {
    setModalPhotos(prev => prev.filter((_, i) => i !== index));
  }


  const categorizedItems = useMemo(() => {
    return CHECKLIST_ITEMS.reduce((acc, item) => {
      (acc[item.category] = acc[item.category] || []).push(item);
      return acc;
    }, {} as Record<string, ChecklistItem[]>);
  }, []);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <X className="mr-2 h-4 w-4"/> Iniciar Nova Vistoria
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação limpará todos os status, notas e fotos do checklist para a casa {houseName}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetChecklist}>Sim, Iniciar Nova</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button onClick={handleGenerateSummary} disabled={isSummaryLoading} className="w-full bg-indigo-600 hover:bg-indigo-700">
           <Wand2 className="mr-2 h-4 w-4" />
          {isSummaryLoading ? 'Gerando...' : 'Resumir Problemas com IA'}
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(categorizedItems).map(([category, items]) => (
          <Card key={category} className="overflow-hidden shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-primary">{category}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {items.map((item) => {
                  const state = checklistState[item.id] || INITIAL_STATE;
                  const statusInfo = STATUS_MAP[state.status];
                  return (
                    <li key={item.id} onClick={() => handleItemClick(item)} className="cursor-pointer hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center p-4">
                        <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg text-white", statusInfo.color)}>
                            {statusInfo.icon}
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="font-medium text-card-foreground">{item.description}</p>
                           <div className="flex items-center gap-2 flex-wrap mt-1">
                                <Badge variant={state.status === 3 ? "destructive" : "secondary"}>
                                    Status: {statusInfo.label}
                                </Badge>
                                {state.photos.length > 0 && (
                                    <Badge variant="outline">
                                        <Camera className="mr-1.5 h-3 w-3" />
                                        {state.photos.length} {state.photos.length > 1 ? 'fotos' : 'foto'}
                                    </Badge>
                                )}
                           </div>
                          {state.note && (state.status === 2 || state.status === 3) && (
                            <p className={cn("text-xs mt-2 font-medium italic", state.status === 3 ? 'text-destructive/80' : 'text-muted-foreground')}>
                              &quot;{state.note}&quot;
                            </p>
                          )}
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentItem?.description}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div>
              <Label className="text-sm font-semibold mb-3 block">Selecione o Status</Label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(STATUS_MAP) as unknown as (keyof typeof STATUS_MAP)[]).map((statusKey) => (
                  <Button
                    key={statusKey}
                    variant={modalStatus === statusKey ? 'default' : 'outline'}
                    onClick={() => setModalStatus(statusKey)}
                    className={cn(
                      "h-auto py-3 justify-start text-sm font-semibold",
                      modalStatus === statusKey && `${STATUS_MAP[statusKey].color} text-white border-transparent hover:${STATUS_MAP[statusKey].color}`
                    )}
                  >
                    <span className="mr-3 text-lg">{STATUS_MAP[statusKey].icon}</span> {STATUS_MAP[statusKey].label}
                  </Button>
                ))}
              </div>
            </div>

            {(modalStatus === 2 || modalStatus === 3) && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <Label htmlFor="modal-note">
                  Observação {modalStatus === 3 ? '(Obrigatório)' : '(Opcional)'}
                </Label>
                <Textarea
                  id="modal-note"
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  placeholder={modalStatus === 3 ? "Detalhes sobre o problema e qual a ação pendente." : "Detalhes sobre a resolução."}
                  rows={3}
                />
              </div>
            )}
            
            <div className="space-y-3">
                <Label className="text-sm font-semibold">📸 Fotos do Item ({modalPhotos.length}/{MAX_PHOTOS})</Label>
                <div className="grid grid-cols-3 gap-2">
                    {modalPhotos.map((photo, index) => (
                        <div key={index} className="relative group aspect-square">
                            <Image src={photo} alt={`Foto ${index + 1}`} layout="fill" objectFit="cover" className="rounded-md" />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemovePhoto(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handlePhotoUploadClick}
                    disabled={modalPhotos.length >= MAX_PHOTOS}
                >
                    <Camera className="mr-2 h-4 w-4" /> Tirar/Escolher Foto
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveModal} className="bg-indigo-600 hover:bg-indigo-700">Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{summary.title}</AlertDialogTitle>
              <AlertDialogDescription className="whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                {summary.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Fechar</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </>
  );
}

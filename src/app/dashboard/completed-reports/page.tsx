'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, CheckCircle, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { USERS } from '@/lib/data';
import type { User, CompletedChecklist } from '@/lib/types';
import { useAuth, useDb } from '@/lib/firebase/provider';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

export default function CompletedReportsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { auth } = useAuth();
  const { db } = useDb();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reports, setReports] = useState<CompletedChecklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<CompletedChecklist | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        const fullUser = USERS[user.email];
        if (fullUser && (fullUser.role === 'manager' || fullUser.role === 'dev')) {
          setCurrentUser(fullUser);
        } else {
          toast({ title: 'Acesso Negado', variant: 'destructive' });
          router.push('/dashboard');
        }
      } else if (!user) {
        router.push('/');
      }
    });

    return () => unsubscribeAuth();
  }, [auth, router, toast]);

  useEffect(() => {
    if (!currentUser || !db) return;

    const q = query(collection(db, "completedChecklists"), orderBy("completedAt", "desc"));
    const unsubscribeReports = onSnapshot(q, (querySnapshot) => {
      const fetchedReports: CompletedChecklist[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const report: CompletedChecklist = {
          ...data,
          completedAt: (data.completedAt as Timestamp).toDate(),
        } as CompletedChecklist;
        fetchedReports.push(report);
      });
      setReports(fetchedReports);
      setIsLoading(false);
    }, (error) => {
        console.error("Error fetching reports: ", error);
        toast({ title: 'Erro ao carregar relatórios', description: 'Não foi possível buscar as vistorias concluídas.', variant: 'destructive'});
        setIsLoading(false);
    });

    return () => unsubscribeReports();
  }, [currentUser, db, toast]);

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20">
        <header className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold">Vistorias Concluídas</h1>
            <p className="text-muted-foreground">Revise os relatórios enviados pelos técnicos.</p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Dashboard
            </Link>
          </Button>
        </header>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-2 p-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-20 px-6">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Nenhum Relatório</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ainda não há vistorias concluídas e enviadas pelos técnicos.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {reports.map((report) => (
                  <li key={report.id} onClick={() => setSelectedReport(report)} className="p-4 hover:bg-secondary/50 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                             {report.hasPersistentProblems ? (
                                <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0" />
                            ) : (
                                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                            )}
                            <div>
                                <p className="font-semibold text-card-foreground">{report.houseName}</p>
                                <p className="text-sm text-muted-foreground">
                                    Por {report.technician} em {format(report.completedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <Badge variant={report.hasPersistentProblems ? 'destructive' : 'secondary'}>
                                {report.hasPersistentProblems ? 'Problemas' : 'Tudo OK'}
                            </Badge>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

       {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Relatório da {selectedReport.houseName}</DialogTitle>
                    <DialogDescription>
                        Enviado por {selectedReport.technician} em {format(selectedReport.completedAt, "dd 'de' LLLL 'de' yyyy, HH:mm", { locale: ptBR })}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-6">
                    <div className="space-y-4 my-4">
                        <h4 className="font-semibold text-lg">Resumo da IA</h4>
                        <p className="text-sm text-muted-foreground p-3 bg-secondary/50 rounded-md whitespace-pre-wrap">{selectedReport.summary}</p>
                    </div>
                     <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Detalhes dos Itens</h4>
                        <ul className="divide-y divide-border rounded-md border">
                            {Object.entries(selectedReport.items).map(([itemId, itemState]) => (
                                <li key={itemId} className="p-3 text-sm">
                                    <p className="font-medium">Item: {itemId}</p>
                                    <p>Status: {itemState.status}</p>
                                    {itemState.note && <p>Nota: "{itemState.note}"</p>}
                                    {itemState.photos && itemState.photos.length > 0 && <p>Fotos: {itemState.photos.length}</p>}
                                </li>
                            ))}
                        </ul>
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setSelectedReport(null)}>Fechar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
       )}
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar } from 'recharts';
import { ArrowLeft, Bot, Activity } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { USERS, MOCK_CHECKLIST_DATA } from '@/lib/data';
import type { User } from '@/lib/types';
import { performMaintenanceAnalysis, AnalyzeMaintenanceDataOutput } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/firebase/provider';


const PIE_COLORS = { ok: '#16a34a', pendente: '#facc15', resolvido: '#4f46e5', persistente: '#dc2626' };

export default function ReportsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeMaintenanceDataOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { auth } = useAuth();

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, user => {
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
    return () => unsubscribe();
  }, [auth, router, toast]);
  
  const handleGenerateReport = async () => {
    setIsLoading(true);
    setAnalysis(null);
    try {
        // In a real app, you would fetch this data from Firestore
        const result = await performMaintenanceAnalysis({ checklists: MOCK_CHECKLIST_DATA });
        if(result.success && result.analysis) {
            setAnalysis(result.analysis);
            toast({
                title: 'Análise Concluída',
                description: 'O relatório foi gerado com sucesso pela IA.',
            });
        } else {
            throw new Error(result.error || 'A análise falhou.');
        }
    } catch (error) {
        console.error(error);
        toast({
            title: 'Erro na Análise',
            description: 'Não foi possível gerar o relatório. Tente novamente.',
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  }
  
  const pieData = analysis ? [
      { name: 'OK', value: analysis.overallStatus.ok },
      { name: 'Pendente', value: analysis.overallStatus.pending },
      { name: 'Resolvido', value: analysis.overallStatus.resolved },
      { name: 'Persistente', value: analysis.overallStatus.persisting },
  ].filter(item => item.value > 0) : [];

  if (!currentUser) {
    return <LoadingSkeleton />; // Show skeleton while checking user
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 pb-20">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">Relatórios e Análise de IA</h1>
            <p className="text-muted-foreground">Visão geral da saúde operacional do hotel.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost">
                <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Link>
            </Button>
             <Button onClick={handleGenerateReport} disabled={isLoading}>
                <Bot className="mr-2 h-4 w-4"/> 
                {isLoading ? 'Analisando Dados...' : 'Gerar Relatório com IA'}
            </Button>
          </div>
      </header>
      
      {!analysis && !isLoading && (
        <Card className="text-center py-20">
            <CardHeader>
                <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
                <CardTitle className="mt-4">Pronto para Análise</CardTitle>
                <CardDescription>Clique no botão "Gerar Relatório com IA" para processar os dados de vistorias <br/> e obter insights sobre a manutenção.</CardDescription>
            </CardHeader>
        </Card>
      )}

      {isLoading && <LoadingSkeleton />}

      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Resumo Executivo da IA</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{analysis.executiveSummary}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Saúde Geral das Vistorias</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name">
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name.toLowerCase() as keyof typeof PIE_COLORS]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value} itens`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Casas com Mais Problemas</CardTitle>
                    <CardDescription>Ranking de casas por nº de problemas persistentes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={analysis.topProblematicHouses} layout="vertical" margin={{ top: 5, right: 20, left: 50, bottom: 5 }}>
                             <XAxis type="number" allowDecimals={false} />
                             <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                             <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} formatter={(value) => `${value} problemas`}/>
                             <Bar dataKey="value" name="Problemas" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Itens Mais Problemáticos</CardTitle>
                    <CardDescription>Itens com mais ocorrências de "Problema Persistente".</CardDescription>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={analysis.topProblematicItems} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                             <XAxis type="number" allowDecimals={false} />
                             <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12 }} interval={0} />
                             <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} formatter={(value) => `${value} ocorrências`}/>
                             <Bar dataKey="value" name="Ocorrências" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]}/>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-3">
                <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent className="flex justify-center items-center">
                    <Skeleton className="h-[250px] w-[250px] rounded-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent>
                    <Skeleton className="h-[250px] w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent>
                    <Skeleton className="h-[250px] w-full" />
                </CardContent>
            </Card>
        </div>
    )
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { HOUSES, HOUSES_TO_INSPECT } from '@/lib/data';
import type { User } from '@/lib/types';
import Link from 'next/link';

export default function SelectHousesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedHouses, setSelectedHouses] = useState<string[]>(HOUSES_TO_INSPECT);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'manager' && parsedUser.role !== 'dev') {
        toast({
            title: 'Acesso Negado',
            description: 'Você não tem permissão para acessar esta página.',
            variant: 'destructive',
        });
        router.push('/dashboard');
        return;
    }
    setCurrentUser(parsedUser);
  }, [router, toast]);

  const handleHouseToggle = (houseId: string) => {
    setSelectedHouses((prev) =>
      prev.includes(houseId) ? prev.filter((id) => id !== houseId) : [...prev, houseId]
    );
  };

  const handleSaveChanges = () => {
    // In a real app, this would be a server action to update the database.
    // For now, we just show a toast. The mock data `HOUSES_TO_INSPECT` is not actually updated.
    console.log("Casas selecionadas para vistoria:", selectedHouses);
    toast({
      title: 'Lista de Vistoria Atualizada',
      description: `${selectedHouses.length} casas foram marcadas para a próxima vistoria.`,
    });
    router.push('/dashboard');
  };

  if (!currentUser) {
    return null; // or a loading spinner
  }

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 pb-20">
      <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold">Selecionar Casas</h1>
          <Button asChild variant="ghost">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Dashboard
            </Link>
          </Button>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle>Casas para Vistoria</CardTitle>
          <CardDescription>
            Marque as casas que devem ser incluídas na próxima rodada de vistorias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {HOUSES.map((house) => (
              <div key={house.id} className="flex items-center space-x-3 p-3 rounded-md hover:bg-secondary/50 transition-colors">
                <Checkbox
                  id={house.id}
                  checked={selectedHouses.includes(house.id)}
                  onCheckedChange={() => handleHouseToggle(house.id)}
                />
                <Label htmlFor={house.id} className="text-base font-medium cursor-pointer flex-1">
                  {house.name}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6">
        <Button onClick={handleSaveChanges} size="lg" className="w-full">
            <ListChecks className="mr-2"/>
            Salvar Lista de Vistoria
        </Button>
      </div>
    </div>
  );
}

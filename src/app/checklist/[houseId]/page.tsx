import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { HOUSES } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ChecklistClient } from './components/ChecklistClient';

type ChecklistPageProps = {
  params: { houseId: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function ChecklistPage({ params, searchParams }: ChecklistPageProps) {
  const house = HOUSES.find((h) => h.id === params.houseId);
  const technician = searchParams.technician || 'Não especificado';
  const inspectionIdParam = searchParams.inspectionId || `${params.houseId}-${new Date().toISOString().split('T')[0]}`;
  const inspectionId = Array.isArray(inspectionIdParam) ? inspectionIdParam[0] : inspectionIdParam;

  if (!house) {
    notFound();
  }

  return (
    <div className="max-w-xl mx-auto p-4 md:p-6 pb-20">
      <header className="bg-primary text-primary-foreground p-6 rounded-2xl shadow-2xl mb-6">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1">{house.name}</h1>
          <Button asChild variant="ghost" className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10 h-auto p-2 -mr-2 -mt-2">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" /> Mudar Casa
            </Link>
          </Button>
        </div>
        <p className="text-primary-foreground/80 text-sm">Técnico: {Array.isArray(technician) ? technician[0] : technician}</p>
      </header>
      
      <ChecklistClient 
        houseId={house.id}
        houseName={house.name}
        technician={Array.isArray(technician) ? technician[0] : technician}
        inspectionId={inspectionId}
      />
    </div>
  );
}

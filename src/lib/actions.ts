'use server';

import { summarizePropertyIssues, type SummarizePropertyIssuesInput } from '@/ai/flows/summarize-property-issues';
import { analyzeMaintenanceData, type AnalyzeMaintenanceDataInput, type AnalyzeMaintenanceDataOutput } from '@/ai/flows/analyze-maintenance-data';
import { doc, setDoc } from "firebase/firestore";
import { getFirestore } from 'firebase/firestore';
import { getFirebaseApp } from './firebase/config';
import type { ChecklistState, CompletedChecklist } from './types';

// Get a Firestore instance
const app = getFirebaseApp();
const db = getFirestore(app);

export async function getSummary(input: SummarizePropertyIssuesInput) {
    try {
        const { summary } = await summarizePropertyIssues(input);
        return { success: true, summary };
    } catch (error) {
        console.error("Error getting summary from AI:", error);
        return { success: false, error: 'Failed to generate summary.' };
    }
}

export async function performMaintenanceAnalysis(input: AnalyzeMaintenanceDataInput): Promise<{ success: boolean; analysis?: AnalyzeMaintenanceDataOutput; error?: string; }> {
    try {
        const analysis = await analyzeMaintenanceData(input);
        return { success: true, analysis };
    } catch (error) {
        console.error("Error getting analysis from AI:", error);
        return { success: false, error: 'Failed to generate analysis.' };
    }
}


export async function submitChecklistReport({ houseId, houseName, technician, checklistState }: { houseId: string; houseName: string; technician: string; checklistState: ChecklistState; }) {
    try {
        const persistentProblemItems = Object.entries(checklistState)
            .filter(([, state]) => state.status === 3)
            .reduce((acc, [id, state]) => {
                const item = CHECKLIST_ITEMS.find(i => i.id === id);
                if (item) {
                   acc[item.description] = { status: state.status, note: state.note };
                }
                return acc;
            }, {} as Record<string, { status: number; note: string; }>);
        
        let summary = "Nenhum problema persistente encontrado.";
        const hasPersistentProblems = Object.keys(persistentProblemItems).length > 0;

        if (hasPersistentProblems) {
            const summaryResult = await getSummary({ houseName, checklistData: persistentProblemItems });
            if (summaryResult.success && summaryResult.summary) {
                summary = summaryResult.summary;
            } else {
                summary = "Não foi possível gerar um resumo dos problemas persistentes.";
            }
        }

        const reportId = `${houseId}-${new Date().toISOString()}`;
        const completedAt = new Date();
        
        const reportData: CompletedChecklist = {
            id: reportId,
            houseId,
            houseName,
            technician,
            completedAt,
            summary,
            items: checklistState,
            hasPersistentProblems
        };

        const reportRef = doc(db, "completedChecklists", reportId);
        await setDoc(reportRef, reportData);

        return { success: true, reportId };

    } catch (error) {
        console.error("Error submitting checklist report:", error);
        return { success: false, error: "Falha ao enviar o relatório. Tente novamente." };
    }
}

// HACK: We need to define CHECKLIST_ITEMS here because of a bug with server actions
const CHECKLIST_ITEMS = [
    { id: 'ac_func', category: 'Climatização', description: 'Ar Condicionado (Funcionamento, Temperaturas)' },
    { id: 'ventiladores', category: 'Climatização', description: 'Ventiladores de Teto/Piso (Funcionamento, Ruído)' },
    { id: 'lampadas_geral', category: 'Iluminação', description: 'Todas as Lâmpadas (Acionamento, Intensidade)' },
    { id: 'dimmers', category: 'Iluminação', description: 'Dimmers e Luminárias Especiais (Regulagem)' },
    { id: 'tomadas', category: 'Iluminação', description: 'Tomadas (Aparência, Tensão de Saída - Teste)' },
    { id: 'vazamentos', category: 'Hidráulica', description: 'Vazamentos Visíveis (Sob pias, chuveiros, vasos)' },
    { id: 'pressao_agua', category: 'Hidráulica', description: 'Pressão da Água (Torneiras e Chuveiros)' },
    { id: 'descargas', category: 'Hidráulica', description: 'Descargas (Acionamento e Vedação)' },
    { id: 'ralos', category: 'Hidráulica', description: 'Ralos (Drenagem Rápida e Ausência de Cheiro)' },
    { id: 'aquecedor_gas', category: 'Hidráulica', description: 'Aquecedor a Gás (Funcionamento, Vazamentos)' },
    { id: 'portas_janelas', category: 'Estrutural', description: 'Portas, Janelas e Cortinas (Abertura, Travamento)' },
    { id: 'moveis', category: 'Estrutural', description: 'Móveis (Estabilidade, Danos visíveis, Ruídos)' },
    { id: 'acabamentos', category: 'Estrutural', description: 'Paredes/Teto (Infiltrações, Mofo, Pintura)' },
    { id: 'minibar', category: 'Eletro/Extras', description: 'Minibar/Geladeira (Funcionamento, Temperatura, Limpeza)' },
    { id: 'cofre', category: 'Eletro/Extras', description: 'Cofre (Testar Travamento e Resetar Senha)' },
    { id: 'av', category: 'Eletro/Extras', description: 'TV e Som (Canais, Conexões, Controles)' },
];

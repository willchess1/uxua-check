'use server';

import { summarizePropertyIssues, type SummarizePropertyIssuesInput } from '@/ai/flows/summarize-property-issues';
import { analyzeMaintenanceData, type AnalyzeMaintenanceDataInput, type AnalyzeMaintenanceDataOutput } from '@/ai/flows/analyze-maintenance-data';
import { doc, setDoc } from "firebase/firestore";
import { db } from './firebase/config';
import type { ChecklistState, CompletedChecklist } from './types';


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
                acc[id] = { status: state.status, note: state.note };
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

        // In a real app, you might want to use a specific inspection ID
        const reportRef = doc(db, "completedChecklists", reportId);
        await setDoc(reportRef, reportData);

        return { success: true, reportId };

    } catch (error) {
        console.error("Error submitting checklist report:", error);
        return { success: false, error: "Falha ao enviar o relatório. Tente novamente." };
    }
}
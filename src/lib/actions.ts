'use server';

import { summarizePropertyIssues, type SummarizePropertyIssuesInput } from '@/ai/flows/summarize-property-issues';
import { analyzeMaintenanceData, type AnalyzeMaintenanceDataInput, type AnalyzeMaintenanceDataOutput } from '@/ai/flows/analyze-maintenance-data';

export async function getSummary(input: SummarizePropertyIssuesInput) {
    try {
        const { summary } = await summarizePropertyIssues(input);
        return { success: true, summary };
    } catch (error) {
        console.error("Error getting summary from AI:", error);
        return { success: false, error: 'Failed to generate summary.' };
    }
}

// Renamed for clarity to avoid confusion with the server action name.
export async function performMaintenanceAnalysis(input: AnalyzeMaintenanceDataInput): Promise<{ success: boolean; analysis?: AnalyzeMaintenanceDataOutput; error?: string; }> {
    try {
        const analysis = await analyzeMaintenanceData(input);
        return { success: true, analysis };
    } catch (error) {
        console.error("Error getting analysis from AI:", error);
        return { success: false, error: 'Failed to generate analysis.' };
    }
}

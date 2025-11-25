'use server';

/**
 * @fileOverview Analyzes maintenance checklist data across all properties to generate insights and summaries.
 *
 * - analyzeMaintenanceData - A function that takes comprehensive checklist data and returns structured analysis for a dashboard.
 * - AnalyzeMaintenanceDataInput - The input type for the function.
 * - AnalyzeMaintenanceDataOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Using raw checklist data as input. In a real scenario, this could be fetched from a DB.
const AnalyzeMaintenanceDataInputSchema = z.object({
  checklists: z.array(z.object({
    houseName: z.string(),
    items: z.record(z.string(), z.object({
      status: z.number(),
      note: z.string(),
    }))
  })).describe('An array of all checklist data from all houses.')
});
export type AnalyzeMaintenanceDataInput = z.infer<typeof AnalyzeMaintenanceDataInputSchema>;


const ChartDataItemSchema = z.object({
  name: z.string().describe('The label for the data point (e.g., house name or item description).'),
  value: z.number().describe('The numerical value for the data point (e.g., count of problems).'),
});

const AnalyzeMaintenanceDataOutputSchema = z.object({
  overallStatus: z.object({
    ok: z.number().describe('Total count of items marked as "OK".'),
    pending: z.number().describe('Total count of items marked as "Pendente".'),
    resolved: z.number().describe('Total count of items marked as "Problema Resolvido".'),
    persisting: z.number().describe('Total count of items marked as "Problema Persistente".'),
  }),
  topProblematicHouses: z.array(ChartDataItemSchema).describe('A list of houses ranked by the number of persisting problems, from most to least.'),
  topProblematicItems: z.array(ChartDataItemSchema).describe('A list of checklist items ranked by how often they are marked as a persisting problem, from most to least.'),
  executiveSummary: z.string().describe('A concise, natural language summary of the overall maintenance status, highlighting critical areas and positive points.'),
});
export type AnalyzeMaintenanceDataOutput = z.infer<typeof AnalyzeMaintenanceDataOutputSchema>;


export async function analyzeMaintenanceData(input: AnalyzeMaintenanceDataInput): Promise<AnalyzeMaintenanceDataOutput> {
  return analyzeMaintenanceDataFlow(input);
}


const analyzeMaintenanceDataPrompt = ai.definePrompt({
  name: 'analyzeMaintenanceDataPrompt',
  input: {schema: AnalyzeMaintenanceDataInputSchema},
  output: {schema: AnalyzeMaintenanceDataOutputSchema},
  prompt: `You are a hotel operations analyst AI. Your task is to analyze the provided checklist data from various houses and generate a structured report for the hotel manager.

Checklist Data:
{{JSON checklists}}

Status Key:
- 0: Pendente
- 1: OK
- 2: Problema Resolvido
- 3: Problema Persistente

Instructions:
1.  **Calculate Overall Status:** Count the total number of items for each status across all checklists and populate the 'overallStatus' object.
2.  **Identify Top Problematic Houses:** Count the number of items with status 3 ("Problema Persistente") for each house. Create a sorted list for 'topProblematicHouses', with the house having the most problems first.
3.  **Identify Top Problematic Items:** Count how many times each specific checklist item (e.g., "Ar Condicionado") has been marked with status 3 across all houses. Create a sorted list for 'topProblematicItems' with the most frequently problematic item first.
4.  **Generate Executive Summary:** Write a brief, insightful "executiveSummary" in Portuguese. It should summarize the key findings from the data. Mention the house with the most issues and the most common problem. Also, point out if the overall situation is good (e.g., a high number of "OK" statuses).
`,
});

const analyzeMaintenanceDataFlow = ai.defineFlow(
  {
    name: 'analyzeMaintenanceDataFlow',
    inputSchema: AnalyzeMaintenanceDataInputSchema,
    outputSchema: AnalyzeMaintenanceDataOutputSchema,
  },
  async input => {
    const {output} = await analyzeMaintenanceDataPrompt(input);
    return output!;
  }
);

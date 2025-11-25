'use server';

/**
 * @fileOverview Summarizes ongoing maintenance issues for a given property based on checklist data.
 *
 * - summarizePropertyIssues - A function that takes a house ID and checklist data, then summarizes the ongoing maintenance issues.
 * - SummarizePropertyIssuesInput - The input type for the summarizePropertyIssues function.
 * - SummarizePropertyIssuesOutput - The return type for the summarizePropertyIssues function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePropertyIssuesInputSchema = z.object({
  houseName: z.string().describe('The name of the house to summarize issues for.'),
  checklistData: z.record(z.object({
    status: z.number().describe('The status code of the checklist item (0: Pending, 1: OK, 2: Problem Resolved, 3: Problem Persisting).'),
    note: z.string().describe('Notes on the checklist item.'),
  })).describe('Checklist data where the keys are the checklist item IDs, the values are status codes with notes.'),
});
export type SummarizePropertyIssuesInput = z.infer<typeof SummarizePropertyIssuesInputSchema>;

const SummarizePropertyIssuesOutputSchema = z.object({
  summary: z.string().describe('A summary of the ongoing maintenance issues for the property.'),
});
export type SummarizePropertyIssuesOutput = z.infer<typeof SummarizePropertyIssuesOutputSchema>;

export async function summarizePropertyIssues(input: SummarizePropertyIssuesInput): Promise<SummarizePropertyIssuesOutput> {
  return summarizePropertyIssuesFlow(input);
}

const summarizePropertyIssuesPrompt = ai.definePrompt({
  name: 'summarizePropertyIssuesPrompt',
  input: {schema: SummarizePropertyIssuesInputSchema},
  output: {schema: SummarizePropertyIssuesOutputSchema},
  prompt: `You are a hotel manager tasked with summarizing maintenance issues for a property.

  Based on the checklist data provided, identify any ongoing maintenance issues (status code 3).

  Summarize these issues into a concise summary, mentioning the house name.

  House Name: {{{houseName}}}
  Checklist Data: {{JSON checklistData}}

  Summary:`,
});

const summarizePropertyIssuesFlow = ai.defineFlow(
  {
    name: 'summarizePropertyIssuesFlow',
    inputSchema: SummarizePropertyIssuesInputSchema,
    outputSchema: SummarizePropertyIssuesOutputSchema,
  },
  async input => {
    const {output} = await summarizePropertyIssuesPrompt(input);
    return output!;
  }
);

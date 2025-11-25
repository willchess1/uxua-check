'use server';

import { summarizePropertyIssues, type SummarizePropertyIssuesInput } from '@/ai/flows/summarize-property-issues';

export async function getSummary(input: SummarizePropertyIssuesInput) {
    try {
        const { summary } = await summarizePropertyIssues(input);
        return { success: true, summary };
    } catch (error) {
        console.error("Error getting summary from AI:", error);
        return { success: false, error: 'Failed to generate summary.' };
    }
}

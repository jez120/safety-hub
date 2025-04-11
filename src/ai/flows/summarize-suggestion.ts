'use server';
/**
 * @fileOverview Summarizes a lengthy safety suggestion for quick understanding.
 *
 * - summarizeSuggestion - A function that summarizes a safety suggestion.
 * - SummarizeSuggestionInput - The input type for the summarizeSuggestion function.
 * - SummarizeSuggestionOutput - The return type for the summarizeSuggestion function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeSuggestionInputSchema = z.object({
  suggestionText: z.string().describe('The full text of the safety suggestion.'),
});
export type SummarizeSuggestionInput = z.infer<typeof SummarizeSuggestionInputSchema>;

const SummarizeSuggestionOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the safety suggestion.'),
});
export type SummarizeSuggestionOutput = z.infer<typeof SummarizeSuggestionOutputSchema>;

export async function summarizeSuggestion(input: SummarizeSuggestionInput): Promise<SummarizeSuggestionOutput> {
  return summarizeSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSuggestionPrompt',
  input: {
    schema: z.object({
      suggestionText: z.string().describe('The full text of the safety suggestion.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A concise summary of the safety suggestion.'),
    }),
  },
  prompt: `Summarize the following safety suggestion, providing a concise summary of the core problem reported:\n\n{{{suggestionText}}}`,
});

const summarizeSuggestionFlow = ai.defineFlow<
  typeof SummarizeSuggestionInputSchema,
  typeof SummarizeSuggestionOutputSchema
>({
  name: 'summarizeSuggestionFlow',
  inputSchema: SummarizeSuggestionInputSchema,
  outputSchema: SummarizeSuggestionOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});

// categorize-suggestion.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow to categorize safety suggestions into predefined safety areas.
 *
 * - categorizeSuggestion - A function that categorizes a safety suggestion.
 * - CategorizeSuggestionInput - The input type for the categorizeSuggestion function.
 * - CategorizeSuggestionOutput - The return type for the categorizeSuggestion function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const CategorizeSuggestionInputSchema = z.object({
  suggestionText: z.string().describe('The text of the safety suggestion.'),
});
export type CategorizeSuggestionInput = z.infer<typeof CategorizeSuggestionInputSchema>;

const CategorizeSuggestionOutputSchema = z.object({
  category: z.string().describe('The categorized safety area of the suggestion (e.g., fire safety, electrical safety, chemical safety).'),
  confidence: z.number().describe('The confidence level (0-1) of the categorization.'),
});
export type CategorizeSuggestionOutput = z.infer<typeof CategorizeSuggestionOutputSchema>;

export async function categorizeSuggestion(input: CategorizeSuggestionInput): Promise<CategorizeSuggestionOutput> {
  return categorizeSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeSuggestionPrompt',
  input: {
    schema: z.object({
      suggestionText: z.string().describe('The text of the safety suggestion.'),
    }),
  },
  output: {
    schema: z.object({
      category: z.string().describe('The categorized safety area of the suggestion (e.g., fire safety, electrical safety, chemical safety).'),
      confidence: z.number().describe('The confidence level (0-1) of the categorization.'),
    }),
  },
  prompt: `You are an AI assistant specializing in categorizing safety suggestions into predefined safety areas.

  Given the following safety suggestion, determine the most appropriate category and provide a confidence level for your categorization.

  Suggestion: {{{suggestionText}}}

  Categories: fire safety, electrical safety, chemical safety, fall protection, machine guarding, personal protective equipment, hazard communication, ergonomics, other.

  Format your response as a JSON object with 'category' and 'confidence' fields.
  `,
});

const categorizeSuggestionFlow = ai.defineFlow<
  typeof CategorizeSuggestionInputSchema,
  typeof CategorizeSuggestionOutputSchema
>({
  name: 'categorizeSuggestionFlow',
  inputSchema: CategorizeSuggestionInputSchema,
  outputSchema: CategorizeSuggestionOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});

'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized study questions based on a selected medical topic.
 *
 * The flow takes a medical topic as input and returns a set of personalized study questions.
 * It exports:
 *   - generatePersonalizedQuestions: The main function to generate questions.
 *   - GeneratePersonalizedQuestionsInput: The input type for the function.
 *   - GeneratePersonalizedQuestionsOutput: The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const GeneratePersonalizedQuestionsInputSchema = z.object({
  topic: z.string().describe('The medical topic to generate questions for.'),
});
export type GeneratePersonalizedQuestionsInput = z.infer<typeof GeneratePersonalizedQuestionsInputSchema>;

// Define the output schema
const GeneratePersonalizedQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('An array of personalized study questions.'),
});
export type GeneratePersonalizedQuestionsOutput = z.infer<typeof GeneratePersonalizedQuestionsOutputSchema>;

// Define the main function
export async function generatePersonalizedQuestions(input: GeneratePersonalizedQuestionsInput): Promise<GeneratePersonalizedQuestionsOutput> {
  return generatePersonalizedQuestionsFlow(input);
}

// Define the prompt
const generatePersonalizedQuestionsPrompt = ai.definePrompt({
  name: 'generatePersonalizedQuestionsPrompt',
  input: {schema: GeneratePersonalizedQuestionsInputSchema},
  output: {schema: GeneratePersonalizedQuestionsOutputSchema},
  prompt: `You are an expert medical educator. Generate a set of personalized study questions based on the following medical topic: {{{topic}}}. The questions should be challenging and relevant to medical students. Return the questions as a JSON array of strings.`,
});

// Define the flow
const generatePersonalizedQuestionsFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedQuestionsFlow',
    inputSchema: GeneratePersonalizedQuestionsInputSchema,
    outputSchema: GeneratePersonalizedQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generatePersonalizedQuestionsPrompt(input);
    return output!;
  }
);

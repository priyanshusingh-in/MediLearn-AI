'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized study questions based on a selected medical topic and user preferences.
 *
 * The flow takes a medical topic and user context as input and returns a set of personalized study questions.
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
  preparationContext: z.string().describe("The context for which the user is preparing (e.g., exam name, learning goal)."),
  questionType: z.string().describe("The preferred type of questions (e.g., Conceptual, Case-based)."),
  numberOfQuestions: z.number().describe('The number of questions to generate.'),
});
export type GeneratePersonalizedQuestionsInput = z.infer<typeof GeneratePersonalizedQuestionsInputSchema>;

// Define the output schema
const GeneratePersonalizedQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('An array of personalized study questions.'),
});
export type GeneratePersonalizedQuestionsOutput = z.infer<typeof GeneratePersonalizedQuestionsOutputSchema>;

// Define the main function
export async function generatePersonalizedQuestions(input: GeneratePersonalizedQuestionsInput): Promise<GeneratePersonalizedQuestionsOutput> {
  // Add a random seed to the topic to avoid caching and get new questions.
  const uniqueInput = {
    ...input,
    topic: `${input.topic} - ${Math.random()}`,
  };
  return generatePersonalizedQuestionsFlow(uniqueInput);
}

// Define the prompt
const generatePersonalizedQuestionsPrompt = ai.definePrompt({
  name: 'generatePersonalizedQuestionsPrompt',
  input: {schema: GeneratePersonalizedQuestionsInputSchema},
  output: {schema: GeneratePersonalizedQuestionsOutputSchema},
  prompt: `You are an expert medical educator creating a personalized quiz.

Generate a set of {{{numberOfQuestions}}} challenging study questions based on the following criteria:

- Medical Topic: {{{topic}}}
{{#if preparationContext}}
- User's Preparation Goal: {{{preparationContext}}}
{{/if}}
- Preferred Question Style: {{{questionType}}}

{{#if preparationContext}}
The questions should be highly relevant for a medical student preparing for "{{{preparationContext}}}".
{{else}}
The questions should be of a general nature for the selected topic.
{{/if}}
Tailor the questions to match the requested style: "{{{questionType}}}". For example, if they ask for case-based questions, create short clinical vignettes.

Return the questions as a JSON array of strings.`,
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

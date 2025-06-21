'use server';
/**
 * @fileOverview This file defines a Genkit flow for verifying a user's answer to a medical question.
 *
 * It exports:
 *   - verifyAnswer: The main function to verify an answer.
 *   - VerifyAnswerInput: The input type for the function.
 *   - VerifyAnswerOutput: The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const VerifyAnswerInputSchema = z.object({
  question: z.string().describe('The medical question that was asked.'),
  answer: z.string().describe("The user's answer to the question."),
});
export type VerifyAnswerInput = z.infer<typeof VerifyAnswerInputSchema>;

// Define the output schema
const VerifyAnswerOutputSchema = z.object({
  score: z.number().describe('A score from 0 to 10 for the answer.'),
  feedback: z.string().describe('Constructive feedback on the answer, explaining the score.'),
});
export type VerifyAnswerOutput = z.infer<typeof VerifyAnswerOutputSchema>;

// Define the main function
export async function verifyAnswer(input: VerifyAnswerInput): Promise<VerifyAnswerOutput> {
  return verifyAnswerFlow(input);
}

// Define the prompt
const verifyAnswerPrompt = ai.definePrompt({
  name: 'verifyAnswerPrompt',
  input: {schema: VerifyAnswerInputSchema},
  output: {schema: VerifyAnswerOutputSchema},
  prompt: `You are a medical expert evaluating a student's answer to a quiz question.
The user was asked to provide an answer between 25 and 50 words.

Question: "{{{question}}}"
Student's Answer: "{{{answer}}}"

Please evaluate the student's answer. Provide a score from 0 to 10, where 10 is a perfect answer.
Also, provide constructive feedback explaining the rationale for your score. The feedback should be concise and helpful for learning.
If the answer is too short or too long, penalize the score.
`,
});

// Define the flow
const verifyAnswerFlow = ai.defineFlow(
  {
    name: 'verifyAnswerFlow',
    inputSchema: VerifyAnswerInputSchema,
    outputSchema: VerifyAnswerOutputSchema,
  },
  async input => {
    const {output} = await verifyAnswerPrompt(input);
    return output!;
  }
);

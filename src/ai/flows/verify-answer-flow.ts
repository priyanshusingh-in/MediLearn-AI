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
  prompt: `You are a fair and knowledgeable medical professor grading a student's quiz answer.
The student was required to answer in 25 to 50 words. This is a test of both knowledge and conciseness.

Here is the question and the student's answer:
Question: "{{{question}}}"
Student's Answer: "{{{answer}}}"

Your task is to:
1. Evaluate the medical accuracy of the answer. This is the most important factor.
2. Consider the conciseness. Did the student convey the key information effectively within the word limit?
3. Provide a score from 0 to 10. A score of 10 represents a perfect, accurate, and concise answer. A score of 0 means the answer is completely incorrect.
4. Provide constructive feedback. The feedback should clearly explain why you gave that score. If the answer is good but incomplete due to the word limit, acknowledge this. For example: "This is a great, concise answer covering the main points. To be more comprehensive, you could also mention X, but this is excellent for the word count." If the answer is inaccurate, gently correct the student and explain the correct concepts.
5. If the answer is significantly outside the 25-50 word range, you should penalize the score accordingly, and mention this in the feedback.
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

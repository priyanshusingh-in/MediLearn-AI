'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating personalized feedback
 * and a study plan based on a user's quiz performance.
 *
 * It exports:
 *   - generateFeedback: The main function to generate feedback.
 *   - GenerateFeedbackInput: The input type for the function.
 *   - GenerateFeedbackOutput: The output type for the function.
 */

import {ai} from '@/ai/genkit-manual';
import {z} from 'genkit';

const QuizResultSchema = z.object({
  question: z.string().describe('The question that was asked.'),
  answer: z.string().describe("The user's answer to the question."),
  score: z.number().describe('The score (out of 10) the user received for their answer.'),
});

// Define the input schema
const GenerateFeedbackInputSchema = z.object({
  topic: z.string().describe('The medical topic of the quiz.'),
  results: z.array(QuizResultSchema).describe("An array of the user's quiz results, including the question, their answer, and the score they received."),
});
export type GenerateFeedbackInput = z.infer<typeof GenerateFeedbackInputSchema>;

// Define the output schema
const GenerateFeedbackOutputSchema = z.object({
  feedback: z.string().describe('A comprehensive, personalized feedback and study guide for the user.'),
});
export type GenerateFeedbackOutput = z.infer<typeof GenerateFeedbackOutputSchema>;

// Define the main function
export async function generateFeedback(input: GenerateFeedbackInput): Promise<GenerateFeedbackOutput> {
  return generateFeedbackFlow(input);
}

// Define the prompt
const generateFeedbackPrompt = ai.definePrompt({
  name: 'generateFeedbackPrompt',
  input: {schema: GenerateFeedbackInputSchema},
  output: {schema: GenerateFeedbackOutputSchema},
  prompt: `You are a supportive and insightful medical tutor. A student has just completed a quiz on the topic of "{{{topic}}}".

Here are their results:
{{#each results}}
- Question: "{{this.question}}"
  User's Answer: "{{this.answer}}"
  Score: {{this.score}}/10
{{/each}}

Your task is to provide comprehensive, personalized feedback and a study guide based on their performance. If the user's answer is "[SKIPPED]", it means they did not answer the question. Please acknowledge this in your feedback, especially in the "Areas for Improvement" section.

1.  **# Overall Performance Summary:** Start with an encouraging summary of their overall performance. Calculate the average score and comment on it.

2.  **# Strengths:** Point out specific questions where the student did well (high scores) and explain what made their answers strong (e.g., "Your answer to the question about... was excellent because you clearly identified...").

3.  **# Areas for Improvement:** Gently identify patterns in the questions where the student struggled (low scores or skipped). Don't just list the wrong answers. Instead, try to diagnose the underlying knowledge gaps. For example, "It seems there might be some confusion around the diagnostic criteria for..." or "You skipped the question about..., which might indicate a gap in this area. Let's focus on reinforcing...".

4.  **# Your Personalized Study Plan:** Provide actionable, concrete steps for improvement based on both incorrect answers and skipped questions. This is the most important part. Be specific.
    *   Suggest 2-3 core concepts they should review based on their incorrect answers or skipped questions.
    *   Recommend specific study strategies (e.g., "Try creating flashcards for the key terminologies," "Watch a video explaining the pathophysiology of...").
    *   Frame this as a clear, manageable plan to help them succeed.

Structure your response in clear sections with markdown headings (e.g., "# Overall Performance"). Use formatting like bullet points to make it easy to read. Your tone should be encouraging and aimed at building confidence.`,
});

// Define the flow
const generateFeedbackFlow = ai.defineFlow(
  {
    name: 'generateFeedbackFlow',
    inputSchema: GenerateFeedbackInputSchema,
    outputSchema: GenerateFeedbackOutputSchema,
  },
  async input => {
    const {output} = await generateFeedbackPrompt(input);
    return output!;
  }
);

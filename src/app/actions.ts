'use server';

import {
  generatePersonalizedQuestions,
  type GeneratePersonalizedQuestionsOutput,
} from '@/ai/flows/generate-personalized-questions';
import {
  verifyAnswer,
  type VerifyAnswerInput,
  type VerifyAnswerOutput,
} from '@/ai/flows/verify-answer-flow';

export async function getQuestions(
  topic: string
): Promise<GeneratePersonalizedQuestionsOutput> {
  try {
    const result = await generatePersonalizedQuestions({ topic });
    return result;
  } catch (error) {
    console.error('Error generating questions:', error);
    // Return a structured error or an empty question set
    return { questions: [] };
  }
}

export async function verifyAnswerAction(
  input: VerifyAnswerInput
): Promise<VerifyAnswerOutput> {
  try {
    const result = await verifyAnswer(input);
    return result;
  } catch (error) {
    console.error('Error verifying answer:', error);
    // Return a structured error
    return { score: 0, feedback: 'There was an error verifying your answer. Please try again.' };
  }
}

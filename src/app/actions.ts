'use server';

import {
  generatePersonalizedQuestions,
  type GeneratePersonalizedQuestionsOutput,
} from '@/ai/flows/generate-personalized-questions';

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

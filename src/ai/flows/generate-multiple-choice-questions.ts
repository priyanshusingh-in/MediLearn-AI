'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating multiple choice quiz questions based on a selected medical topic and user preferences.
 *
 * The flow takes a medical topic and user context as input and returns a set of multiple choice questions.
 * It exports:
 *   - generateMultipleChoiceQuestions: The main function to generate questions.
 *   - GenerateMultipleChoiceQuestionsInput: The input type for the function.
 *   - GenerateMultipleChoiceQuestionsOutput: The output type for the function.
 */

import {ai} from '@/ai/genkit-manual';
import {z} from 'genkit';

// Define the quiz question schema
const QuizQuestionSchema = z.object({
  id: z.string().describe('Unique question ID'),
  question: z.string().describe('The question text'),
  options: z.array(z.string()).length(4).describe('Array of 4 multiple choice options'),
  correctAnswer: z.number().min(0).max(3).describe('Index of correct answer (0-3)'),
  explanation: z.string().describe('Explanation of the correct answer'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('Question difficulty level'),
  points: z.number().describe('Points awarded for correct answer'),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

// Define the input schema
const GenerateMultipleChoiceQuestionsInputSchema = z.object({
  topic: z.string().describe('The medical topic to generate questions for.'),
  preparationContext: z.string().describe("The context for which the user is preparing (e.g., exam name, learning goal)."),
  questionType: z.string().describe("The preferred type of questions (e.g., Conceptual, Case-based)."),
  numberOfQuestions: z.number().describe('The number of questions to generate.'),
});
export type GenerateMultipleChoiceQuestionsInput = z.infer<typeof GenerateMultipleChoiceQuestionsInputSchema>;

// Define the output schema
const GenerateMultipleChoiceQuestionsOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe('An array of multiple choice quiz questions.'),
});
export type GenerateMultipleChoiceQuestionsOutput = z.infer<typeof GenerateMultipleChoiceQuestionsOutputSchema>;

// Define the main function
export async function generateMultipleChoiceQuestions(input: GenerateMultipleChoiceQuestionsInput): Promise<GenerateMultipleChoiceQuestionsOutput> {
  // Add a random seed to the topic to avoid caching and get new questions every time.
  const uniqueInput = {
    ...input,
    topic: `${input.topic} - ${Math.random()}`,
  };
  return generateMultipleChoiceQuestionsFlow(uniqueInput);
}

// Define the prompt
const generateMultipleChoiceQuestionsPrompt = ai.definePrompt({
  name: 'generateMultipleChoiceQuestionsPrompt',
  input: {schema: GenerateMultipleChoiceQuestionsInputSchema},
  output: {schema: GenerateMultipleChoiceQuestionsOutputSchema},
  prompt: `You are an expert medical educator creating a multiple choice quiz for medical students.

Generate exactly {{{numberOfQuestions}}} challenging multiple choice questions based on these criteria:

- Medical Topic: {{{topic}}}
{{#if preparationContext}}
- User's Preparation Goal: {{{preparationContext}}}
{{/if}}
- Preferred Question Style: {{{questionType}}}

IMPORTANT INSTRUCTIONS:
1. Each question must have exactly 4 multiple choice options
2. Only ONE option should be correct
3. The other 3 options should be plausible but incorrect (good distractors)
4. Randomize the position of the correct answer across questions
5. Include clear, concise explanations for why the correct answer is right
6. Vary difficulty levels appropriately based on the topic
7. Make questions clinically relevant and educational

{{#if preparationContext}}
The questions should be highly relevant for a medical student preparing for "{{{preparationContext}}}".
{{else}}
The questions should be of a general nature for the selected topic.
{{/if}}

{{#if questionType}}
Tailor the questions to match the requested style: "{{{questionType}}}". 
- If "Conceptual Understanding": Focus on underlying principles and mechanisms
- If "Factual Recall": Focus on specific facts, definitions, and classifications  
- If "Case-based Scenarios": Create short clinical vignettes with diagnostic/treatment questions
{{/if}}

DIFFICULTY GUIDELINES:
- Beginner (10 points): Basic concepts, common conditions, standard treatments
- Intermediate (15 points): More complex relationships, differential diagnosis, complications
- Advanced (20 points): Rare conditions, complex cases, latest research findings

EXAMPLE FORMAT:
{
  "questions": [
    {
      "id": "q1",
      "question": "What is the normal resting heart rate for healthy adults?",
      "options": [
        "40-60 beats per minute",
        "60-100 beats per minute", 
        "100-120 beats per minute",
        "120-140 beats per minute"
      ],
      "correctAnswer": 1,
      "explanation": "The normal resting heart rate for healthy adults ranges from 60 to 100 beats per minute. Rates below 60 may indicate bradycardia, while rates above 100 may indicate tachycardia.",
      "difficulty": "Beginner",
      "points": 10
    }
  ]
}

Generate {{{numberOfQuestions}}} unique, educational, and clinically relevant questions. Ensure variety in topics within the specialty and mix difficulty levels appropriately.`,
});

// Define the flow
const generateMultipleChoiceQuestionsFlow = ai.defineFlow(
  {
    name: 'generateMultipleChoiceQuestionsFlow',
    inputSchema: GenerateMultipleChoiceQuestionsInputSchema,
    outputSchema: GenerateMultipleChoiceQuestionsOutputSchema,
  },
  async (input: GenerateMultipleChoiceQuestionsInput) => {
    const {output} = await generateMultipleChoiceQuestionsPrompt(input);
    return output!;
  }
); 
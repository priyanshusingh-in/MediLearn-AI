'use server';

import {
  generatePersonalizedQuestions,
  type GeneratePersonalizedQuestionsInput,
  type GeneratePersonalizedQuestionsOutput,
} from '@/ai/flows/generate-personalized-questions';
import {
  generateMultipleChoiceQuestions,
  type GenerateMultipleChoiceQuestionsInput,
  type GenerateMultipleChoiceQuestionsOutput,
} from '@/ai/flows/generate-multiple-choice-questions';
import {
  verifyAnswer,
  type VerifyAnswerInput,
  type VerifyAnswerOutput,
} from '@/ai/flows/verify-answer-flow';
import {
  generateFeedback,
  type GenerateFeedbackInput,
  type GenerateFeedbackOutput,
} from '@/ai/flows/generate-feedback-flow';

export async function getQuestions(
  input: GeneratePersonalizedQuestionsInput
): Promise<GeneratePersonalizedQuestionsOutput> {
  try {
    console.log('🚀 Starting open-ended question generation for topic:', input.topic);
    const result = await generatePersonalizedQuestions(input);
    console.log('✅ Successfully generated', result.questions?.length || 0, 'questions');
    return result;
  } catch (error) {
    console.error('❌ Error generating questions:', error);
    
    // Check for specific API key errors
    if (error instanceof Error && error.message.includes('API key')) {
      console.error('🔑 API Key Error: Please check your GEMINI_API_KEY in .env.local');
    }
    
    // Return a structured error or an empty question set
    return { questions: [] };
  }
}

export async function getMultipleChoiceQuestions(
  input: GenerateMultipleChoiceQuestionsInput
): Promise<GenerateMultipleChoiceQuestionsOutput> {
  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in the environment variables. Please add it to your .env.local file.");
    }

    console.log('🚀 Starting multiple choice question generation for topic:', input.topic);
    console.log('📝 Input details:', JSON.stringify(input, null, 2));
    
    // Use direct API implementation for reliability
    console.log('🔧 Using direct Google AI API (bypassing Genkit for stability)');
    
    // Use a working API key directly
    // Note: This is a temporary solution - in production, use environment variables
    console.log('🔑 API Key available:', !!API_KEY, 'Length:', API_KEY.length);
    
    const prompt = `You are an expert medical educator creating a multiple choice quiz for medical students.

Generate exactly ${input.numberOfQuestions} challenging multiple choice questions based on these criteria:

- Medical Topic: ${input.topic}
- User's Preparation Goal: ${input.preparationContext}
- Preferred Question Style: ${input.questionType}

IMPORTANT INSTRUCTIONS:
1. Each question must have exactly 4 multiple choice options
2. Only ONE option should be correct
3. The other 3 options should be plausible but incorrect (good distractors)
4. Randomize the position of the correct answer across questions
5. Include clear, concise explanations for why the correct answer is right
6. Vary difficulty levels appropriately based on the topic
7. Make questions clinically relevant and educational

DIFFICULTY GUIDELINES:
- Beginner (10 points): Basic concepts, common conditions, standard treatments
- Intermediate (15 points): More complex relationships, differential diagnosis, complications
- Advanced (20 points): Rare conditions, complex cases, latest research findings

Return ONLY a JSON object in this exact format:
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

Generate ${input.numberOfQuestions} unique, educational, and clinically relevant questions now:`;

    // Try multiple models in order of preference
    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-1.0-pro'
    ];
    
    let response;
    let modelUsed = '';
    
    for (const model of modelsToTry) {
      try {
        console.log(`📡 Trying model: ${model}...`);
        
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 4096,
              }
            })
          }
        );

        console.log(`📨 Model ${model} response status:`, response.status);

        if (response.ok) {
          modelUsed = model;
          console.log(`✅ Successfully connected with model: ${model}`);
          break;
        } else {
          const errorText = await response.text();
          console.log(`⚠️  Model ${model} failed:`, response.status, errorText.substring(0, 200));
          
          // Check for specific errors that indicate we should stop trying
          if (errorText.includes('PERMISSION_DENIED') || errorText.includes('INVALID_ARGUMENT')) {
            console.error('❌ API key or request format issue - stopping attempts');
            return { questions: [] };
          }
        }
      } catch (fetchError) {
        console.log(`⚠️  Network error with model ${model}:`, fetchError instanceof Error ? fetchError.message : 'Unknown error');
      }
    }

    if (!response || !response.ok) {
      console.error('❌ All models failed - API may be unavailable');
      return { questions: [] };
    }

    const data = await response.json();
    console.log('✅ Received response from Google AI API');

    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      console.error('❌ No generated text received from API');
      return { questions: [] };
    }

    console.log('📝 Generated text length:', generatedText.length);

    // Parse the JSON response
    let questionsData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        questionsData = JSON.parse(jsonMatch[0]);
      } else {
        console.error('❌ No JSON found in response');
        return { questions: [] };
      }
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.log('📄 Raw response (first 500 chars):', generatedText.substring(0, 500));
      return { questions: [] };
    }

    if (!questionsData?.questions || !Array.isArray(questionsData.questions)) {
      console.error('❌ Invalid question format received from AI');
      return { questions: [] };
    }

    console.log(`✅ Successfully generated ${questionsData.questions.length} questions using model: ${modelUsed}`);
    return questionsData;
    
  } catch (error) {
    console.error('❌ Error generating multiple choice questions:', error);
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

export async function generateFeedbackAction(
  input: GenerateFeedbackInput
): Promise<GenerateFeedbackOutput> {
  try {
    const result = await generateFeedback(input);
    return result;
  } catch (error) {
    console.error('Error generating feedback:', error);
    // Return a structured error
    return { feedback: 'There was an error generating your feedback. Please try again.' };
  }
}

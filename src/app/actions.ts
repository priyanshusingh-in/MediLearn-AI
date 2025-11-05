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

Return ONLY a valid JSON object (no markdown, no code blocks, no extra text) in this exact format:
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

CRITICAL: Return ONLY the raw JSON object. Do NOT wrap it in markdown code blocks (\`\`\`json) or any other formatting. Start with { and end with }.

Generate ${input.numberOfQuestions} unique, educational, and clinically relevant questions now:`;

    // Try multiple models in order of preference
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest',
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
          `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${API_KEY}`,
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
                maxOutputTokens: 8192,
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
      // Clean the response: remove markdown code blocks if present
      let cleanedText = generatedText.trim();
      
      // Remove markdown code fences (```json ... ``` or ``` ... ```)
      cleanedText = cleanedText.replace(/^```(?:json)?\s*\n?/i, '');
      cleanedText = cleanedText.replace(/\n?```\s*$/i, '');
      cleanedText = cleanedText.trim();
      
      // Try to extract JSON from the response
      // Look for the JSON object with balanced braces
      let jsonString = cleanedText;
      
      // Find the first { and try to find matching closing }
      const firstBrace = jsonString.indexOf('{');
      if (firstBrace === -1) {
        console.error('❌ No JSON object found in response');
        console.log('📄 Cleaned text (first 500 chars):', cleanedText.substring(0, 500));
        return { questions: [] };
      }
      
      // Find the last } that matches the structure by counting braces
      let braceCount = 0;
      let lastBrace = -1;
      for (let i = firstBrace; i < jsonString.length; i++) {
        if (jsonString[i] === '{') braceCount++;
        if (jsonString[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            lastBrace = i;
            break;
          }
        }
      }
      
      if (lastBrace === -1) {
        // JSON might be incomplete, try the original regex approach as fallback
        console.warn('⚠️ JSON appears incomplete, attempting to extract partial data...');
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonString = jsonMatch[0];
        } else {
          console.error('❌ No valid JSON structure found');
          console.log('📄 Cleaned text (first 500 chars):', cleanedText.substring(0, 500));
          return { questions: [] };
        }
      } else {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
      }
      
      questionsData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.log('📄 Raw response (first 1000 chars):', generatedText.substring(0, 1000));
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

// Direct Google AI implementation without Genkit
// This bypasses any Genkit configuration issues

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in the environment variables. Please add it to your .env.local file.");
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  points: number;
}

interface GenerateQuestionsInput {
  topic: string;
  preparationContext: string;
  questionType: string;
  numberOfQuestions: number;
}

export async function generateMultipleChoiceQuestionsDirect(
  input: GenerateQuestionsInput
): Promise<{ questions: QuizQuestion[] }> {
  console.log('🚀 Using direct Google AI API for question generation');
  console.log('📝 Input:', input);

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

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-latest:generateContent?key=${API_KEY}`,
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google AI API error:', response.status, errorText);
      throw new Error(`Google AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Received response from Google AI API');

    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      throw new Error('No generated text received from API');
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
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.log('📄 Raw response:', generatedText);
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!questionsData?.questions || !Array.isArray(questionsData.questions)) {
      throw new Error('Invalid question format received from AI');
    }

    console.log('✅ Successfully generated', questionsData.questions.length, 'questions');
    return questionsData;

  } catch (error) {
    console.error('❌ Direct AI generation failed:', error);
    throw error;
  }
} 
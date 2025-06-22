import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable not set');
}

// Log API key status
console.log('🔑 Using API key with length:', apiKey.length);

export const ai = genkit({
  plugins: [googleAI({
    apiKey: apiKey,
  })],
  model: 'googleai/gemini-2.0-flash',
});

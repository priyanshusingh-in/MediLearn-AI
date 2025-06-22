import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Enhanced API key configuration with multiple fallback methods
const getApiKey = () => {
  console.log('🔑 Attempting to get API key...');
  
  // Method 1: Try environment variables
  const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (envKey && envKey.length > 20) {
    console.log('✅ Using API key from environment variables');
    return envKey;
  }
  
  // Method 2: Check for Next.js runtime environment variables
  if (typeof window === 'undefined') {
    try {
      const { config } = require('dotenv');
      config({ path: '.env.local' });
      config({ path: '.env' });
      
      const dotenvKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (dotenvKey && dotenvKey.length > 20) {
        console.log('✅ Using API key from dotenv');
        return dotenvKey;
      }
    } catch (e) {
      console.log('⚠️  dotenv not available or failed to load');
    }
  }
  
  // Method 3: No key found, throw an error
  console.error('❌ CRITICAL: No API key found. Genkit cannot be initialized.');
  console.error('🔧 Please create a .env.local file with: GEMINI_API_KEY=your_api_key');
  throw new Error('GEMINI_API_KEY is not set. Please provide it in your .env.local file.');
};

let aiInstance: any = null;

// Create singleton instance to avoid multiple initializations
export const getAI = () => {
  if (!aiInstance) {
    console.log('🚀 Initializing Genkit AI instance...');
    try {
      aiInstance = genkit({
        plugins: [googleAI({
          apiKey: getApiKey(),
        })],
        model: 'googleai/gemini-2.0-flash',
      });
      console.log('✅ Genkit AI instance created successfully');
    } catch (error) {
      console.error('❌ Failed to create Genkit AI instance:', error);
      throw error;
    }
  }
  return aiInstance;
};

export const ai = getAI(); 
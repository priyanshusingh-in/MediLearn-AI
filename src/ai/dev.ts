import { config } from 'dotenv';
config();

import '@/ai/flows/generate-personalized-questions.ts';
import '@/ai/flows/verify-answer-flow.ts';
import '@/ai/flows/generate-feedback-flow.ts';

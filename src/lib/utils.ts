import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a random username with a combination of text, numbers and characters
 * Format: MediLearner_[randomText][randomNumber][specialChar]
 */
export function generateRandomUsername(): string {
  const adjectives = [
    "Brilliant", "Quick", "Smart", "Sharp", "Bright", 
    "Clever", "Skilled", "Expert", "Wise", "Genius"
  ];
  const nouns = [
    "Mind", "Doctor", "Healer", "Student", "Scholar", 
    "Medic", "Surgeon", "Pro", "Expert", "Specialist"
  ];
  const specialChars = ["!", "#", "$", "%", "&", "+", "*", "~"];
  
  // Select random elements
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const randomChar = specialChars[Math.floor(Math.random() * specialChars.length)];
  
  // Combine to create username
  const username = `${randomAdjective}${randomNoun}${randomNum}${randomChar}`;
  
  return username;
}

/**
 * Format quiz score as a percentage
 */
export function formatScore(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;
  return `${Math.round(percentage)}%`;
}

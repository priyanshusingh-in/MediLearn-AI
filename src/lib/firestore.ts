import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  limit,
  serverTimestamp,
  runTransaction,
  addDoc,
  DocumentSnapshot,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from './firebase';
import { generateRandomUsername } from './utils';

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: any;
  quizCount: number;
  totalScore: number;
  averageRating: number;
}

// Helper function to create timeout promise - shorter timeouts
const createTimeoutPromise = (ms: number, operation: string) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`${operation} operation timed out after ${ms}ms`)), ms);
  });
};

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to handle Firestore errors
const handleFirestoreError = (error: any, operation: string) => {
  console.error(`Firestore ${operation} error:`, error);
  
  if (error.code === 'unavailable' || error.message?.includes('offline')) {
    throw new Error(`Unable to ${operation} - please check your internet connection and try again`);
  } else if (error.code === 'permission-denied') {
    throw new Error(`Permission denied for ${operation} - please sign in again`);
  } else if (error.code === 'not-found') {
    throw new Error(`Document not found for ${operation}`);
  } else if (error.message?.includes('timeout')) {
    throw new Error(`${operation} is taking longer than expected - please check your connection and try again`);
  } else {
    throw new Error(`Failed to ${operation}: ${error.message || 'Unknown error'}`);
  }
};

// Retry wrapper for Firestore operations with shorter delays
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 500
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.log(`Attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Shorter exponential backoff
      const delayMs = baseDelay * Math.pow(1.5, attempt - 1) + Math.random() * 500;
      console.log(`Retrying in ${delayMs}ms...`);
      await delay(delayMs);
    }
  }
  
  throw lastError;
};

export async function getOrCreateUserProfile(user: User): Promise<UserProfile> {
  try {
    return await withRetry(async () => {
  const userRef = doc(db, 'users', user.uid);
      
      // Use shorter timeout (10 seconds) to beat Firebase's 15-second internal timeout
      const userSnap = await Promise.race([
        getDoc(userRef),
        createTimeoutPromise(10000, 'fetch user profile') // Reduced to 10 seconds
      ]) as DocumentSnapshot<DocumentData>;

  if (userSnap.exists()) {
        const profile = userSnap.data() as UserProfile;
        console.log('Existing user profile found:', profile);
        return profile;
  } else {
        console.log('Creating new user profile for:', user.email);
        const randomUsername = generateRandomUsername();
        
    const newUserProfile: UserProfile = {
      uid: user.uid,
          username: randomUsername,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      quizCount: 0,
      totalScore: 0,
      averageRating: 0,
    };
        
        // Use shorter timeout for creation as well
        await Promise.race([
          setDoc(userRef, newUserProfile),
          createTimeoutPromise(10000, 'create user profile') // Reduced to 10 seconds
        ]);
        
        console.log('New user profile created:', newUserProfile);
    return newUserProfile;
      }
    }, 1, 1000); // Only 1 retry with 1 second base delay
  } catch (error: any) {
    handleFirestoreError(error, 'get or create user profile');
    throw error; // Re-throw after handling
  }
}

export async function updateUserQuizStats(uid: string, newScore: number) {
  const userRef = doc(db, 'users', uid);
  try {
    await withRetry(async () => {
      await Promise.race([
        runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
            throw new Error("User document does not exist!");
      }

      const data = userDoc.data() as UserProfile;
      const newQuizCount = (data.quizCount || 0) + 1;
      const newTotalScore = (data.totalScore || 0) + newScore;
      const newAverageRating = newTotalScore / newQuizCount;
      
      transaction.update(userRef, { 
        quizCount: newQuizCount,
        totalScore: newTotalScore,
        averageRating: newAverageRating
      });
        }),
        createTimeoutPromise(12000, 'update quiz stats') // Reduced to 12 seconds
      ]);
    }, 1, 1000); // Only 1 retry
  } catch (error: any) {
    handleFirestoreError(error, 'update quiz statistics');
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    return await withRetry(async () => {
    const userRef = doc(db, 'users', uid);
      
      const userSnap = await Promise.race([
        getDoc(userRef),
        createTimeoutPromise(8000, 'get user profile') // Reduced to 8 seconds
      ]) as DocumentSnapshot<DocumentData>;
      
    return userSnap.exists() ? (userSnap.data() as UserProfile) : null;
    }, 1, 500); // Only 1 retry with 500ms delay
  } catch (error: any) {
    console.error('getUserProfile error:', error);
    return null; // Return null on error for this function
  }
}

export async function getLeaderboard(): Promise<UserProfile[]> {
  try {
    return await withRetry(async () => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('averageRating', 'desc'), limit(100));
      
      const querySnapshot = await Promise.race([
        getDocs(q),
        createTimeoutPromise(12000, 'get leaderboard') // Reduced to 12 seconds
      ]) as QuerySnapshot<DocumentData>;
      
    const leaderboard: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
        leaderboard.push(doc.data() as UserProfile);
    });
      
      console.log(`Leaderboard loaded with ${leaderboard.length} users`);
    return leaderboard;
    }, 1, 1000); // Only 1 retry
  } catch (error: any) {
    console.error('getLeaderboard error:', error);
    return []; // Return empty array on error
  }
}

// Interface for quiz result data
export interface QuizResultData {
  userId: string;
  score: number;
  totalPoints?: number;
  totalQuestions: number;
  correctAnswers: number;
  category: string;
  difficulty: string;
  completedAt: Date;
  timeSpent: number;
  answers: Array<{
    questionId: string;
    userAnswerIndex?: number | null;
    selectedAnswer?: number;
    isCorrect: boolean;
    points?: number;
    timeSpent?: number;
  }>;
}

export async function saveQuizResult(quizData: QuizResultData): Promise<void> {
  try {
    await withRetry(async () => {
      const quizResultsRef = collection(db, 'quizResults');
      
      // Convert Date to serverTimestamp for Firestore
      const dataToSave = {
        ...quizData,
        completedAt: serverTimestamp(),
      };
      
      await Promise.race([
        addDoc(quizResultsRef, dataToSave),
        createTimeoutPromise(10000, 'save quiz result')
      ]);
      
      console.log('Quiz result saved successfully');
    }, 1, 1000);
  } catch (error: any) {
    handleFirestoreError(error, 'save quiz result');
  }
}

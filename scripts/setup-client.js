// Client-side setup script for Firestore
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  writeBatch 
} from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Firebase configuration (from your .env.local)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Validate that all required config values are present
const requiredConfigKeys = [
  'apiKey',
  'authDomain', 
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
];

const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error('❌ Missing Firebase configuration keys in .env.local:', missingKeys);
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample medical quiz questions
const sampleQuestions = [
  {
    id: 'q1',
    question: 'What is the normal resting heart rate for adults?',
    options: [
      '40-60 beats per minute',
      '60-100 beats per minute',
      '100-120 beats per minute',
      '120-140 beats per minute'
    ],
    correctAnswer: 1,
    explanation: 'The normal resting heart rate for adults ranges from 60 to 100 beats per minute.',
    category: 'Cardiology',
    difficulty: 'Beginner',
    points: 10,
    createdAt: new Date()
  },
  {
    id: 'q2',
    question: 'Which hormone is produced by the pancreas to regulate blood sugar?',
    options: [
      'Cortisol',
      'Insulin',
      'Thyroxine',
      'Adrenaline'
    ],
    correctAnswer: 1,
    explanation: 'Insulin is produced by the beta cells in the pancreas and helps regulate blood glucose levels.',
    category: 'Endocrinology',
    difficulty: 'Beginner',
    points: 10,
    createdAt: new Date()
  },
  {
    id: 'q3',
    question: 'What is the medical term for high blood pressure?',
    options: [
      'Hypotension',
      'Hypertension',
      'Tachycardia',
      'Bradycardia'
    ],
    correctAnswer: 1,
    explanation: 'Hypertension is the medical term for high blood pressure, defined as systolic pressure ≥140 mmHg or diastolic pressure ≥90 mmHg.',
    category: 'Cardiology',
    difficulty: 'Beginner',
    points: 10,
    createdAt: new Date()
  },
  {
    id: 'q4',
    question: 'Which part of the brain controls balance and coordination?',
    options: [
      'Cerebrum',
      'Cerebellum',
      'Brainstem',
      'Hippocampus'
    ],
    correctAnswer: 1,
    explanation: 'The cerebellum is responsible for balance, coordination, and fine motor control.',
    category: 'Neurology',
    difficulty: 'Intermediate',
    points: 15,
    createdAt: new Date()
  },
  {
    id: 'q5',
    question: 'What is the first-line treatment for anaphylaxis?',
    options: [
      'Corticosteroids',
      'Antihistamines',
      'Epinephrine',
      'Beta-blockers'
    ],
    correctAnswer: 2,
    explanation: 'Epinephrine (adrenaline) is the first-line treatment for anaphylaxis and should be administered immediately.',
    category: 'Emergency Medicine',
    difficulty: 'Advanced',
    points: 20,
    createdAt: new Date()
  }
];

// Sample quiz categories
const categories = [
  {
    id: 'cardiology',
    name: 'Cardiology',
    description: 'Heart and cardiovascular system',
    icon: '❤️',
    questionCount: 2
  },
  {
    id: 'neurology',
    name: 'Neurology',
    description: 'Brain and nervous system',
    icon: '🧠',
    questionCount: 1
  },
  {
    id: 'endocrinology',
    name: 'Endocrinology',
    description: 'Hormones and endocrine system',
    icon: '⚗️',
    questionCount: 1
  },
  {
    id: 'emergency',
    name: 'Emergency Medicine',
    description: 'Critical care and emergency procedures',
    icon: '🚨',
    questionCount: 1
  },
  {
    id: 'general',
    name: 'General Medicine',
    description: 'General medical knowledge',
    icon: '🏥',
    questionCount: 0
  }
];

// Function to setup sample data
export async function setupFirestore() {
  try {
    console.log('Setting up Firestore with sample data...');

    // Create batch for questions
    const batch = writeBatch(db);
    
    // Add quiz questions
    console.log('Adding sample quiz questions...');
    for (const question of sampleQuestions) {
      const questionRef = doc(db, 'quizQuestions', question.id);
      batch.set(questionRef, question);
    }

    // Add categories
    console.log('Adding quiz categories...');
    for (const category of categories) {
      const categoryRef = doc(db, 'quizCategories', category.id);
      batch.set(categoryRef, category);
    }

    // Add global stats
    const globalStatsRef = doc(db, 'globalStats', 'main');
    batch.set(globalStatsRef, {
      totalUsers: 0,
      totalQuizzes: 0,
      totalQuestions: sampleQuestions.length,
      averageScore: 0,
      lastUpdated: new Date()
    });

    await batch.commit();
    console.log('✅ Sample data added successfully!');

    console.log('\n🎉 Firestore setup complete!');
    console.log('\n📊 Summary:');
    console.log(`- ${sampleQuestions.length} quiz questions added`);
    console.log(`- ${categories.length} categories created`);
    console.log('- Global stats initialized');

    return true;
  } catch (error) {
    console.error('❌ Error setting up Firestore:', error);
    throw error;
  }
}

// For direct execution
if (typeof window === 'undefined') {
  // Node.js environment
  setupFirestore()
    .then(() => {
      console.log('\n✨ Setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
} 
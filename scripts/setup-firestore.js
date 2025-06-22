const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin (you'll need to download service account key)
// For now, we'll use the project ID from your config
const admin = require('firebase-admin');

// Initialize with application default credentials (works with Firebase CLI)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'medilearn-ai'
  });
}

const db = getFirestore();

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
    questionCount: 0
  },
  {
    id: 'neurology',
    name: 'Neurology',
    description: 'Brain and nervous system',
    icon: '🧠',
    questionCount: 0
  },
  {
    id: 'endocrinology',
    name: 'Endocrinology',
    description: 'Hormones and endocrine system',
    icon: '⚗️',
    questionCount: 0
  },
  {
    id: 'emergency',
    name: 'Emergency Medicine',
    description: 'Critical care and emergency procedures',
    icon: '🚨',
    questionCount: 0
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
async function setupFirestore() {
  try {
    console.log('Setting up Firestore with sample data...');

    // Add quiz questions
    console.log('Adding sample quiz questions...');
    const batch = db.batch();
    
    for (const question of sampleQuestions) {
      const questionRef = db.collection('quizQuestions').doc(question.id);
      batch.set(questionRef, question);
    }

    // Add categories
    console.log('Adding quiz categories...');
    for (const category of categories) {
      const categoryRef = db.collection('quizCategories').doc(category.id);
      batch.set(categoryRef, category);
    }

    // Add global stats document
    console.log('Adding global stats...');
    const globalStatsRef = db.collection('globalStats').doc('main');
    batch.set(globalStatsRef, {
      totalUsers: 0,
      totalQuizzes: 0,
      totalQuestions: sampleQuestions.length,
      averageScore: 0,
      lastUpdated: new Date()
    });

    await batch.commit();
    console.log('✅ Sample data added successfully!');

    // Update question counts for categories
    console.log('Updating category question counts...');
    const categoryUpdates = {};
    
    for (const question of sampleQuestions) {
      const categoryKey = question.category.toLowerCase().replace(/\s+/g, '');
      categoryUpdates[categoryKey] = (categoryUpdates[categoryKey] || 0) + 1;
    }

    const updateBatch = db.batch();
    for (const [categoryId, count] of Object.entries(categoryUpdates)) {
      const categoryRef = db.collection('quizCategories').doc(categoryId);
      updateBatch.update(categoryRef, { questionCount: count });
    }

    await updateBatch.commit();
    console.log('✅ Category counts updated!');

    console.log('\n🎉 Firestore setup complete!');
    console.log('\n📊 Summary:');
    console.log(`- ${sampleQuestions.length} quiz questions added`);
    console.log(`- ${categories.length} categories created`);
    console.log('- Global stats initialized');
    console.log('\n🔗 Visit your Firebase Console:');
    console.log('https://console.firebase.google.com/project/medilearn-ai/firestore');

  } catch (error) {
    console.error('❌ Error setting up Firestore:', error);
    process.exit(1);
  }
}

// Run the setup
setupFirestore()
  .then(() => {
    console.log('\n✨ Setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }); 
# MediLearn-AI Firestore Database Setup

## Overview

This document explains the Firestore database configuration for the MediLearn-AI medical quiz application.

## 🔥 Firebase Configuration

### Services Initialized

- **Firestore Database**: Primary data storage
- **Firebase Authentication**: User authentication with Google OAuth
- **Genkit**: AI integration for generating quiz content
- **Firebase Functions**: Backend logic (optional)

### Security Rules

The Firestore security rules are configured to ensure data privacy and security:

```javascript
// Users can only access their own data
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
  // Allow reading basic profile info for leaderboard
  allow read: if request.auth != null &&
    resource.data.keys().hasOnly(['uid', 'username', 'displayName', 'photoURL', 'quizCount', 'totalScore', 'averageRating', 'createdAt']);
}

// Quiz results are private to each user
match /quizResults/{resultId} {
  allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
}

// Quiz questions are read-only for authenticated users
match /quizQuestions/{questionId} {
  allow read: if request.auth != null;
}
```

## 📊 Database Collections

### 1. `users` Collection

Stores user profile and statistics.

**Document Structure:**

```typescript
{
  uid: string; // Firebase Auth UID
  username: string; // Generated random username (e.g., "SmartDoctor123")
  displayName: string; // User's display name from Google
  email: string; // User's email
  photoURL: string; // Profile photo URL
  createdAt: Timestamp; // Account creation date
  quizCount: number; // Number of quizzes taken
  totalScore: number; // Sum of all quiz scores
  averageRating: number; // Average score across all quizzes
}
```

### 2. `quizQuestions` Collection

Contains all quiz questions for the medical knowledge tests.

**Document Structure:**

```typescript
{
  id: string;           // Question ID (e.g., "q1", "q2")
  question: string;     // The question text
  options: string[];    // Array of 4 multiple choice options
  correctAnswer: number; // Index of correct answer (0-3)
  explanation: string;  // Explanation of the correct answer
  category: string;     // Medical category (e.g., "Cardiology")
  difficulty: string;   // "Beginner", "Intermediate", "Advanced"
  points: number;       // Points awarded for correct answer
  createdAt: Timestamp; // When question was added
}
```

### 3. `quizCategories` Collection

Defines the medical subject categories.

**Document Structure:**

```typescript
{
  id: string; // Category ID (e.g., "cardiology")
  name: string; // Display name (e.g., "Cardiology")
  description: string; // Category description
  icon: string; // Emoji icon for UI
  questionCount: number; // Number of questions in category
}
```

### 4. `quizResults` Collection

Stores individual quiz results for each user.

**Document Structure:**

```typescript
{
  userId: string; // Reference to user who took quiz
  score: number; // Score achieved (0-100)
  totalQuestions: number; // Number of questions in quiz
  correctAnswers: number; // Number of correct answers
  category: string; // Quiz category
  difficulty: string; // Quiz difficulty level
  completedAt: Timestamp; // When quiz was completed
  timeSpent: number; // Time spent in seconds
  answers: Array<{
    // User's answers
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
    timeSpent: number;
  }>;
}
```

### 5. `globalStats` Collection

Tracks application-wide statistics.

**Document Structure:**

```typescript
{
  totalUsers: number; // Total registered users
  totalQuizzes: number; // Total quizzes completed
  totalQuestions: number; // Total questions in database
  averageScore: number; // Global average score
  lastUpdated: Timestamp; // Last stats update
}
```

## 🚀 Database Setup Instructions

### Method 1: Web Interface (Recommended)

1. Start your development server: `npm run dev`
2. Sign in to your application
3. Navigate to `/admin/setup`
4. Click "Setup Database" to populate with sample data

### Method 2: Firebase CLI

```bash
# Deploy security rules and indexes
firebase deploy --only firestore
```

## 📈 Performance Optimization

### Indexes Configured

- `users` collection: Ordered by `averageRating` (DESC) for leaderboard
- `quizResults` collection: Compound index on `userId` and `completedAt` for user history
- `quizQuestions` collection: Compound index on `category` and `difficulty` for filtering

### Query Patterns

- **Leaderboard**: `users` ordered by `averageRating DESC`, limited to 100
- **User History**: `quizResults` where `userId == currentUser` ordered by `completedAt DESC`
- **Quiz Questions**: `quizQuestions` where `category == selected` and `difficulty == level`

## 🔒 Security Features

### Authentication Required

- All database operations require user authentication
- Users can only access their own personal data
- Quiz questions are read-only for authenticated users

### Data Privacy

- Email addresses are private (not shown in leaderboard)
- Quiz results are private to each user
- Only basic profile info is visible to other users

### Rate Limiting

- Firestore's built-in rate limiting prevents abuse
- Client-side timeouts prevent hanging operations

## 🛠 Sample Data Included

The setup includes:

- **5 medical quiz questions** covering:
  - Cardiology (heart rate, blood pressure)
  - Endocrinology (insulin function)
  - Neurology (brain anatomy)
  - Emergency Medicine (anaphylaxis treatment)
- **5 medical categories** with icons and descriptions
- **Global statistics** tracking initialized to zero

## 📱 Offline Support

- **Persistence enabled** for offline functionality
- **Fallback profiles** when network is unavailable
- **Sync when online** returns after being offline

## 🔧 Development Tools

### Firebase Console

Monitor your database at: https://console.firebase.google.com/project/medilearn-ai/firestore

### Debug Components

- Use the `FirebaseDebug` component on the signin page in development mode
- Check network connectivity and Firebase status
- Test Firestore operations

## 📝 Environment Variables Required

```env
NEXT_PUBLIC_FIREBASE_API_KEY=<your_firebase_api_key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your_firebase_auth_domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your_firebase_project_id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=medilearn-ai.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=911586190200
```

## 🚨 Production Checklist

Before deploying to production:

- [ ] Review and update Firestore security rules
- [ ] Set up proper admin authentication for adding questions
- [ ] Configure backup strategies
- [ ] Set up monitoring and alerts
- [ ] Review rate limiting settings
- [ ] Test all security rules thoroughly

## 📚 Additional Resources

- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules Guide](https://firebase.google.com/docs/rules)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)

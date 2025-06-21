# MediLearn AI

MediLearn AI is an intelligent, AI-powered study platform designed to help medical students and professionals master complex topics through personalized learning experiences. It leverages generative AI to create dynamic quizzes, provide detailed feedback, and track user progress.

![MediLearn AI Screenshot](https://placehold.co/600x400.png)

## Core Features

*   **Personalized Quiz Generation**: Creates custom quizzes based on a chosen medical topic, preparation context (e.g., "USMLE Step 1"), preferred question style (Conceptual, Case-based, etc.), and length.
*   **AI-Powered Grading & Feedback**: User answers are evaluated by an AI for accuracy and clarity, providing an instant score and constructive feedback.
*   **Personalized Study Plans**: After each quiz, the AI generates a comprehensive study plan highlighting strengths, weaknesses, and actionable steps for improvement.
*   **User Authentication**: Secure sign-in with Google, managed by Firebase Authentication.
*   **User Profiles**: Each user has a profile that tracks their quiz history, number of quizzes taken, and average score.
*   **Competitive Leaderboard**: A leaderboard ranks users based on their average quiz scores, fostering a sense of community and friendly competition.
*   **Modern, Responsive UI**: Built with ShadCN UI and Tailwind CSS for a clean, accessible, and responsive user experience on any device.

## Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Generative AI**: [Google Gemini](https://gemini.google.com/) via [Genkit](https://firebase.google.com/docs/genkit)
*   **UI**: [React](https://react.dev/), [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
*   **Authentication & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
*   **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

*   Node.js (v18 or later)
*   npm, yarn, or pnpm

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repository/medilearn-ai.git
    cd medilearn-ai
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    *   Create a new file named `.env` in the root of your project.
    *   You will need to populate it with API keys from both Google and Firebase.

    ```env
    # Google AI Studio API Key for Genkit/Gemini
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY

    # Firebase Project Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
    ```

4.  **Get Your API Keys:**
    *   **Gemini API Key**:
        1.  Go to [Google AI Studio](https://aistudio.google.com/).
        2.  Click "Get API key" and create a new key in a new or existing Google Cloud project.
    *   **Firebase API Keys**:
        1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
        2.  Inside your project, go to **Project Settings** (⚙️ icon) > **General**.
        3.  Under "Your apps", register a new Web app (`</>`).
        4.  After registration, Firebase will provide you with the configuration object containing all the `NEXT_PUBLIC_` keys.
        5.  In the Firebase Console, go to **Build > Authentication > Settings > Authorized domains** and add the domains you will be running the app from (e.g., `localhost`).

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
.
├── src
│   ├── ai                  # Genkit flows for AI functionality
│   │   └── flows
│   ├── app                 # Next.js App Router pages and layouts
│   ├── components          # Reusable React components (UI and features)
│   │   └── ui              # ShadCN UI components
│   ├── context             # React context providers (e.g., AuthContext)
│   ├── hooks               # Custom React hooks
│   └── lib                 # Helper functions and core logic (Firebase, Firestore)
├── .env                    # Environment variables (API keys)
└── ...
```

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

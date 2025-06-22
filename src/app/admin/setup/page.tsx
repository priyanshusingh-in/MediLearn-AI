"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  doc,
  setDoc,
  writeBatch,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Loader2, CheckCircle, AlertCircle, Database } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminSetupPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Sample medical quiz questions
  const sampleQuestions = [
    {
      id: "q1",
      question: "What is the normal resting heart rate for adults?",
      options: [
        "40-60 beats per minute",
        "60-100 beats per minute",
        "100-120 beats per minute",
        "120-140 beats per minute",
      ],
      correctAnswer: 1,
      explanation:
        "The normal resting heart rate for adults ranges from 60 to 100 beats per minute.",
      category: "Cardiology",
      difficulty: "Beginner",
      points: 10,
      createdAt: serverTimestamp(),
    },
    {
      id: "q2",
      question:
        "Which hormone is produced by the pancreas to regulate blood sugar?",
      options: ["Cortisol", "Insulin", "Thyroxine", "Adrenaline"],
      correctAnswer: 1,
      explanation:
        "Insulin is produced by the beta cells in the pancreas and helps regulate blood glucose levels.",
      category: "Endocrinology",
      difficulty: "Beginner",
      points: 10,
      createdAt: serverTimestamp(),
    },
    {
      id: "q3",
      question: "What is the medical term for high blood pressure?",
      options: ["Hypotension", "Hypertension", "Tachycardia", "Bradycardia"],
      correctAnswer: 1,
      explanation:
        "Hypertension is the medical term for high blood pressure, defined as systolic pressure ≥140 mmHg or diastolic pressure ≥90 mmHg.",
      category: "Cardiology",
      difficulty: "Beginner",
      points: 10,
      createdAt: serverTimestamp(),
    },
    {
      id: "q4",
      question: "Which part of the brain controls balance and coordination?",
      options: ["Cerebrum", "Cerebellum", "Brainstem", "Hippocampus"],
      correctAnswer: 1,
      explanation:
        "The cerebellum is responsible for balance, coordination, and fine motor control.",
      category: "Neurology",
      difficulty: "Intermediate",
      points: 15,
      createdAt: serverTimestamp(),
    },
    {
      id: "q5",
      question: "What is the first-line treatment for anaphylaxis?",
      options: [
        "Corticosteroids",
        "Antihistamines",
        "Epinephrine",
        "Beta-blockers",
      ],
      correctAnswer: 2,
      explanation:
        "Epinephrine (adrenaline) is the first-line treatment for anaphylaxis and should be administered immediately.",
      category: "Emergency Medicine",
      difficulty: "Advanced",
      points: 20,
      createdAt: serverTimestamp(),
    },
  ];

  // Sample quiz categories
  const categories = [
    {
      id: "cardiology",
      name: "Cardiology",
      description: "Heart and cardiovascular system",
      icon: "❤️",
      questionCount: 2,
    },
    {
      id: "neurology",
      name: "Neurology",
      description: "Brain and nervous system",
      icon: "🧠",
      questionCount: 1,
    },
    {
      id: "endocrinology",
      name: "Endocrinology",
      description: "Hormones and endocrine system",
      icon: "⚗️",
      questionCount: 1,
    },
    {
      id: "emergency",
      name: "Emergency Medicine",
      description: "Critical care and emergency procedures",
      icon: "🚨",
      questionCount: 1,
    },
    {
      id: "general",
      name: "General Medicine",
      description: "General medical knowledge",
      icon: "🏥",
      questionCount: 0,
    },
  ];

  const setupDatabase = async () => {
    if (!user) {
      setStatus("error");
      setMessage("You must be signed in to set up the database.");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      console.log("Setting up Firestore database...");

      // Create batch for all operations
      const batch = writeBatch(db);

      // Add quiz questions
      console.log("Adding quiz questions...");
      for (const question of sampleQuestions) {
        const questionRef = doc(db, "quizQuestions", question.id);
        batch.set(questionRef, question);
      }

      // Add categories
      console.log("Adding categories...");
      for (const category of categories) {
        const categoryRef = doc(db, "quizCategories", category.id);
        batch.set(categoryRef, category);
      }

      // Add global stats
      console.log("Adding global stats...");
      const globalStatsRef = doc(db, "globalStats", "main");
      batch.set(globalStatsRef, {
        totalUsers: 0,
        totalQuizzes: 0,
        totalQuestions: sampleQuestions.length,
        averageScore: 0,
        lastUpdated: serverTimestamp(),
      });

      // Commit the batch
      await batch.commit();

      setStatus("success");
      setMessage(
        `Successfully added ${sampleQuestions.length} questions, ${categories.length} categories, and global stats to the database!`
      );
      console.log("✅ Database setup completed successfully!");
    } catch (error) {
      console.error("❌ Error setting up database:", error);
      setStatus("error");
      setMessage(
        `Failed to setup database: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please sign in to access the admin setup page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6" />
                Database Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-muted-foreground mb-4">
                  This will populate your Firestore database with sample medical
                  quiz data including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>5 sample medical quiz questions</li>
                  <li>
                    5 quiz categories (Cardiology, Neurology, Endocrinology,
                    Emergency Medicine, General Medicine)
                  </li>
                  <li>Global statistics tracking</li>
                </ul>
              </div>

              {status !== "idle" && (
                <Alert
                  variant={status === "success" ? "default" : "destructive"}
                >
                  {status === "success" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={setupDatabase}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up database...
                  </>
                ) : (
                  "Setup Database"
                )}
              </Button>

              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Note:</strong> This will add sample data to your
                  Firestore database. You only need to run this once.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

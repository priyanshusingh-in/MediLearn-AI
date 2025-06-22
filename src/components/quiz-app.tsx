"use client";

import * as React from "react";
import {
  Baby,
  Bone,
  BrainCircuit,
  HeartPulse,
  Package,
  Sparkles,
  Loader2,
} from "lucide-react";
import { getMultipleChoiceQuestions, getQuestions } from "@/app/actions";
import { SubjectSelector, type MedicalTopic } from "./subject-selector";
import {
  MultipleChoiceQuizView,
  type QuizResult,
} from "./multiple-choice-quiz-view";
import { MultipleChoiceQuizComplete } from "./multiple-choice-quiz-complete";
import { QuizView } from "./quiz-view";
import { QuizComplete } from "./quiz-complete";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { PreQuizSettings, type PreQuizSettingsData } from "./pre-quiz-settings";
import { useAuth } from "@/context/auth-context";
import { QuizQuestion } from "@/ai/flows/generate-multiple-choice-questions";

const medicalTopics: MedicalTopic[] = [
  { name: "Cardiology", icon: HeartPulse, dataHint: "heart anatomy" },
  { name: "Neurology", icon: BrainCircuit, dataHint: "brain nerves" },
  { name: "Dermatology", icon: Sparkles, dataHint: "skin care" },
  { name: "Pediatrics", icon: Baby, dataHint: "child healthcare" },
  { name: "Oncology", icon: Package, dataHint: "cancer cells" },
  { name: "Orthopedics", icon: Bone, dataHint: "human skeleton" },
];

type QuizState =
  | "selecting"
  | "pre-quiz"
  | "loading"
  | "active"
  | "finished"
  | "error";

export function QuizApp() {
  const { user } = useAuth();
  const [quizState, setQuizState] = React.useState<QuizState>("selecting");
  const [selectedTopic, setSelectedTopic] = React.useState<MedicalTopic | null>(
    null
  );
  const [quizMode, setQuizMode] = React.useState<string>("multiple-choice");
  const [questions, setQuestions] = React.useState<QuizQuestion[]>([]);
  const [openEndedQuestions, setOpenEndedQuestions] = React.useState<string[]>(
    []
  );
  const [finalScores, setFinalScores] = React.useState<number[]>([]);
  const [userAnswers, setUserAnswers] = React.useState<number[]>([]);
  const [openEndedAnswers, setOpenEndedAnswers] = React.useState<string[]>([]);
  const [timeSpent, setTimeSpent] = React.useState<number[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [quizSettings, setQuizSettings] =
    React.useState<PreQuizSettingsData | null>(null);
  const [quizResult, setQuizResult] = React.useState<QuizResult | null>(null);

  const handleTopicSelect = (topic: MedicalTopic) => {
    setSelectedTopic(topic);
  };

  const handleStartQuiz = async (settings: PreQuizSettingsData) => {
    if (!selectedTopic) return;
    setQuizState("loading");
    setError(null);
    setQuizMode(settings.quizMode);
    setQuizSettings(settings);

    try {
      if (settings.quizMode === "multiple-choice") {
        console.log(
          "🚀 Starting multiple choice question generation for topic:",
          selectedTopic.name
        );
        console.log("📝 Input details:", {
          topic: selectedTopic.name,
          preparationContext: settings.preparationContext,
          questionType: settings.questionType,
          numberOfQuestions: settings.numberOfQuestions,
        });

        const result = await getMultipleChoiceQuestions({
          topic: selectedTopic.name,
          preparationContext: settings.preparationContext,
          questionType: settings.questionType,
          numberOfQuestions: settings.numberOfQuestions,
        });

        if (result.questions && result.questions.length > 0) {
          setQuestions(result.questions);
          setQuizState("active");
        } else {
          setError(
            "Could not generate questions for this topic. Please try another."
          );
          setQuizState("error");
        }
      } else {
        const result = await getQuestions({
          topic: selectedTopic.name,
          preparationContext: settings.preparationContext,
          questionType: settings.questionType,
          numberOfQuestions: settings.numberOfQuestions,
        });
        if (result.questions && result.questions.length > 0) {
          setOpenEndedQuestions(result.questions);
          setQuizState("active");
        } else {
          setError(
            "Could not generate questions for this topic. Please try another."
          );
          setQuizState("error");
        }
      }
    } catch (e) {
      console.error("❌ Error generating quiz:", e);
      setError("An unexpected error occurred. Please try again later.");
      setQuizState("error");
    }
  };

  const handleMultipleChoiceQuizComplete = (result: QuizResult) => {
    setQuizResult(result);
    setQuizState("finished");
  };

  const handleQuizFinish = (
    scores: number[],
    answers: number[] | string[],
    timeData?: number[]
  ) => {
    setFinalScores(scores);
    if (quizMode === "multiple-choice") {
      setUserAnswers(answers as number[]);
      setTimeSpent(timeData || []);
    } else {
      setOpenEndedAnswers(answers as string[]);
    }
    setQuizState("finished");
  };

  const handleBackToSelect = () => {
    setQuizState("selecting");
  };

  const handleRestart = () => {
    setQuizState("selecting");
    setSelectedTopic(null);
    setQuestions([]);
    setOpenEndedQuestions([]);
    setFinalScores([]);
    setUserAnswers([]);
    setOpenEndedAnswers([]);
    setTimeSpent([]);
    setError(null);
    setQuizResult(null);
    setQuizSettings(null);
  };

  const renderContent = () => {
    switch (quizState) {
      case "loading":
        return (
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-semibold">
              Generating your personalized quiz...
            </p>
            <p className="text-muted-foreground">This may take a moment.</p>
          </div>
        );
      case "pre-quiz":
        return (
          <PreQuizSettings
            topic={selectedTopic!}
            onSubmit={handleStartQuiz}
            onBack={handleBackToSelect}
          />
        );
      case "active":
        return quizMode === "multiple-choice" ? (
          <MultipleChoiceQuizView
            questions={questions}
            onComplete={handleMultipleChoiceQuizComplete}
            category={selectedTopic!.name}
            difficulty={quizSettings?.preparationContext || "General"}
          />
        ) : (
          <QuizView
            topic={selectedTopic!.name}
            questions={openEndedQuestions}
            onFinish={handleQuizFinish}
            onExit={handleRestart}
          />
        );
      case "finished":
        return quizMode === "multiple-choice" && quizResult ? (
          <MultipleChoiceQuizComplete
            result={quizResult}
            category={selectedTopic!.name}
            difficulty={quizSettings?.preparationContext || "General"}
            userId={user?.uid || null}
            onStartNew={handleRestart}
            onGoHome={handleRestart}
          />
        ) : (
          <QuizComplete
            topic={selectedTopic!.name}
            scores={finalScores}
            questions={openEndedQuestions}
            answers={openEndedAnswers}
            onRestart={handleRestart}
          />
        );
      case "error":
        return (
          <div className="w-full max-w-md">
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={handleRestart} className="mt-4 w-full">
              Try Again
            </Button>
          </div>
        );
      case "selecting":
      default:
        return (
          <div className="w-full max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Choose a Medical Specialty
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Select a topic to generate your personalized study questions.
            </p>
            <SubjectSelector
              topics={medicalTopics}
              selectedTopic={selectedTopic}
              onTopicSelect={handleTopicSelect}
            />
            <Button
              size="lg"
              onClick={() => setQuizState("pre-quiz")}
              disabled={!selectedTopic}
              className="mt-8 transition-all duration-300"
            >
              Continue
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8">
        {renderContent()}
      </main>
      <footer className="text-center p-4 text-xs text-muted-foreground/80 bg-background/50">
        <p>Powered by AI for a smarter way to learn medicine.</p>
      </footer>
    </div>
  );
}

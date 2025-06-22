"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { QuizQuestion } from "@/ai/flows/generate-multiple-choice-questions";
import { cn } from "@/lib/utils";

interface MultipleChoiceQuizViewProps {
  questions: QuizQuestion[];
  onComplete: (results: QuizResult) => void;
  category: string;
  difficulty: string;
}

export interface QuizResult {
  score: number;
  totalPoints: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
  answers: {
    questionId: string;
    userAnswerIndex: number | null;
    isCorrect: boolean;
    points: number;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  }[];
}

export function MultipleChoiceQuizView({
  questions,
  onComplete,
  category,
  difficulty,
}: MultipleChoiceQuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<QuizResult["answers"]>([]);
  const [startTime] = useState<Date>(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(
        Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleOptionSelect = (optionIndex: number) => {
    if (selectedOption !== null) return; // Prevent changing answer after selection

    setSelectedOption(optionIndex);
    setShowExplanation(true);

    const isCorrect = optionIndex === currentQuestion.correctAnswer;

    setAnswers([
      ...answers,
      {
        questionId: currentQuestion.id,
        userAnswerIndex: optionIndex,
        isCorrect,
        points: isCorrect ? currentQuestion.points : 0,
        question: currentQuestion.question,
        options: currentQuestion.options,
        correctAnswerIndex: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation,
      },
    ]);
  };

  const handleSkip = () => {
    setAnswers([
      ...answers,
      {
        questionId: currentQuestion.id,
        userAnswerIndex: null,
        isCorrect: false,
        points: 0,
        question: currentQuestion.question,
        options: currentQuestion.options,
        correctAnswerIndex: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation,
      },
    ]);

    goToNextQuestion();
  };

  const goToNextQuestion = () => {
    if (isLastQuestion) {
      // Calculate final results
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      const score = answers.reduce((sum, a) => sum + a.points, 0);
      const correctAnswers = answers.filter((a) => a.isCorrect).length;

      onComplete({
        score,
        totalPoints,
        totalQuestions: questions.length,
        correctAnswers,
        timeSpent: elapsedTime,
        answers: [...answers],
      });
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  // Calculate progress percentage
  const progressPercentage =
    ((currentQuestionIndex + 1) / questions.length) * 100;

  if (!currentQuestion) {
    return <div className="text-center p-8">Loading questions...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Header with progress and timer */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{category}</Badge>
          <Badge variant="outline">{difficulty}</Badge>
          <Badge>{currentQuestion.difficulty}</Badge>
          <Badge variant="secondary">{currentQuestion.points} pts</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
        <div
          className="h-2 bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Question */}
      <h2 className="text-xl font-semibold mb-6">
        {currentQuestionIndex + 1}. {currentQuestion.question}
      </h2>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((option, index) => {
          const isSelected = selectedOption === index;
          const isCorrect = index === currentQuestion.correctAnswer;
          const showResult = showExplanation;

          let optionClass =
            "border p-4 rounded-lg cursor-pointer transition-all";

          if (showResult) {
            if (isCorrect) {
              optionClass += " border-green-500 bg-green-50";
            } else if (isSelected && !isCorrect) {
              optionClass += " border-red-500 bg-red-50";
            }
          } else if (isSelected) {
            optionClass += " border-primary";
          } else {
            optionClass += " hover:border-gray-400";
          }

          return (
            <div
              key={index}
              className={optionClass}
              onClick={() => handleOptionSelect(index)}
            >
              <div className="flex justify-between items-center">
                <span>{option}</span>
                {showResult && isCorrect && (
                  <CheckCircle className="text-green-500 h-5 w-5" />
                )}
                {showResult && isSelected && !isCorrect && (
                  <XCircle className="text-red-500 h-5 w-5" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <Card
          className={cn(
            "p-4 mb-6 border-l-4",
            selectedOption === currentQuestion.correctAnswer
              ? "border-l-green-500"
              : "border-l-red-500"
          )}
        >
          <div className="flex gap-2 items-start">
            {selectedOption === currentQuestion.correctAnswer ? (
              <CheckCircle className="text-green-500 h-5 w-5 mt-1 flex-shrink-0" />
            ) : (
              <AlertCircle className="text-red-500 h-5 w-5 mt-1 flex-shrink-0" />
            )}
            <div>
              <p className="font-semibold mb-1">
                {selectedOption === currentQuestion.correctAnswer
                  ? "Correct!"
                  : "Incorrect"}
              </p>
              <p className="text-gray-700">{currentQuestion.explanation}</p>
              {selectedOption !== currentQuestion.correctAnswer && (
                <p className="mt-2 font-medium">
                  Correct answer:{" "}
                  {currentQuestion.options[currentQuestion.correctAnswer]}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        {!showExplanation && (
          <Button variant="outline" onClick={handleSkip}>
            Skip
          </Button>
        )}
        {showExplanation && (
          <Button onClick={goToNextQuestion} className="ml-auto">
            {isLastQuestion ? "Finish Quiz" : "Next Question"}
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

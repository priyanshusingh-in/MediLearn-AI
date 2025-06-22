"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  BarChart,
  Home,
  RotateCcw,
} from "lucide-react";
import { QuizResult } from "./multiple-choice-quiz-view";
import { cn } from "@/lib/utils";
import { saveQuizResult } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";

interface MultipleChoiceQuizCompleteProps {
  result: QuizResult;
  category: string;
  difficulty: string;
  userId: string | null;
  onStartNew: () => void;
  onGoHome: () => void;
}

export function MultipleChoiceQuizComplete({
  result,
  category,
  difficulty,
  userId,
  onStartNew,
  onGoHome,
}: MultipleChoiceQuizCompleteProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate percentage score
  const percentageScore = Math.round((result.score / result.totalPoints) * 100);

  // Get performance category
  const getPerformanceCategory = () => {
    if (percentageScore >= 90)
      return { label: "Excellent", color: "text-green-600" };
    if (percentageScore >= 75) return { label: "Good", color: "text-blue-600" };
    if (percentageScore >= 60)
      return { label: "Satisfactory", color: "text-yellow-600" };
    return { label: "Needs Improvement", color: "text-red-600" };
  };

  const performance = getPerformanceCategory();

  // Get encouraging message based on performance
  const getEncouragingMessage = () => {
    if (percentageScore >= 90)
      return "Outstanding work! You've mastered this topic!";
    if (percentageScore >= 75)
      return "Great job! You have a solid understanding of the material.";
    if (percentageScore >= 60)
      return "Good effort! With a bit more study, you'll excel in this area.";
    return "Keep practicing! Medical knowledge takes time to build.";
  };

  // Save result to database
  const handleSaveResult = async () => {
    if (!userId) {
      toast({
        title: "Not signed in",
        description: "Please sign in to save your quiz results.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      await saveQuizResult({
        userId,
        score: result.score,
        totalPoints: result.totalPoints,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        category,
        difficulty,
        completedAt: new Date(),
        timeSpent: result.timeSpent,
        answers: result.answers.map((a) => ({
          questionId: a.questionId,
          userAnswerIndex: a.userAnswerIndex,
          isCorrect: a.isCorrect,
          points: a.points,
        })),
      });

      setSaved(true);
      toast({
        title: "Results saved",
        description: "Your quiz results have been saved to your profile.",
      });
    } catch (error) {
      console.error("Error saving quiz result:", error);
      toast({
        title: "Error saving results",
        description: "There was a problem saving your quiz results.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="w-full shadow-md mb-8">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h3 className="text-lg text-muted-foreground">Quiz Results</h3>
              <CardTitle className="text-2xl font-bold">
                {category} - {difficulty}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Time: {formatTime(result.timeSpent)}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg">
              <div className="text-4xl font-bold mb-2">{percentageScore}%</div>
              <div className={cn("font-medium", performance.color)}>
                {performance.label}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Overall Score
              </div>
            </div>

            <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg">
              <div className="text-4xl font-bold mb-2">{result.score}</div>
              <div className="text-sm text-muted-foreground">
                out of {result.totalPoints} points
              </div>
            </div>

            <div className="flex flex-col items-center p-4 bg-primary/5 rounded-lg">
              <div className="text-4xl font-bold mb-2">
                {result.correctAnswers}
              </div>
              <div className="text-sm text-muted-foreground">
                out of {result.totalQuestions} questions
              </div>
            </div>
          </div>

          <div className="mb-8 p-4 border rounded-lg bg-secondary/10">
            <p className="text-center italic">{getEncouragingMessage()}</p>
          </div>

          {/* Question breakdown */}
          <h3 className="text-xl font-semibold mb-4">Question Breakdown</h3>
          <div className="space-y-4">
            {result.answers.map((answer, index) => (
              <div key={answer.questionId} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  {answer.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">
                        {index + 1}. {answer.question}
                      </h4>
                      <Badge
                        variant={answer.isCorrect ? "default" : "destructive"}
                        className="ml-2"
                      >
                        {answer.isCorrect ? `+${answer.points} pts` : "0 pts"}
                      </Badge>
                    </div>

                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {answer.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={cn(
                            "p-2 rounded text-sm",
                            optionIndex === answer.correctAnswerIndex &&
                              "bg-green-50 border-l-4 border-green-500",
                            answer.userAnswerIndex === optionIndex &&
                              optionIndex !== answer.correctAnswerIndex &&
                              "bg-red-50 border-l-4 border-red-500"
                          )}
                        >
                          {option}
                          {optionIndex === answer.correctAnswerIndex && (
                            <span className="ml-2 text-green-600">
                              (Correct)
                            </span>
                          )}
                          {answer.userAnswerIndex === optionIndex &&
                            optionIndex !== answer.correctAnswerIndex && (
                              <span className="ml-2 text-red-600">
                                (Your answer)
                              </span>
                            )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 text-sm text-gray-700">
                      <strong>Explanation:</strong> {answer.explanation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t bg-primary/5">
          <Button
            onClick={onGoHome}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>

          <Button
            onClick={onStartNew}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            New Quiz
          </Button>

          {!saved && (
            <Button
              onClick={handleSaveResult}
              disabled={saving || !userId}
              className="w-full sm:w-auto sm:ml-auto"
            >
              {saving ? "Saving..." : "Save Results"}
              {!saving && <Award className="ml-2 h-4 w-4" />}
            </Button>
          )}

          {saved && (
            <Button
              variant="secondary"
              disabled
              className="w-full sm:w-auto sm:ml-auto"
            >
              Results Saved
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

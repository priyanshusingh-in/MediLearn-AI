"use client";

import { useState, useEffect } from "react";
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
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { QuizResult } from "./multiple-choice-quiz-view";
import { cn } from "@/lib/utils";
import { updateUserQuizStats } from "@/lib/firestore";
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
  const [scoreSaved, setScoreSaved] = useState(false);
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
      return {
        label: "Excellent",
        color: "text-green-600 dark:text-green-400",
      };
    if (percentageScore >= 75)
      return { label: "Good", color: "text-blue-600 dark:text-blue-400" };
    if (percentageScore >= 60)
      return {
        label: "Satisfactory",
        color: "text-yellow-600 dark:text-yellow-400",
      };
    return {
      label: "Needs Improvement",
      color: "text-red-600 dark:text-red-400",
    };
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

  // Get personalized improvement notes
  const getImprovementNotes = () => {
    const notes = [];
    
    if (percentageScore < 90) {
      notes.push("Focus on reviewing the questions you missed to strengthen your understanding.");
    }
    
    if (percentageScore < 75) {
      notes.push("Consider spending more time on foundational concepts before moving to advanced topics.");
    }
    
    if (percentageScore < 60) {
      notes.push("This topic may need more dedicated study time. Try breaking it down into smaller sections.");
    }
    
    // Add specific improvement suggestions based on performance
    if (result.correctAnswers < result.totalQuestions * 0.8) {
      notes.push("Practice with more questions in this category to improve your accuracy.");
    }
    
    if (result.timeSpent < 30) {
      notes.push("Take your time reading questions carefully - accuracy is more important than speed.");
    }
    
    if (notes.length === 0) {
      notes.push("Excellent performance! Consider challenging yourself with more difficult questions.");
    }
    
    return notes;
  };

  // Save score to leaderboard
  useEffect(() => {
    const saveScoreToLeaderboard = async () => {
      if (!userId) return;

      try {
        const averageScore = result.score / result.totalQuestions;
        await updateUserQuizStats(userId, averageScore);
        setScoreSaved(true);
        toast({
          title: "Score saved",
          description: "Your score has been added to the leaderboard.",
        });
      } catch (error) {
        console.error("Error saving score to leaderboard:", error);
        toast({
          title: "Error saving score",
          description: "There was a problem saving your score to the leaderboard.",
          variant: "destructive",
        });
      }
    };

    saveScoreToLeaderboard();
  }, [userId, result.score, result.totalQuestions, toast]);

  const improvementNotes = getImprovementNotes();

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

          {/* Improvement Notes */}
          <div className="mb-8 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">Personalized Improvement Notes</h3>
            </div>
            <ul className="space-y-2">
              {improvementNotes.map((note, index) => (
                <li key={index} className="text-sm text-blue-700 dark:text-blue-300 flex items-start">
                  <span className="mr-2 mt-1">•</span>
                  {note}
                </li>
              ))}
            </ul>
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
                              "bg-green-500/10 dark:bg-green-500/20 border-l-4 border-green-500",
                            answer.userAnswerIndex === optionIndex &&
                              optionIndex !== answer.correctAnswerIndex &&
                              "bg-red-500/10 dark:bg-red-500/20 border-l-4 border-red-500"
                          )}
                        >
                          {option}
                          {optionIndex === answer.correctAnswerIndex && (
                            <span className="ml-2 text-green-600 dark:text-green-400">
                              (Correct)
                            </span>
                          )}
                          {answer.userAnswerIndex === optionIndex &&
                            optionIndex !== answer.correctAnswerIndex && (
                              <span className="ml-2 text-red-600 dark:text-red-400">
                                (Your answer)
                              </span>
                            )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
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

          {scoreSaved && (
            <Button
              variant="secondary"
              disabled
              className="w-full sm:w-auto sm:ml-auto"
            >
              Score Saved to Leaderboard
              <TrendingUp className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

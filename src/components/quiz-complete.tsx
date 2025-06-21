'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Star } from 'lucide-react';

interface QuizCompleteProps {
  topic: string;
  scores: number[];
  onRestart: () => void;
}

export function QuizComplete({ topic, scores, onRestart }: QuizCompleteProps) {
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const averageScore = scores.length > 0 ? (totalScore / scores.length).toFixed(1) : '0.0';

  return (
    <Card className="w-full max-w-md text-center shadow-lg">
      <CardHeader>
        <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">Quiz Complete!</CardTitle>
        <CardDescription className="text-muted-foreground">
          You've successfully completed the quiz on {topic}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-2">
            <p className="text-lg font-semibold">Here's your result:</p>
            <div className="flex items-center justify-center gap-2 text-4xl font-bold text-primary">
                <Star className="h-8 w-8" />
                <span>{averageScore} / 10</span>
            </div>
            <p className="text-sm text-muted-foreground">Average Score</p>
        </div>
        <p className="mb-6">
          Keep up the great work! Continuous learning is key in the medical field.
        </p>
        <Button size="lg" onClick={onRestart} className="w-full">
          Take Another Quiz
        </Button>
      </CardContent>
    </Card>
  );
}

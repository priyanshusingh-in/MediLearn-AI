'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface QuizCompleteProps {
  topic: string;
  onRestart: () => void;
}

export function QuizComplete({ topic, onRestart }: QuizCompleteProps) {
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

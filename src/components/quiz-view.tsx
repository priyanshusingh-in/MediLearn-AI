'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X } from 'lucide-react';

interface QuizViewProps {
  topic: string;
  questions: string[];
  onFinish: () => void;
  onExit: () => void;
}

export function QuizView({ topic, questions, onFinish, onExit }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isFlipped, setIsFlipped] = React.useState(false);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      onFinish();
    }
  };
  
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="w-full max-w-2xl flex flex-col items-center">
       <div className="w-full flex items-center justify-between mb-4">
        <div className="w-full">
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-primary">{topic}</span>
                <span className="text-sm text-muted-foreground">
                    Question {currentIndex + 1} of {questions.length}
                </span>
            </div>
            <Progress value={progress} className="w-full h-2" />
        </div>
        <Button variant="ghost" size="icon" className="ml-4" onClick={onExit}>
            <X className="h-5 w-5" />
        </Button>
      </div>

      <Card className="w-full min-h-[300px] flex flex-col justify-center items-center text-center p-6 shadow-xl">
        <CardContent>
          <p className="text-2xl font-semibold leading-relaxed text-foreground">
            {questions[currentIndex]}
          </p>
        </CardContent>
      </Card>
      <Button size="lg" onClick={handleNext} className="mt-8 w-full max-w-sm">
        {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
      </Button>
    </div>
  );
}

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Loader2 } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { verifyAnswerAction } from '@/app/actions';
import { Badge } from './ui/badge';

interface QuizViewProps {
  topic: string;
  questions: string[];
  onFinish: (scores: number[]) => void;
  onExit: () => void;
}

type VerificationStatus = 'unverified' | 'verifying' | 'verified';

interface VerificationResult {
    score: number;
    feedback: string;
}

export function QuizView({ topic, questions, onFinish, onExit }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [currentAnswer, setCurrentAnswer] = React.useState('');
  const [status, setStatus] = React.useState<VerificationStatus>('unverified');
  const [result, setResult] = React.useState<VerificationResult | null>(null);
  const [scores, setScores] = React.useState<number[]>([]);

  const currentQuestion = questions[currentIndex];

  const handleSubmit = async () => {
    if (!currentAnswer.trim()) return;
    setStatus('verifying');
    setResult(null);
    const verificationResult = await verifyAnswerAction({ question: currentQuestion, answer: currentAnswer });
    setResult(verificationResult);
    setScores([...scores, verificationResult.score]);
    setStatus('verified');
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setStatus('unverified');
      setCurrentAnswer('');
      setResult(null);
    } else {
      onFinish(scores);
    }
  };
  
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const wordCount = currentAnswer.trim().split(/\s+/).filter(Boolean).length;

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

      <Card className="w-full min-h-[450px] flex flex-col p-6 shadow-xl">
        <CardContent className="flex flex-col flex-grow">
          <p className="text-xl font-semibold leading-relaxed text-foreground mb-4">
            {currentQuestion}
          </p>
          <div className="relative flex-grow">
            <Textarea
              placeholder="Type your answer here (25-50 words)..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="h-full resize-none"
              disabled={status !== 'unverified'}
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {wordCount} words
            </div>
          </div>
        </CardContent>
      </Card>
      
      {status === 'verified' && result && (
        <Card className="mt-4 w-full bg-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span>Result</span>
              <Badge variant={result.score >= 7 ? 'default' : 'destructive'} className={result.score >= 7 ? 'bg-primary' : ''}>
                Score: {result.score} / 10
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{result.feedback}</p>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 w-full max-w-sm">
        {status === 'unverified' && (
          <Button size="lg" onClick={handleSubmit} disabled={wordCount < 25 || wordCount > 50} className="w-full">
            Submit Answer
          </Button>
        )}
        {status === 'verifying' && (
          <Button size="lg" disabled className="w-full">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Verifying...
          </Button>
        )}
        {status === 'verified' && (
          <Button size="lg" onClick={handleNext} className="w-full">
            {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </Button>
        )}
      </div>
    </div>
  );
}

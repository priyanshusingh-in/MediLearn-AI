'use client';

import * as React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Loader2 } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { verifyAnswerAction } from '@/app/actions';
import { Badge } from './ui/badge';

interface QuizViewProps {
  topic: string;
  questions: string[];
  onFinish: (scores: number[], answers: string[]) => void;
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
  const [answers, setAnswers] = React.useState<string[]>([]);

  const currentQuestion = questions[currentIndex];

  const handleSubmit = async () => {
    if (!currentAnswer.trim()) return;
    setStatus('verifying');
    setResult(null);
    const verificationResult = await verifyAnswerAction({ question: currentQuestion, answer: currentAnswer });
    setResult(verificationResult);
    setScores([...scores, verificationResult.score]);
    setAnswers([...answers, currentAnswer]);
    setStatus('verified');
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setStatus('unverified');
      setCurrentAnswer('');
      setResult(null);
    } else {
      onFinish(scores, answers);
    }
  };

  const handleSkip = () => {
    const updatedScores = [...scores, 0];
    const updatedAnswers = [...answers, '[SKIPPED]'];
    setScores(updatedScores);
    setAnswers(updatedAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setStatus('unverified');
      setCurrentAnswer('');
      setResult(null);
    } else {
      onFinish(updatedScores, updatedAnswers);
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

      <Card className="w-full shadow-xl">
        <CardHeader key={currentIndex}>
            <p className="text-xl font-semibold leading-relaxed text-foreground animate-in fade-in duration-500">
                {currentQuestion}
            </p>
        </CardHeader>
        <CardContent>
          <div className="relative min-h-[150px]">
            <Textarea
              placeholder="Type your answer here (minimum 25 words)..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onPaste={(e) => e.preventDefault()}
              className="h-full resize-none"
              disabled={status !== 'unverified'}
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {wordCount} words
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full">
            {status === 'unverified' && (
              <div className="flex flex-col-reverse sm:flex-row gap-2 w-full">
                <Button size="lg" onClick={handleSubmit} disabled={wordCount < 25} className="w-full">
                  Submit Answer
                </Button>
                 <Button size="lg" onClick={handleSkip} variant="outline" className="w-full sm:w-auto sm:px-8">
                  Skip
                </Button>
              </div>
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
        </CardFooter>
      </Card>
      
      <div className="w-full min-h-[160px]">
        {status === 'verified' && result && (
          <Card className="mt-4 w-full bg-secondary/50 animate-in fade-in slide-in-from-top-4 duration-500">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Result</span>
                <Badge variant={result.score >= 7 ? 'default' : 'destructive'}>
                  Score: {result.score} / 10
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80">{result.feedback}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

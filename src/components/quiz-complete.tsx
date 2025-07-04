'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Star, Lightbulb } from 'lucide-react';
import { generateFeedbackAction } from '@/app/actions';
import { Skeleton } from './ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { updateUserQuizStats } from '@/lib/firestore';

interface QuizCompleteProps {
  topic: string;
  scores: number[];
  questions: string[];
  answers: string[];
  onRestart: () => void;
}

export function QuizComplete({ topic, scores, questions, answers, onRestart }: QuizCompleteProps) {
  const { user } = useAuth();
  const [feedback, setFeedback] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);

  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const averageScore = scores.length > 0 ? (totalScore / (scores.length * 10) * 10).toFixed(1) : '0.0';

  React.useEffect(() => {
    const getFeedbackAndSaveScore = async () => {
      if (!questions || questions.length === 0) return;
      setIsLoading(true);
      const quizResults = questions.map((q, i) => ({
        question: q,
        answer: answers[i] || '',
        score: scores[i] || 0,
      }));
      
      // Save score if user is logged in
      if (user) {
        const totalQuizScore = scores.reduce((acc, score) => acc + score, 0);
        const averageQuizScore = scores.length > 0 ? totalQuizScore / scores.length : 0;
        await updateUserQuizStats(user.uid, averageQuizScore);
      }
      
      try {
        const result = await generateFeedbackAction({ topic, results: quizResults });
        setFeedback(result.feedback);
      } catch (error) {
        setFeedback('Sorry, we couldn\'t generate your feedback at this time. Please try another quiz.');
      } finally {
        setIsLoading(false);
      }
    };
    getFeedbackAndSaveScore();
  }, [topic, questions, answers, scores, user]);

  const renderFeedback = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-6 w-1/4 mt-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      );
    }

    const formattedFeedback = feedback.split('\n').map((line, index) => {
      const boldedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      if (boldedLine.startsWith('# ')) {
        const content = boldedLine.substring(2);
        return <h2 key={index} className="text-xl font-bold mt-6 mb-3 border-b pb-2" dangerouslySetInnerHTML={{ __html: content }} />;
      }
      if (boldedLine.trim() === '') {
        return <br key={index} />;
      }
      if (boldedLine.trim().startsWith('* ')) {
        const content = boldedLine.substring(boldedLine.indexOf('* ') + 2);
        return (
          <p key={index} className="text-sm text-foreground/80 leading-relaxed flex items-start">
            <span className="mr-2 mt-1">•</span>
            <span dangerouslySetInnerHTML={{ __html: content }} />
          </p>
        );
      }
      return <p key={index} className="text-sm text-foreground/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: boldedLine }} />;
    });

    return <div className="text-left space-y-2">{formattedFeedback}</div>;
  };

  return (
    <div className="w-full max-w-2xl flex flex-col gap-6">
      <Card className="w-full text-center shadow-xl border-0 animate-in fade-in slide-in-from-top-12 duration-500 ease-out">
        <CardHeader>
          <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
              <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Quiz Complete!</CardTitle>
          <CardDescription className="text-foreground/80 pt-1">
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
          <Button size="lg" onClick={onRestart} className="w-full">
            Take Another Quiz
          </Button>
        </CardContent>
      </Card>

      <Card className="w-full shadow-xl border-0 animate-in fade-in slide-in-from-top-12 duration-500 ease-out delay-200">
        <CardHeader>
            <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-full p-2">
                    <Lightbulb className="h-6 w-6 text-primary"/>
                </div>
                <div>
                    <CardTitle className="text-2xl">Personalized Feedback</CardTitle>
                    <CardDescription>Actionable advice to guide your learning journey.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            {renderFeedback()}
        </CardContent>
      </Card>
    </div>
  );
}

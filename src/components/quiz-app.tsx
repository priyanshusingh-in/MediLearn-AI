'use client';

import * as React from 'react';
import {
  Baby,
  Bone,
  BrainCircuit,
  HeartPulse,
  Package,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { getQuestions } from '@/app/actions';
import { SubjectSelector, type MedicalTopic } from './subject-selector';
import { QuizView } from './quiz-view';
import { QuizComplete } from './quiz-complete';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { PreQuizSettings, type PreQuizSettingsData } from './pre-quiz-settings';

const medicalTopics: MedicalTopic[] = [
  { name: 'Cardiology', icon: HeartPulse, dataHint: "heart anatomy" },
  { name: 'Neurology', icon: BrainCircuit, dataHint: "brain nerves" },
  { name: 'Dermatology', icon: Sparkles, dataHint: "skin care" },
  { name: 'Pediatrics', icon: Baby, dataHint: "child healthcare" },
  { name: 'Oncology', icon: Package, dataHint: "cancer cells" },
  { name: 'Orthopedics', icon: Bone, dataHint: "human skeleton" },
];

type QuizState = 'selecting' | 'pre-quiz' | 'loading' | 'active' | 'finished' | 'error';

export function QuizApp() {
  const [quizState, setQuizState] = React.useState<QuizState>('selecting');
  const [selectedTopic, setSelectedTopic] = React.useState<MedicalTopic | null>(null);
  const [questions, setQuestions] = React.useState<string[]>([]);
  const [finalScores, setFinalScores] = React.useState<number[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const handleTopicSelect = (topic: MedicalTopic) => {
    setSelectedTopic(topic);
  };

  const handleStartQuiz = async (settings: PreQuizSettingsData) => {
    if (!selectedTopic) return;
    setQuizState('loading');
    setError(null);
    try {
      const result = await getQuestions({
        topic: selectedTopic.name,
        preparationContext: settings.preparationContext,
        questionType: settings.questionType,
      });
      if (result.questions && result.questions.length > 0) {
        setQuestions(result.questions);
        setQuizState('active');
      } else {
        setError('Could not generate questions for this topic. Please try another.');
        setQuizState('error');
      }
    } catch (e) {
      setError('An unexpected error occurred. Please try again later.');
      setQuizState('error');
    }
  };

  const handleQuizFinish = (scores: number[]) => {
    setFinalScores(scores);
    setQuizState('finished');
  };

  const handleBackToSelect = () => {
    setQuizState('selecting');
  }

  const handleRestart = () => {
    setQuizState('selecting');
    setSelectedTopic(null);
    setQuestions([]);
    setFinalScores([]);
    setError(null);
  };

  const renderContent = () => {
    switch (quizState) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-semibold">Generating your personalized quiz...</p>
            <p className="text-muted-foreground">This may take a moment.</p>
          </div>
        );
      case 'pre-quiz':
        return (
            <PreQuizSettings
                topic={selectedTopic!}
                onSubmit={handleStartQuiz}
                onBack={handleBackToSelect}
            />
        );
      case 'active':
        return (
          <QuizView
            topic={selectedTopic!.name}
            questions={questions}
            onFinish={handleQuizFinish}
            onExit={handleRestart}
          />
        );
      case 'finished':
        return <QuizComplete topic={selectedTopic!.name} scores={finalScores} onRestart={handleRestart} />;
      case 'error':
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
      case 'selecting':
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
              onClick={() => setQuizState('pre-quiz')}
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
    <div className="min-h-screen flex flex-col">
      <header className="p-4 flex items-center gap-2 border-b">
        <BrainCircuit className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">MediLearn AI</h1>
      </header>
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8">
        {renderContent()}
      </main>
      <footer className="text-center p-4 text-xs text-muted-foreground/80">
        <p>Powered by AI for a smarter way to learn medicine.</p>
      </footer>
    </div>
  );
}

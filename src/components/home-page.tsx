
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, BrainCircuit, Lightbulb, BarChart3, ArrowRight } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

const features = [
  {
    icon: <BrainCircuit className="h-10 w-10 text-primary" />,
    title: 'Personalized Quizzes',
    description: 'Our AI generates custom quizzes based on your chosen medical topic and learning goals.',
  },
  {
    icon: <Lightbulb className="h-10 w-10 text-primary" />,
    title: 'In-Depth Feedback',
    description: 'Receive detailed, constructive feedback and a personalized study plan to improve your knowledge.',
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-primary" />,
    title: 'Customizable Experience',
    description: 'Tailor your quizzes by number of questions, question type, and your specific preparation context.',
  },
];

export function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 flex items-center justify-between gap-2 border-b shadow-sm sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">MediLearn AI</h1>
        </div>
        <div className="flex items-center gap-4">
            <Link href="/quiz">
                <Button variant="ghost">Take a Quiz</Button>
            </Link>
            <ThemeToggle />
        </div>
      </header>
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="text-center py-20 px-4 sm:py-28">
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Smarter Medical Study, Powered by AI
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Stop memorizing, start understanding. MediLearn AI creates dynamic quizzes and personalized feedback to help you master any medical topic.
          </p>
          <div className="mt-10">
            <Link href="/quiz">
              <Button size="lg" className="group">
                Start Learning Now <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-secondary/50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-foreground">Why MediLearn AI?</h3>
              <p className="mt-4 text-muted-foreground">An intelligent approach to medical education.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <footer className="text-center p-4 text-xs text-muted-foreground/80 bg-background/50">
        <p>Powered by AI for a smarter way to learn medicine.</p>
      </footer>
    </div>
  );
}

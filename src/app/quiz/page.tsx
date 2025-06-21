'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuizApp } from '@/components/quiz-app';
import { Header } from '@/components/header';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

export default function QuizPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <QuizApp />
    </>
  );
}

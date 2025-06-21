'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { QuizApp } from '@/components/quiz-app';
import { Header } from '@/components/header';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

export default function QuizPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      sessionStorage.setItem('redirectAfterLogin', pathname);
      router.push('/signin');
    }
  }, [user, loading, router, pathname]);

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

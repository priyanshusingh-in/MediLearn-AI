'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { SigninForm } from '@/components/signin-form';
import Link from 'next/link';
import { Stethoscope, Loader2 } from 'lucide-react';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function SigninPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);

  useEffect(() => {
    // This effect is specifically to handle the result of a Google Sign-In redirect.
    // It runs once when the component mounts to "catch" the login information.
    const handleRedirect = async () => {
      try {
        await getRedirectResult(auth);
        // If getRedirectResult resolves, onAuthStateChanged in our AuthContext
        // will fire with the new user state, which will then trigger the second useEffect.
      } catch (error) {
        console.error("Error processing sign-in redirect:", error);
      } finally {
        // No matter the outcome, we are done processing the redirect attempt.
        setIsProcessingRedirect(false);
      }
    };
    handleRedirect();
  }, []);

  useEffect(() => {
    // This effect handles redirecting the user away from the sign-in page
    // if they are already authenticated. It waits for the redirect check to finish.
    if (!isProcessingRedirect && !authLoading && user) {
      const redirectPath = sessionStorage.getItem('redirectAfterLogin');
      sessionStorage.removeItem('redirectAfterLogin');
      router.push(redirectPath || '/quiz');
    }
  }, [user, authLoading, isProcessingRedirect, router]);

  // Show a loader if we are processing the redirect, if the auth state is loading,
  // or if a user is logged in (which means they are about to be redirected).
  if (isProcessingRedirect || authLoading || user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="mb-4 flex items-center gap-2">
            <Stethoscope className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">MediLearn AI</h1>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Sign in to your account</h2>
          <p className="mt-2 text-muted-foreground">
            to continue to your personalized quiz experience
          </p>
        </div>
        <SigninForm />
      </div>
    </div>
  );
}

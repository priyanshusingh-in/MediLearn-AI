"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { SigninForm } from "@/components/signin-form";
import { FirebaseDebug } from "@/components/firebase-debug";
import Link from "next/link";
import { Stethoscope, Loader2 } from "lucide-react";
import { getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SigninPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);

  useEffect(() => {
    // This effect runs once on mount to process any pending redirect from Google.
    const processRedirect = async () => {
      try {
        await getRedirectResult(auth);
        // If getRedirectResult is successful, onAuthStateChanged in our AuthContext
        // will fire with the new user state, which will then trigger the second useEffect.
      } catch (error) {
        console.error("Error processing sign-in redirect:", error);
      } finally {
        // Regardless of outcome, we're done with the redirect check.
        setIsProcessingRedirect(false);
      }
    };
    processRedirect();
  }, []); // Empty dependency array ensures this runs only once.

  useEffect(() => {
    // This effect handles redirecting the user away from the sign-in page if they are authenticated.
    // It waits for BOTH the redirect check and the initial auth load to be complete.
    if (!isProcessingRedirect && !authLoading && user) {
      const redirectPath = sessionStorage.getItem("redirectAfterLogin");
      sessionStorage.removeItem("redirectAfterLogin");
      router.push(redirectPath || "/quiz");
    }
  }, [user, authLoading, isProcessingRedirect, router]);

  // Show a loader if we are still processing the redirect OR waiting for the initial auth state from Firebase.
  // We do NOT check for `user` here, as that would cause a permanent loading screen.
  // The useEffect hook above will handle redirecting if a user is found.
  if (isProcessingRedirect || authLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If a user object exists, we show a loader while we are preparing to redirect them.
  // This prevents the sign-in form from flashing on screen for a logged-in user.
  if (user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If we are done with all loading/processing and there is no user, show the sign-in page.
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="mb-4 flex items-center gap-2">
            <Stethoscope className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">MediLearn AI</h1>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">
            Sign in to your account
          </h2>
          <p className="mt-2 text-muted-foreground">
            to continue to your personalized quiz experience
          </p>
        </div>

        {/* Temporary debug component - remove in production */}
        {process.env.NODE_ENV === "development" && <FirebaseDebug />}

        <SigninForm />
      </div>
    </div>
  );
}

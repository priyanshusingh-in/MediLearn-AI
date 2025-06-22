"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  getRedirectResult,
  Auth,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="24px"
      height="24px"
    >
      <path
        fill="#FFC107"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      />
      <path
        fill="#FF3D00"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      />
      <path
        fill="#1976D2"
        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.901,35.636,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      />
    </svg>
  );
}

export function SigninForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Check for redirect result on component mount
  useEffect(() => {
    async function checkRedirectResult() {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log("Redirect sign-in successful:", result.user);

          toast({
            title: "Sign in successful",
            description: `Welcome, ${
              result.user.displayName || result.user.email
            }!`,
          });

          // Handle redirect after login
          const redirectPath =
            sessionStorage.getItem("redirectAfterLogin") || "/";
          sessionStorage.removeItem("redirectAfterLogin");
          router.push(redirectPath);
        }
      } catch (error: any) {
        console.error("Redirect result error:", error);
        toast({
          title: "Sign in failed",
          description: error.message || "Failed to complete sign in",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    checkRedirectResult();
  }, [router, toast]);

  const handleSignIn = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const provider = new GoogleAuthProvider();

    // Add additional scopes for better user info
    provider.addScope("email");
    provider.addScope("profile");

    try {
      // Try popup first, fallback to redirect if popup is blocked
      const result = await signInWithPopup(auth, provider);
      console.log("Sign-in successful:", result.user);

      toast({
        title: "Sign in successful",
        description: `Welcome, ${
          result.user.displayName || result.user.email
        }!`,
      });

      // Handle redirect after login
      const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/";
      sessionStorage.removeItem("redirectAfterLogin");
      router.push(redirectPath);
    } catch (error: any) {
      console.error("Popup sign-in failed:", error);

      // If popup is blocked or fails, try redirect
      if (
        error.code === "auth/popup-blocked" ||
        error.code === "auth/popup-closed-by-user"
      ) {
        try {
          await signInWithRedirect(auth, provider);
          // Don't set isLoading to false here as we're redirecting
        } catch (redirectError: any) {
          console.error("Redirect sign-in failed:", redirectError);
          toast({
            title: "Sign in failed",
            description: "Please check your internet connection and try again.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      } else {
        // Handle other errors
        let errorMessage = "An unexpected error occurred.";

        switch (error.code) {
          case "auth/network-request-failed":
            errorMessage =
              "Network error. Please check your internet connection.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many attempts. Please try again later.";
            break;
          case "auth/user-disabled":
            errorMessage = "This account has been disabled.";
            break;
          case "auth/operation-not-allowed":
            errorMessage =
              "Google sign-in is not enabled. Please contact support.";
            break;
          default:
            errorMessage = error.message || "Failed to sign in with Google.";
        }

        toast({
          title: "Sign in failed",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      size="lg"
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...
        </>
      ) : (
        <>
          <span className="mr-2">
            <GoogleIcon />
          </span>{" "}
          Sign in with Google
        </>
      )}
    </Button>
  );
}

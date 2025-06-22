"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getOrCreateUserProfile } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUserProfile: () => Promise<void>;
  userProfile: any | null;
  signOutUser: () => Promise<void>;
  profileLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  refreshUserProfile: async () => {},
  userProfile: null,
  signOutUser: async () => {},
  profileLoading: false,
});

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Function to create a timeout promise
  const createTimeoutPromise = (ms: number) => {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Operation timed out")), ms);
    });
  };

  // Function to create a fallback profile when database is unavailable
  const createFallbackProfile = (user: User) => {
    return {
      uid: user.uid,
      username: "User" + Math.floor(Math.random() * 1000),
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: new Date(),
      quizCount: 0,
      totalScore: 0,
      averageRating: 0,
    };
  };

  // Function to refresh the user profile data with faster fallback
  const refreshUserProfile = async () => {
    if (!user) return;

    setProfileLoading(true);
    setError(null);

    try {
      // Use a shorter timeout (12 seconds) to beat Firebase's internal 15-second timeout
      const profile = await Promise.race([
        getOrCreateUserProfile(user),
        createTimeoutPromise(12000), // 12 second timeout - shorter than Firebase's 15s
      ]);

      setUserProfile(profile);
      console.log("Profile loaded successfully:", profile);
    } catch (error) {
      console.error("Error refreshing user profile:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load user profile data";

      setError(errorMessage);

      // Provide fallback profile for better UX
      if (
        errorMessage.includes("timeout") ||
        errorMessage.includes("offline") ||
        errorMessage.includes("connection")
      ) {
        console.log("Creating fallback profile due to connection issues");
        const fallbackProfile = createFallbackProfile(user);
        setUserProfile(fallbackProfile);

        toast({
          title: "Using Offline Mode",
          description:
            "Profile data couldn't be synced. Some features may be limited.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile Error",
          description: "There was an issue loading your profile data.",
          variant: "destructive",
        });
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Function to sign out the user
  const signOutUser = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      setError(null);
      toast({
        title: "Signed out",
        description: "You have successfully signed out.",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Handle persistence for auth state
    let unsubscribed = false;
    let retryCount = 0;
    const MAX_RETRIES = 1; // Reduced retries since we have retry logic in firestore.ts
    let profileLoadTimeout: NodeJS.Timeout;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        console.log(
          "Auth state changed:",
          user ? `User signed in: ${user.email}` : "User signed out"
        );

        // Set user state immediately to update the UI.
        setUser(user);

        // Reset the error state when auth state changes
        setError(null);

        // Always set loading to false for auth state, regardless of profile loading
        setLoading(false);

        // Handle user profile creation/loading
        if (user && !unsubscribed) {
          setProfileLoading(true);

          const handleProfile = async () => {
            try {
              // Clear any existing timeout
              if (profileLoadTimeout) {
                clearTimeout(profileLoadTimeout);
              }

              // Set a faster timeout for profile loading (10 seconds)
              profileLoadTimeout = setTimeout(() => {
                if (!unsubscribed) {
                  console.warn(
                    "Profile loading timeout reached, using fallback"
                  );
                  const fallbackProfile = createFallbackProfile(user);
                  setUserProfile(fallbackProfile);
                  setProfileLoading(false);
                  setError("Profile loading timed out - using offline mode");

                  toast({
                    title: "Slow Connection",
                    description:
                      "Using offline mode. Profile will sync when connection improves.",
                    variant: "destructive",
                  });
                }
              }, 10000); // 10 second timeout - faster than Firebase's internal timeout

              const profile = await Promise.race([
                getOrCreateUserProfile(user),
                createTimeoutPromise(8000), // 8 second timeout for the actual operation
              ]);

              if (!unsubscribed) {
                clearTimeout(profileLoadTimeout);
                setUserProfile(profile);
                setProfileLoading(false);
                console.log("Profile loaded in auth context:", profile);
              }
            } catch (error) {
              console.error("Error creating/updating user profile:", error);

              if (!unsubscribed) {
                clearTimeout(profileLoadTimeout);

                if (retryCount < MAX_RETRIES) {
                  retryCount++;
                  console.log(
                    `Retrying profile creation (${retryCount}/${MAX_RETRIES})...`
                  );
                  setTimeout(handleProfile, 2000); // Retry after 2 seconds
                } else {
                  setProfileLoading(false);
                  const errorMessage =
                    error instanceof Error
                      ? error.message
                      : "Failed to load profile data";

                  setError(errorMessage);

                  // Always provide a fallback profile for better UX
                  const fallbackProfile = createFallbackProfile(user);
                  setUserProfile(fallbackProfile);

                  if (
                    errorMessage.includes("offline") ||
                    errorMessage.includes("timeout") ||
                    errorMessage.includes("connection")
                  ) {
                    toast({
                      title: "Connection Issues",
                      description:
                        "Using offline mode. Profile will sync when connection improves.",
                      variant: "destructive",
                    });
                  } else {
                    toast({
                      title: "Profile Error",
                      description:
                        "Using temporary profile. Please refresh to try again.",
                      variant: "destructive",
                    });
                  }
                }
              }
            }
          };

          // Start profile handling
          handleProfile();
        } else if (!user) {
          // If no user, clear profile data
          setUserProfile(null);
          setProfileLoading(false);
        }
      },
      (error) => {
        console.error("Auth state change error:", error);
        setError("Authentication service unavailable. Please try again later.");
        setLoading(false);
        setProfileLoading(false);
        toast({
          title: "Authentication Error",
          description: "Authentication service is temporarily unavailable.",
          variant: "destructive",
        });
      }
    );

    return () => {
      unsubscribed = true;
      if (profileLoadTimeout) {
        clearTimeout(profileLoadTimeout);
      }
      unsubscribe();
    };
  }, [toast]);

  const contextValue = {
    user,
    loading,
    error,
    refreshUserProfile,
    userProfile,
    signOutUser,
    profileLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

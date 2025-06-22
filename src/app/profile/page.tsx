"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Header } from "@/components/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Loader2,
  Star,
  BookOpen,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const {
    user,
    loading: authLoading,
    userProfile,
    refreshUserProfile,
    error: authError,
    profileLoading,
  } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [refreshing, setRefreshing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("User not authenticated, redirecting to signin");
      sessionStorage.setItem("redirectAfterLogin", pathname);
      router.push("/signin");
    }
  }, [user, authLoading, router, pathname]);

  // Handle manual refresh
  const handleRefresh = async () => {
    if (!user) return;

    setRefreshing(true);
    try {
      await refreshUserProfile();
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Check if we're in offline mode (profile exists but has error)
  const isOfflineMode = userProfile && authError?.includes("timeout");

  // Show loading state while authentication is in progress
  if (authLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated and not loading, the redirect will happen
  if (!user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Show loading while profile is being loaded initially
  if (profileLoading && !userProfile) {
    return (
      <>
        <Header />
        <main className="container py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Loading your profile...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Show error state only if there's no profile at all
  if (!userProfile && !profileLoading) {
    return (
      <>
        <Header />
        <main className="container py-8">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-red-500">
              {authError || "Could not load profile"}
            </p>
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="flex items-center gap-2"
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Retry
            </Button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container py-8">
        {/* Offline mode indicator */}
        {isOfflineMode && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <WifiOff className="h-5 w-5" />
              <p className="font-medium">Offline Mode</p>
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                className="ml-auto"
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Sync
              </Button>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Profile data couldn't be synced. Some information may be limited.
            </p>
          </div>
        )}

        <div className="flex flex-col items-center gap-6">
          <Avatar className="h-32 w-32 border-4 border-primary/50 shadow-lg">
            <AvatarImage
              src={userProfile?.photoURL || ""}
              alt={userProfile?.displayName || ""}
            />
            <AvatarFallback className="text-4xl">
              {userProfile?.displayName?.charAt(0) ||
                userProfile?.username?.charAt(0) ||
                "U"}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h1 className="text-4xl font-bold">
              {userProfile?.displayName || userProfile?.username || "User"}
            </h1>
            <p className="text-muted-foreground mb-1">{userProfile?.email}</p>
            <div className="flex items-center gap-2 justify-center">
              <span className="inline-block bg-secondary px-3 py-1 rounded-full text-sm font-medium">
                @{userProfile?.username}
              </span>
              {isOfflineMode && (
                <Badge
                  variant="outline"
                  className="text-yellow-600 border-yellow-300"
                >
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <div className="rounded-full bg-primary/10 p-3">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardDescription>Average Rating</CardDescription>
                <CardTitle className="text-3xl">
                  {userProfile?.averageRating?.toFixed(2) || "0.00"} / 10
                </CardTitle>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <div className="rounded-full bg-primary/10 p-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardDescription>Quizzes Completed</CardDescription>
                <CardTitle className="text-3xl">
                  {userProfile?.quizCount || 0}
                </CardTitle>
              </div>
            </CardHeader>
          </Card>
        </div>

        {isOfflineMode && (
          <div className="mt-8 text-center">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="flex items-center gap-2"
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wifi className="h-4 w-4" />
              )}
              Try to Sync Profile
            </Button>
          </div>
        )}
      </main>
    </>
  );
}

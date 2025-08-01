"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { getLeaderboard, type UserProfile } from "@/lib/firestore";
import { Header } from "@/components/header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Trophy, Medal, RefreshCw } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("User not authenticated, redirecting to signin");
      sessionStorage.setItem("redirectAfterLogin", pathname);
      router.push("/signin");
    }
  }, [user, authLoading, router, pathname]);

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboard = async () => {
      if (user && !pageLoading) {
        setPageLoading(true);
        setError(null);

        try {
          const data = await getLeaderboard();
          setLeaderboard(data);
        } catch (err) {
          console.error("Error loading leaderboard:", err);
          setError("Failed to load leaderboard data. Please try again.");
        } finally {
          setPageLoading(false);
        }
      }
    };

    loadLeaderboard();
  }, [user]);

  // Handle refresh
  const handleRefresh = async () => {
    if (!user) return;

    setPageLoading(true);
    setError(null);

    try {
      const data = await getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.error("Error refreshing leaderboard:", err);
      setError("Failed to refresh leaderboard data. Please try again.");
    } finally {
      setPageLoading(false);
    }
  };

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

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return <Medal className="h-6 w-6 text-yellow-500 fill-yellow-500" />;
    if (rank === 2)
      return <Medal className="h-6 w-6 text-gray-400 fill-gray-400" />;
    if (rank === 3)
      return <Medal className="h-6 w-6 text-amber-700 fill-amber-700" />;
    return <span className="font-bold">{rank}</span>;
  };

  const maskEmail = (email: string | null, isCurrentUser: boolean) => {
    if (!email) {
      return "";
    }

    if (isCurrentUser) {
      return email;
    }

    if (!email.includes("@")) {
      return email;
    }

    const [localPart, domain] = email.split("@");
    const maskedLocal =
      localPart.length > 2
        ? localPart.charAt(0) +
          "*".repeat(localPart.length - 2) +
          localPart.charAt(localPart.length - 1)
        : localPart.charAt(0) + "*";

    return `${maskedLocal}@${domain}`;
  };

  return (
    <>
      <Header />
      <main className="container py-8">
        {pageLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription className="text-red-500">
                {error}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" /> Try Again
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Trophy className="h-10 w-10 text-yellow-500" />
                <div>
                  <CardTitle className="text-3xl">Leaderboard</CardTitle>
                  <CardDescription>
                    Top performing medical minds
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] text-center">Rank</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead className="text-right">Average Rating</TableHead>
                    <TableHead className="text-right">Quizzes Taken</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((profile, index) => (
                    <TableRow
                      key={profile.uid}
                      className={
                        profile.uid === user?.uid ? "bg-secondary/50" : ""
                      }
                    >
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          {getRankBadge(index + 1)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={profile.photoURL || ""} />
                            <AvatarFallback>
                              {profile.displayName?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{profile.displayName}</p>
                            <p className="text-xs text-muted-foreground">
                              {maskEmail(
                                profile.email,
                                profile.uid === user?.uid
                              )}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          @{profile.username}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {profile.averageRating.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {profile.quizCount}
                      </TableCell>
                    </TableRow>
                  ))}
                  {leaderboard.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No quiz scores yet. Be the first to take a quiz!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="flex items-center gap-2"
                disabled={pageLoading}
              >
                {pageLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getLeaderboard, type UserProfile } from '@/lib/firestore';
import { Header } from '@/components/header';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Trophy } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function LeaderboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      if (!authLoading && !user) {
        router.push('/signin');
      }
    }, [user, authLoading, router]);
  
    useEffect(() => {
      if(user) {
        getLeaderboard().then((data) => {
            setLeaderboard(data);
            setLoading(false);
        });
      }
    }, [user]);
  
    if (authLoading || loading || !user) {
      return (
        <div className="flex min-h-screen w-full items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }
  
    const getRankColor = (rank: number) => {
        if (rank === 1) return 'text-yellow-500';
        if (rank === 2) return 'text-gray-400';
        if (rank === 3) return 'text-amber-700';
        return 'text-foreground';
    }

    return (
      <>
        <Header />
        <main className="container py-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Trophy className="h-10 w-10 text-yellow-500" />
                        <div>
                            <CardTitle className="text-3xl">Leaderboard</CardTitle>
                            <CardDescription>Top performing medical minds</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px] text-center">Rank</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead className="text-right">Average Rating</TableHead>
                            <TableHead className="text-right">Quizzes Taken</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leaderboard.map((profile, index) => (
                        <TableRow key={profile.uid} className={profile.uid === user?.uid ? 'bg-secondary' : ''}>
                            <TableCell className="text-center font-bold text-lg">
                                <span className={getRankColor(index + 1)}>{index + 1}</span>
                            </TableCell>
                            <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={profile.photoURL || ''} />
                                    <AvatarFallback>{profile.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{profile.displayName}</p>
                                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                                </div>
                            </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-primary">{profile.averageRating.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{profile.quizCount}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
      </>
    );
}

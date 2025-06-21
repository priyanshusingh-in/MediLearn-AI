'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getUserProfile, type UserProfile } from '@/lib/firestore';
import { Header } from '@/components/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Star, BookOpen } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        sessionStorage.setItem('redirectAfterLogin', pathname);
        router.push('/signin');
      }
    }
  }, [user, authLoading, router, pathname]);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then((userProfile) => {
        setProfile(userProfile);
        setPageLoading(false);
      });
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="container py-8">
        {pageLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : !profile ? (
           <div className="flex items-center justify-center py-12">
             <p>Could not load profile. Please try again later.</p>
           </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-6">
                <Avatar className="h-32 w-32 border-4 border-primary/50 shadow-lg">
                    <AvatarImage src={profile.photoURL || ''} alt={profile.displayName || ''} />
                    <AvatarFallback className="text-4xl">{profile.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                    <h1 className="text-4xl font-bold">{profile.displayName}</h1>
                    <p className="text-muted-foreground">{profile.email}</p>
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
                            <CardTitle className="text-3xl">{profile.averageRating.toFixed(2)} / 10</CardTitle>
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
                            <CardTitle className="text-3xl">{profile.quizCount}</CardTitle>
                        </div>
                    </CardHeader>
                </Card>
            </div>
          </>
        )}
      </main>
    </>
  );
}

"use client";

import Link from "next/link";
import {
  Stethoscope,
  LogOut,
  User as UserIcon,
  Loader2,
  Settings,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const {
    user,
    loading: authLoading,
    profileLoading,
    signOutUser,
    userProfile,
  } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutUser();
    router.push("/");
  };

  const handleSignIn = () => {
    // When signing in from the header, the default destination is the quiz page.
    sessionStorage.setItem("redirectAfterLogin", "/quiz");
    router.push("/signin");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 shadow-sm backdrop-blur">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-primary" />
            <h1 className="hidden text-2xl font-bold text-foreground sm:inline-block">
              MediLearn AI
            </h1>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Button variant="ghost" onClick={() => router.push("/quiz")}>
              Take a Quiz
            </Button>
            <Button variant="ghost" onClick={() => router.push("/leaderboard")}>
              Leaderboard
            </Button>
            {process.env.NODE_ENV === "development" && (
              <Button
                variant="ghost"
                onClick={() => router.push("/admin/setup")}
              >
                Admin Setup
              </Button>
            )}
            <ThemeToggle />
            {authLoading ? (
              <div className="w-8 h-8 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : user ? (
              profileLoading ? (
                <div className="w-8 h-8 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.photoURL || ""}
                          alt={user.displayName || "User"}
                        />
                        <AvatarFallback>
                          {user.displayName?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.displayName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        {userProfile?.username && (
                          <p className="text-xs leading-none text-muted-foreground">
                            @{userProfile.username}
                          </p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    {process.env.NODE_ENV === "development" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin/setup" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Database Setup</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            ) : (
              <Button onClick={handleSignIn}>Sign In</Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

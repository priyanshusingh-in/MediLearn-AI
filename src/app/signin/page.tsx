import { SigninForm } from '@/components/signin-form';
import Link from 'next/link';
import { Stethoscope } from 'lucide-react';

export default function SigninPage() {
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

'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { signUp } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:h-10"
      disabled={pending}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating account...
        </>
      ) : (
        'Sign up'
      )}
    </Button>
  );
}

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const refParam = searchParams.get('ref');
  const [formStartTime] = useState(() => Math.floor(Date.now() / 1000));

  async function handleSubmit(formData: FormData) {
    const result = await signUp(formData, refParam ?? undefined);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success('Check your email to confirm your account');
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>
      <Card className="w-full sm:w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-heading font-bold">Register</CardTitle>
          <CardDescription className="leading-relaxed">
            Create an account to start generating property listings
          </CardDescription>
          {refParam && (
            <p className="mt-2 text-sm text-muted-foreground">
              You were referred! You&apos;ll get bonus credits upon signup.
            </p>
          )}
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
          </CardContent>
          <input type="hidden" name="form-start-time" value={formStartTime} />
          <input type="text" name="bot-field" className="hidden" autoComplete="off" />
          <CardFooter className="flex flex-col space-y-4">
            <SubmitButton />
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

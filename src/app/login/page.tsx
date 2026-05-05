'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { signIn } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Submit button reads the parent <form>'s pending state via useFormStatus.
// Plain useState doesn't work here because React form actions run inside a
// transition — state updates are deferred until the action settles, so the
// button stays enabled and the user can re-click it during the request.
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
          Logging in...
        </>
      ) : (
        'Log in'
      )}
    </Button>
  );
}

export default function LoginPage() {
  const [formStartTime] = useState(() => Math.floor(Date.now() / 1000));

  async function handleSubmit(formData: FormData) {
    const result = await signIn(formData);
    if (result?.error) {
      toast.error(result.error);
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
          <CardTitle className="text-2xl font-heading font-bold">Login</CardTitle>
          <CardDescription className="leading-relaxed">
            Enter your email and password to access your dashboard
          </CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-4">
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
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary hover:text-primary/80 hover:underline">
                Register
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

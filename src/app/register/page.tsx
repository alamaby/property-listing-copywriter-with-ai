'use client';

import { useState, useEffect } from 'react';
import { signUp } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const refParam = searchParams.get('ref');
  const [formStartTime] = useState(() => Math.floor(Date.now() / 1000));

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await signUp(formData, refParam ?? undefined);
    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success('Check your email to confirm your account');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full px-4 sm:w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-heading font-bold">Register</CardTitle>
           <CardDescription className="leading-relaxed">
             Create an account to start generating property listings
           </CardDescription>
           {refParam && (
             <p className="text-sm text-muted-foreground mt-2">
               You were referred! You'll get bonus credits upon signup.
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
            <div className="text-center text-sm text-gray-500">
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

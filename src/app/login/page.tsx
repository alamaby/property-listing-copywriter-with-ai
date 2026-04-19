'use client';

import { useState } from 'react';
import { signIn } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await signIn(formData);
    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFFBF1]">
      <Card className="w-full px-4 sm:w-[400px]">
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
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-[#E36A6A] hover:bg-[#CC5555] text-white" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
            <div className="text-center text-sm text-[#6B5D54]">
              Don't have an account?{' '}
              <Link href="/register" className="text-[#E36A6A] hover:text-[#CC5555] hover:underline">
                Register
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

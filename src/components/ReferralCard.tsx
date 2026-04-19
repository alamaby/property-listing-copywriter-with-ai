'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CopyIcon } from 'lucide-react';

interface ReferralCardProps {
  userId: string;
}

export function ReferralCard({ userId }: ReferralCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const referralLink = `${baseUrl}/register?ref=${userId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setIsCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Refer & Earn</span>
        </CardTitle>
        <CardDescription>
          Invite a fellow agent. You both get 5 Premium Credits when they sign up!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input 
            value={referralLink} 
            readOnly 
            className="bg-muted"
            aria-label="Referral link"
          />
          <Button 
            type="button" 
            variant="secondary" 
            size="icon"
            onClick={handleCopy}
            aria-label="Copy referral link"
          >
            <CopyIcon className={`h-4 w-4 ${isCopied ? 'text-green-500' : 'text-current'}`} />
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Share your link and earn credits when others sign up
      </CardFooter>
    </Card>
  );
}
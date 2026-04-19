'use client';

import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';
import { claimDailyCredit } from '@/app/actions/credit';

interface DailyClaimButtonProps {
  hasClaimed: boolean;
}

export function DailyClaimButton({ hasClaimed }: DailyClaimButtonProps) {
  // useToast is not available, using sonner's toast directly

  const handleClaim = async () => {
    try {
      const result = await claimDailyCredit();
      
      if (result.error) {
        toast(result.error, {
          description: "Claim Failed",
          className: "bg-red-500 text-white",
        });
      } else {
        toast("Success!", {
          description: "You've claimed your daily credit!",
        });
      }
    } catch (error) {
      toast("Error", {
        description: "An unexpected error occurred. Please try again.",
        className: "bg-red-500 text-white",
      });
    }
  };

  return (
    <Button
      onClick={handleClaim}
      disabled={hasClaimed}
      variant={hasClaimed ? "secondary" : "default"}
      className="w-full"
    >
      {hasClaimed ? "Come back tomorrow!" : "Claim 1 Free Credit"}
    </Button>
  );
}
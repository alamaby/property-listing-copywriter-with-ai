'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { validateHoneypot, validateFormDuration } from '@/lib/anti-bot';

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const honeypot = formData.get('bot-field') as string | null;
  const startTime = Number(formData.get('form-start-time') as string) || 0;
  
  // Validate honeypot field
  const honeypotResult = await validateHoneypot(honeypot);
  if (!honeypotResult.success) {
    return { error: honeypotResult.error };
  }
  
  // Validate form submission duration
  const timeResult = await validateFormDuration(startTime);
  if (!timeResult.success) {
    return { error: timeResult.error };
  }
  
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signUp(formData: FormData, referredBy?: string) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const honeypot = formData.get('bot-field') as string | null;
  const startTime = Number(formData.get('form-start-time') as string) || 0;
  
  // Validate honeypot field
  const honeypotResult = await validateHoneypot(honeypot);
  if (!honeypotResult.success) {
    return { error: honeypotResult.error };
  }
  
  // Validate form submission duration
  const timeResult = await validateFormDuration(startTime);
  if (!timeResult.success) {
    return { error: timeResult.error };
  }
  
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        ...(referredBy && { referred_by: referredBy }),
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

/**
 * Triggers a password reset email to be sent to the user's email address
 * @param email The email address to send the reset email to
 * @returns Object with success status and potential error message
 */
export async function resetPassword(email: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

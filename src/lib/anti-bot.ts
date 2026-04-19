'use server';

/**
 * Validates that form submission took a minimum amount of time to prevent bots
 * @param startTime - The timestamp when the form was loaded (in seconds)
 * @param minDuration - Minimum duration in seconds form should be present
 * @returns Object with success status and potential error message
 */
export async function validateFormDuration(startTime: number, minDuration: number = 2) {
  const now = Math.floor(Date.now() / 1000);
  const timeElapsed = now - startTime;
  
  if (timeElapsed < minDuration) {
    return { 
      error: 'Form submitted too quickly. Please wait a moment before submitting.' 
    };
  }
  
  return { success: true };
}

/**
 * Validates honeypot field - should be empty for legitimate users
 * @param honeypotValue - The value of the honeypot field
 * @returns Object with success status and potential error message
 */
export async function validateHoneypot(honeypotValue: string | null) {
  if (honeypotValue && honeypotValue.trim() !== '') {
    return { 
      error: 'Bot detected. Submission rejected.' 
    };
  }
  
  return { success: true };
}
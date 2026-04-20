import { createOpenAI } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { createClient } from '@/utils/supabase/server';
import { createServiceRoleClient } from '@/utils/supabase/service-role';
import { getProfileData } from '@/app/dashboard/settings/actions';

export const runtime = 'edge';

export async function POST(req: Request) {
  let userId: string | null = null;
  let propertyContext: any = null;
  let prompt: string = '';
  
  try {
    const body = await req.json();
    prompt = body.prompt;
    propertyContext = body.propertyContext;
    
    // Validate and sanitize inputs
    if (!prompt || typeof prompt !== 'string') {
      return new Response('Invalid prompt provided', { status: 400 });
    }
    
    if (!propertyContext || typeof propertyContext !== 'object') {
      return new Response('Invalid property context provided', { status: 400 });
    }
    
    // Validate additionalPoints character limit
    if (propertyContext.additionalPoints && propertyContext.additionalPoints.length > 200) {
      return new Response('Additional selling points must be 200 characters or less', { status: 400 });
    }
    
    // Sanitize property context values
    const sanitizedPropertyContext = {
      propertyType: String(propertyContext.propertyType || '').replace(/[<>"'&]/g, ''),
      transactionType: String(propertyContext.transactionType || '').replace(/[<>"'&]/g, ''),
      landArea: String(propertyContext.landArea || '').replace(/[<>"'&]/g, ''),
      buildingArea: String(propertyContext.buildingArea || '').replace(/[<>"'&]/g, ''),
      bedrooms: String(propertyContext.bedrooms || '').replace(/[<>"'&]/g, ''),
      bathrooms: String(propertyContext.bathrooms || '').replace(/[<>"'&]/g, ''),
      location: String(propertyContext.location || '').replace(/[<>"'&]/g, ''),
      additionalPoints: String(propertyContext.additionalPoints || '').replace(/[<>"'&]/g, '').substring(0, 200),
    };
    
    const supabase = await createClient();
    const serviceRoleSupabase = createServiceRoleClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    userId = user.id;

    // Get user's default signature, writing style, and language
    const profileData = await getProfileData();
    const defaultSignature = profileData?.defaultSignature || '';
    const defaultWritingStyle = profileData?.defaultWritingStyle || 'formal';
    const language = profileData?.language || 'en';

    // 1. Check Credits
    const { data: transactions, error: balanceError } = await supabase
      .from('credit_transactions')
      .select('amount')
      .eq('user_id', user.id);

    if (balanceError) throw balanceError;

    const balance = (transactions || []).reduce((sum, t) => sum + t.amount, 0);
    if (balance <= 0) {
      return new Response('Insufficient credits', { status: 402 });
    }

    // 2. Generate text
    let result;
    const activeProvider = process.env.ACTIVE_AI_PROVIDER || 'openrouter';
    const openRouterModelName = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku';
    const geminiModelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    
    // Initialize the appropriate model based on active provider
    const model = activeProvider === 'gemini' 
      ? google(geminiModelName)
      : createOpenAI({
          baseURL: 'https://openrouter.ai/api/v1',
          apiKey: process.env.OPENROUTER_API_KEY,
        })(openRouterModelName);

    // Store the actual model used for logging
    const actualModelUsed = activeProvider === 'gemini' ? geminiModelName : openRouterModelName;
    
    // Create system message with user preferences
    let systemMessage = `You are an expert real estate copywriter. Your goal is to create high-converting property listings based on the provided details. 
        Use persuasive language, highlight key selling points, and structure the output with a compelling headline followed by a well-organized body text.
        Target potential buyers or renters by emphasizing the lifestyle and benefits of the property.
        
        Use the user's preferred writing style: ${defaultWritingStyle}.
        Write the response in the user's preferred language: ${language}.`;
    
    if (defaultSignature) {
      systemMessage += `\nInclude the following signature at the end of the description: "${defaultSignature}"`;
    }
    
    systemMessage += `
        
        You MUST respond ONLY with a valid JSON object. Do not include any markdown formatting, code blocks, or preamble.
        
        Structure:
        {
          "headline": "Compelling Headline",
          "description": "Engaging body text",
          "features": ["Feature 1", "Feature 2", ...]
        }`;

    try {
      result = await generateText({
        model,
        system: systemMessage,
        prompt: prompt,
      });
    } catch (llmError: any) {
      // Log LLM error
      await serviceRoleSupabase.from('llm_logs').insert({
        user_id: userId,
        property_context: sanitizedPropertyContext,
        model_used: actualModelUsed,
        request_payload: { prompt },
        response_payload: { error: llmError.message },
        prompt_tokens: 0,
        completion_tokens: 0,
        status: 'error',
      });
      throw llmError;
    }

    // 3. Deduct Credit (using service role to bypass RLS)
    const { error: creditError } = await serviceRoleSupabase.from('credit_transactions').insert({
      user_id: user.id,
      amount: -1,
      transaction_type: 'USAGE',
      reference_id: 'generate-copy',
    });
    if (creditError) {
      console.error('Credit deduction error:', creditError);
      return new Response('Failed to deduct credit', { status: 500 });
    }

    // 4. Log to LLM Logs (using service role to bypass RLS)
    const { error: logError } = await serviceRoleSupabase.from('llm_logs').insert({
      user_id: user.id,
      property_context: sanitizedPropertyContext,
      model_used: actualModelUsed,
      request_payload: { prompt },
      response_payload: { text: result.text },
      prompt_tokens: (result.usage as any)?.promptTokens || 0,
      completion_tokens: (result.usage as any)?.completionTokens || 0,
      status: 'success',
    });
    if (logError) {
      console.error('Logging error:', logError);
    }

    // Clean up markdown formatting if present
    let cleanedText = result.text.trim();
    // Remove markdown code blocks
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\n?/, '');
    }
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\n?/, '');
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.replace(/\n?```$/, '');
    }
    cleanedText = cleanedText.trim();

    // Parse the cleaned JSON
    const parsedData = JSON.parse(cleanedText);

    return new Response(JSON.stringify(parsedData), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in generate-copy:', error);
    return new Response(error.message || 'Internal Server Error', { status: 500 });
  }
}
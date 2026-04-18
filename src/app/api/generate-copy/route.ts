import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { createClient } from '@/utils/supabase/server';
import { createServiceRoleClient } from '@/utils/supabase/service-role';

export const runtime = 'edge';

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  let userId: string | null = null;
  let propertyContext: any = null;
  let prompt: string = '';
  
  try {
    const body = await req.json();
    prompt = body.prompt;
    propertyContext = body.propertyContext;
    
    const supabase = await createClient();
    const serviceRoleSupabase = createServiceRoleClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    userId = user.id;

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
    try {
      result = await generateText({
        model: openrouter(process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku'),
        system: `You are an expert real estate copywriter. Your goal is to create high-converting property listings based on the provided details. 
        Use persuasive language, highlight key selling points, and structure the output with a compelling headline followed by a well-organized body text.
        Target potential buyers or renters by emphasizing the lifestyle and benefits of the property.
        
        You MUST respond ONLY with a valid JSON object. Do not include any markdown formatting, code blocks, or preamble.
        
        Structure:
        {
          "headline": "Compelling Headline",
          "description": "Engaging body text",
          "features": ["Feature 1", "Feature 2", ...]
        }`,
        prompt: prompt,
      });
    } catch (llmError: any) {
      // Log LLM error
      await serviceRoleSupabase.from('llm_logs').insert({
        user_id: userId,
        property_context: propertyContext,
        model_used: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku',
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
      property_context: propertyContext,
      model_used: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku',
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

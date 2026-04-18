import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'edge';

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt, propertyContext } = await req.json();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

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

    const result = await streamText({
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
      onFinish: async (event) => {
        try {
          // 2. Deduct Credit
          const { error: creditError } = await supabase.from('credit_transactions').insert({
            user_id: user.id,
            amount: -1,
            transaction_type: 'USAGE',
            reference_id: 'generate-copy',
          });
          if (creditError) console.error('Credit deduction error:', creditError);

          // 3. Log to LLM Logs
          const { error: logError } = await supabase.from('llm_logs').insert({
            user_id: user.id,
            property_context: propertyContext,
            model_used: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku',
            request_payload: { prompt },
            response_payload: { text: event.text },
            prompt_tokens: (event.usage as any)?.promptTokens || 0,
            completion_tokens: (event.usage as any)?.completionTokens || 0,
            status: 'success',
          });
          if (logError) console.error('Logging error:', logError);
        } catch (e) {
          console.error('onFinish processing error:', e);
        }
      },
    });

const text = await result.text;
return new Response(JSON.stringify(JSON.parse(text)), {
  headers: { 'Content-Type': 'application/json' },
});
  } catch (error: any) {
    console.error('Error in generate-copy:', error);
    return new Response(error.message || 'Internal Server Error', { status: 500 });
  }
}

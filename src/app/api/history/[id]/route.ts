import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/client';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { id } = await params;

    // Fetch the specific listing from llm_logs table
    const { data, error } = await supabase
      .from('llm_logs')
      .select('response_payload')
      .eq('id', id)
      .single();

    if (error) {
      return Response.json({ error: 'Failed to fetch listing' }, { status: 500 });
    }

    if (!data) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    // The response_payload.text contains a JSON string that needs to be parsed twice
    // First parse gets us the string with escaped quotes, second parse gets the actual object
    try {
      const firstParse = JSON.parse(data.response_payload.text);
      const secondParse = JSON.parse(firstParse);
      return Response.json(secondParse);
    } catch (parseError) {
      console.error('Error parsing response payload:', parseError);
      return Response.json({ error: 'Invalid data format' }, { status: 500 });
    }
  } catch (err) {
    console.error('Error fetching listing:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
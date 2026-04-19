import { createClient } from '@/utils/supabase/server';

const supabase = await createClient();

export async function getUserStats(userId: string) {
  // Get total generations count
  const { count: totalGenerations, error: countError } = await supabase
    .from('llm_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (countError) {
    console.error('Error fetching generation count:', countError);
    return { totalGenerations: 0, totalCreditsUsed: 0, recentActivity: 0 };
  }

  // Get total credits used this month
  const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const { data: monthlyLogs, error: monthlyError } = await supabase
    .from('llm_logs')
    .select('credits_used')
    .eq('user_id', userId)
    .gte('created_at', `${currentMonth}-01T00:00:00`)
    .lt('created_at', `${currentMonth}-32T00:00:00`);

  if (monthlyError) {
    console.error('Error fetching monthly credits:', monthlyError);
    return { totalGenerations: totalGenerations || 0, totalCreditsUsed: 0, recentActivity: 0 };
  }

  const totalCreditsUsed = monthlyLogs?.reduce((sum, log) => sum + log.credits_used, 0) || 0;

  // Calculate recent activity (active days in the last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneWeekAgoISOString = oneWeekAgo.toISOString();

  const { data: recentLogs, error: recentError } = await supabase
    .from('llm_logs')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', oneWeekAgoISOString);

  if (recentError) {
    console.error('Error fetching recent activity:', recentError);
    return { totalGenerations: totalGenerations || 0, totalCreditsUsed, recentActivity: 0 };
  }

  // Extract unique dates from recent logs
  const recentDates = new Set(
    recentLogs.map(log => new Date(log.created_at).toDateString())
  );
  const recentActivity = recentDates.size;

  return {
    totalGenerations: totalGenerations || 0,
    totalCreditsUsed,
    recentActivity
  };
}

export async function getRecentGenerations(userId: string, limit = 5) {
  const { data, error } = await supabase
    .from('llm_logs')
    .select('id, created_at, property_context, status')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent generations:', error);
    return [];
  }

  return data;
}
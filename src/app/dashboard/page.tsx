import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getUserStats, getRecentGenerations } from '@/services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { creditService } from '@/services/creditService';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const creditBalance = await creditService.getUserCreditBalance(user.id);
  const stats = await getUserStats(user.id);
  const recentGenerations = await getRecentGenerations(user.id);

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">Here's your account overview and recent activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{creditBalance}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGenerations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity}</div>
            <p className="text-xs text-muted-foreground">Active this week</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Generations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-left py-2 font-medium">Property</th>
                  <th className="text-left py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentGenerations.length > 0 ? (
                  recentGenerations.map((generation) => {
                  let context;
                  try {
                    context = JSON.parse(generation.property_context);
                  } catch (e) {
                    console.error('Failed to parse property_context:', generation.property_context);
                    context = { propertyType: 'Unknown', location: 'Unknown' };
                  }
                    return (
                      <tr key={generation.id} className="border-b">
                        <td className="py-2">{new Date(generation.created_at).toLocaleDateString()}</td>
                        <td className="py-2">{context.propertyType} in {context.location}</td>
                        <td className="py-2">
                          <Badge variant={generation.status === 'success' ? 'default' : 'secondary'}>
                            {generation.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-4 text-muted-foreground">
                      No recent generations
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { createClient } from '@/utils/supabase/server';
import { creditService } from '@/services/creditService';
import { redirect } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, LogOut, LayoutDashboard, History, Settings, Sparkles } from 'lucide-react';
import { signOut } from '@/app/actions/auth';
import Link from 'next/link';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const credits = await creditService.getUserCreditBalance(user.id);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/generator', label: 'Generator', icon: Sparkles },
    { href: '/dashboard/history', label: 'History', icon: History },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-4">
      <div className="flex-1 space-y-2 py-4">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900"
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        ))}
      </div>
      <div className="mt-auto border-t py-4">
        <form action={signOut}>
          <Button variant="ghost" className="w-full justify-start gap-3 px-3 text-red-500 hover:bg-red-50 hover:text-red-600">
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-white md:block">
        <div className="flex h-16 items-center border-b px-6 font-semibold">
          AI Property Copy
        </div>
        <div className="p-4 h-[calc(100vh-64px)]">
          <SidebarContent />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile Nav Toggle */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-4">
                  <div className="mb-8 font-semibold text-lg">AI Property Copy</div>
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>
            <div className="hidden md:block font-medium">Welcome back</div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 border-blue-100">
              Credits: {credits}
            </Badge>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

import { createClient } from '@/utils/supabase/server';
import { creditService } from '@/services/creditService';
import { redirect } from 'next/navigation';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, LayoutDashboard, History, Settings, Sparkles } from 'lucide-react';
import { SignOutButton } from '@/components/SignOutButton';
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

  // `inSheet`: when true, links are wrapped in SheetClose so navigating closes the sheet.
  // SheetClose only works inside a Sheet context, so the desktop sidebar passes inSheet={false}.
  const SidebarContent = ({ inSheet = false }: { inSheet?: boolean }) => {
    const linkClass = "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900";
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="flex-1 space-y-2 py-4">
          {navLinks.map((link) => {
            const linkEl = (
              <Link href={link.href} className={linkClass}>
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
            return inSheet ? (
              <SheetClose key={link.href} asChild>
                {linkEl}
              </SheetClose>
            ) : (
              <div key={link.href}>{linkEl}</div>
            );
          })}
        </div>
        <div className="mt-auto border-t py-4">
          <SignOutButton />
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar — visible from lg+ so tablet portrait gets full width */}
      <aside className="hidden w-64 border-r bg-card lg:block">
        <div className="flex h-16 items-center border-b px-6 font-heading font-semibold text-lg">
          AI Property Copy
        </div>
        <div className="p-4 h-[calc(100dvh-64px)]">
          <SidebarContent />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile + Tablet Nav Toggle */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Open menu">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-4 sm:w-64">
                  <div className="mb-8 font-heading font-semibold text-lg">AI Property Copy</div>
                  <SidebarContent inSheet />
                </SheetContent>
              </Sheet>
            </div>
            <div className="hidden font-medium lg:block">Welcome back</div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/dashboard/history">
              <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium cursor-pointer hover:bg-secondary/80 whitespace-nowrap">
                Credits: {credits}
              </Badge>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
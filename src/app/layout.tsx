import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { getProfileData } from "./dashboard/settings/actions";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontHeading = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Property Copywriter",
  description: "Generate high-converting property listings with AI",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profileData = await getProfileData();
  const language = profileData?.language || "en";

  // Inline theme-init script: runs before paint, sets data-color-theme on <html>
  // from localStorage (or 'slate-indigo' default). Kept as raw <script> with
  // dangerouslySetInnerHTML because Next.js 16 + React 19 reject inline children
  // on next/script's <Script> component.
  const themeInitScript = `(function(){try{var t=localStorage.getItem('color-theme')||'slate-indigo';document.documentElement.setAttribute('data-color-theme',t);}catch(e){document.documentElement.setAttribute('data-color-theme','slate-indigo');}})();`;

  return (
    <html lang={language} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
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

  return (
    <html lang={language} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <Script
          id="theme-init"
          strategy="beforeInteractive"
        >{`(function(){try{var t=localStorage.getItem('color-theme');if(t)document.documentElement.setAttribute('data-color-theme',t);}catch(e){}})();`}</Script>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Poppins, Geist } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { CursorAura } from "@/components/CursorAura";
import { GlobalShaderLayer } from "@/components/GlobalShaderLayer";
import { PageTransitionShell } from "@/components/PageTransitionShell";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-hero",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maser Media - Creative Agency",
  description: "Design & creative studio for startups and brands that need to ship fast, look credible, and stand out.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={cn("font-sans", geist.variable)}>
      <body className={poppins.variable}>
        <div className="mm-preload-fallback" aria-hidden="true" />
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <GlobalShaderLayer />
        <CursorAura />
        <PageTransitionShell>{children}</PageTransitionShell>
        <SpeedInsights />
      </body>
    </html>
  );
}

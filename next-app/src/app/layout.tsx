import type { Metadata } from "next";
import { Poppins, Geist } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { CursorAura } from "@/components/CursorAura";
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
    <html lang="en" data-scroll-behavior="smooth" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body className={poppins.variable}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
try {
  const isHome = location.pathname === '/' || location.pathname === '';
  const played = sessionStorage.getItem('mm-home-intro-played') === 'true';
  if (isHome && !played) document.documentElement.classList.add('mm-intro-pending');
} catch {
  if (location.pathname === '/' || location.pathname === '') document.documentElement.classList.add('mm-intro-pending');
}
})();`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html:
              'html.mm-intro-pending .mm-preload-fallback{opacity:1!important;visibility:visible!important}body.mm-intro-mounted .mm-preload-fallback,body.mm-intro-complete .mm-preload-fallback{opacity:0!important;visibility:hidden!important}',
          }}
        />
        <div className="mm-preload-fallback" aria-hidden="true" />
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <CursorAura />
        <PageTransitionShell>{children}</PageTransitionShell>
        <SpeedInsights />
      </body>
    </html>
  );
}

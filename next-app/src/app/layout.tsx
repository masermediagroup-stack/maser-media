import type { Metadata } from "next";
import "./globals.css";
import { CursorAura } from "@/components/CursorAura";

export const metadata: Metadata = {
  title: "Maser Media — Creative Agency",
  description: "Design & creative studio for startups and brands that need to ship fast, look credible, and stand out.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params?: Promise<Record<string, string | string[]>>;
}>) {
  if (params) await params;
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <CursorAura />
        {children}
      </body>
    </html>
  );
}

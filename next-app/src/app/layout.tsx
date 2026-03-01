import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maser Media — Creative Agency",
  description: "Design & creative studio for startups and brands that need to ship fast, look credible, and stand out.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

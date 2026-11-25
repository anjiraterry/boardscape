import type { Metadata } from "next";
import "@fontsource/rubik/700.css";
import "@fontsource/rubik/800.css";
import "@fontsource/rubik/900.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Boardscape — Ideas. Media. Intelligence.",
    template: "%s | Boardscape",
  },
  description:
    "Independent advertising, media planning, and outdoor execution in Abuja, Nigeria — powered by Boardscape Atlas.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

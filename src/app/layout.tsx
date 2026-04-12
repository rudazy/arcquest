import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Arc Terminal",
    template: "%s — Arc Terminal",
  },
  description:
    "Quest and XP platform for the Arc ecosystem. Complete onchain and social tasks, level up, and claim milestone NFTs.",
  applicationName: "Arc Terminal",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

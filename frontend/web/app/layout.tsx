import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConditionalClerkWrapper } from "../components/ConditionalClerkWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spoodle - Veterinary Practice Management",
  description: "Modern veterinary practice management platform for clinics and pet owners",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConditionalClerkWrapper publishableKey={publishableKey}>
          {children}
        </ConditionalClerkWrapper>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ConditionalClerkWrapper } from "../components/ConditionalClerkWrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
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
        className={`${inter.variable} font-sans antialiased`}
      >
        <ConditionalClerkWrapper publishableKey={publishableKey}>
          {children}
        </ConditionalClerkWrapper>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { VerumProviderWrapper } from "@/components/VerumProviderWrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Verum - Veterinary Research Assistant",
  description: "AI-powered veterinary research assistant with RAG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <VerumProviderWrapper>{children}</VerumProviderWrapper>
      </body>
    </html>
  );
}

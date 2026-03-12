import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { SessionProvider } from '../components/SessionContext';
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
  description: "Modern veterinary practice management platform for clinics and clients",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {publishableKey && !publishableKey.includes('your_key_here') ? (
          <ClerkProvider
            publishableKey={publishableKey}
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            signInForceRedirectUrl="/home"
            signUpForceRedirectUrl="/home"
          >
            <SessionProvider>
              {children}
            </SessionProvider>
          </ClerkProvider>
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Spoodle - Veterinary Practice Management
              </h1>
              <p className="text-gray-600 mb-4">
                Please configure your Clerk API keys to continue.
              </p>
              <p className="text-sm text-gray-500">
                Add your NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to .env.local
              </p>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}

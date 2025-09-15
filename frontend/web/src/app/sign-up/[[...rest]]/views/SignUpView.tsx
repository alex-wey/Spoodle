'use client';

import { SignUp as ClerkSignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Create your Spoodle account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the modern veterinary practice management platform
          </p>
        </div>
        
        <div className="mt-8">
          <ClerkSignUp
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'shadow-lg border border-gray-200 rounded-lg',
                headerTitle: 'text-xl font-semibold text-gray-900',
                headerSubtitle: 'text-sm text-gray-600',
                socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
                formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                formFieldInput: 'border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500',
                footerActionLink: 'text-blue-600 hover:text-blue-500',
              },
              variables: {
                colorPrimary: '#2563eb',
                colorText: '#111827',
                colorTextSecondary: '#6b7280',
                colorBackground: '#ffffff',
                colorInputBackground: '#ffffff',
                colorInputText: '#111827',
                borderRadius: '0.375rem',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

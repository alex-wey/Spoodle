import Image from 'next/image';
import { SignIn as ClerkSignIn } from '@clerk/nextjs';
import { AnimatedBackground } from '@/components/primitives/AnimatedBackground';

export default function SignInPage() {
  return (
    <AnimatedBackground className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
<Image
          src="/logo.png"
          alt="Spoodle"
          width={360}
          height={120}
          className="mx-auto"
          priority
        />
        
        <div className="mt-8">
          <ClerkSignIn
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'shadow-lg border border-gray-200 rounded-lg bg-white/90 backdrop-blur-sm',
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
                colorBackground: 'rgba(255, 255, 255, 0.9)',
                colorInputBackground: '#ffffff',
                colorInputText: '#111827',
                borderRadius: '0.375rem',
              },
            }}
          />
        </div>
      </div>
    </AnimatedBackground>
  );
}

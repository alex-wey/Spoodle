import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import { AnimatedBackground } from "@/components/ui/animated-background";

export default function Page() {
  return (
    <AnimatedBackground>
      <div className="flex w-full flex-col items-center gap-6">
        <div className="flex w-full shrink-0 justify-center">
          <Image
            src="/logo.png"
            alt="Verum"
            width={400}
            height={137}
            className="h-auto w-[400px] max-w-full object-contain"
            priority
          />
        </div>
        <SignIn signUpUrl="/sign-up" fallbackRedirectUrl="/home" />
      </div>
    </AnimatedBackground>
  );
}

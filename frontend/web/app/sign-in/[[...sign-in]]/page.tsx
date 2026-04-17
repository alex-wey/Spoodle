import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import { AnimatedBackground } from "@/components/ui/animated-background";

export default function Page() {
  return (
    <AnimatedBackground>
      <div className="flex w-full flex-col items-center gap-6">
        <div className="relative h-40 w-[min(100%,560px)] sm:h-48 sm:w-[min(100%,640px)]">
          <Image
            src="/logo.png"
            alt="Verum"
            fill
            sizes="(max-width: 640px) 560px, 640px"
            className="object-contain object-center drop-shadow-md"
            priority
          />
        </div>
        <SignIn signUpUrl="/sign-up" fallbackRedirectUrl="/home" />
      </div>
    </AnimatedBackground>
  );
}

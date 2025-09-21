'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MobileShell from "@/components/MobileShell";
import SquatChallengeApp from "@/components/SquatChallenge";

export default function ChallengePage() {
  const [hideLogo, setHideLogo] = useState(false);
  const router = useRouter();

  const handleBackFromChallenge = () => {
    router.push("/home"); // kembali ke landingpage
  };

  return (
    <MobileShell>

    {!hideLogo && (
      <div className="flex items-end justify-center py-2 relative flex-shrink-0">
        <Image
          src="/images/logo-netflix.png"
          alt="UNLOCK YOUR 100"
          width={250}
          height={100}
          priority
        />
      </div>
    )}

    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      <div className="min-h-full">
        <SquatChallengeApp 
          onBack={handleBackFromChallenge} 
          onHideLogo={setHideLogo} 
        />
      </div>
    </div>
    </MobileShell>
  );
}

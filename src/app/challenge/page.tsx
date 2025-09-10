'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";
import SquatChallengeApp from "@/components/SquatChallenge";

export default function ChallengePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, stats, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const CONTENT_H = 590;

  const authMenu = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Profile", href: "/profile" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Logout", onClick: () => alert("Logout…") },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleBackFromChallenge = () => {
    router.push("/dashboard"); // kembali ke dashboard
  };

  return (
    <MobileShell
      header={<Header onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />}
    >

    <div className="flex items-end justify-center py-2 relative flex-shrink-0">
      <Image
        src="/images/logo2.png"
        alt="UNLOCK YOUR 100"
        width={205}
        height={73}
        priority
      />
    </div>  

    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      <div className="min-h-full">
        <SquatChallengeApp onBack={handleBackFromChallenge} />
      </div>
    </div>
    
    <OverlayMenu
      open={menuOpen}
      onClose={() => setMenuOpen(false)}
      items={authMenu}
      contentHeight={CONTENT_H}
    />
    </MobileShell>
  );
}

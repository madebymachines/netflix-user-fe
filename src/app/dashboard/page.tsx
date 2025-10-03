"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { isAxiosError } from "axios";

type PurchaseStatus = "NOT_VERIFIED" | "PENDING" | "REJECTED" | "APPROVED";
type PurchaseStatusResponse = {
  status: PurchaseStatus;
  reason?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
};

function getLevelAssets(points: number) {
  if (points >= 6000) {
    return {
      frame: "/images/f_legendary.png",
      tag: "/images/t_legendary.png",
      label: "Legendary",
    };
  }
  if (points >= 3000) {
    return {
      frame: "/images/f_warrior.png",
      tag: "/images/t_warrior.png",
      label: "Warrior",
    };
  }
  if (points >= 1000) {
    return {
      frame: "/images/f_challenger.png",
      tag: "/images/t_challenger.png",
      label: "Challenger",
    };
  }
  return {
    frame: "/images/f_rookie.png",
    tag: "/images/t_rookie.png",
    label: "Rookie",
  };
}

export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, stats, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    let active = true;
    (async () => {
      try {
        const { data } = await api.get<PurchaseStatusResponse>(
          "/user/purchase-verification/status",
          { _skipAuthRefresh: true }
        );
        if (!active) return;
        if (data.status === "REJECTED") {
          const msg = encodeURIComponent(data.reason ?? "");
          router.replace(
            `/verify-purchase?method=RECEIPT&rejected=1&msg=${msg}`
          );
        } else if (data.status === "NOT_VERIFIED") {
          router.replace("/verify-purchase?method=RECEIPT");
        }
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          // biar auth interceptor yang handle
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [isLoading, router]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (user?.profilePictureUrl?.startsWith("s3://")) {
      (async () => {
        try {
          const { data } = await api.get("/user/me");
          useAuthStore.getState().setUser(data.profile);
        } catch {}
      })();
    }
  }, [user?.profilePictureUrl]);

  const fallbackPhoto = "/images/placeholder_male.png";

  function normalizeImgSrc(url?: string | null) {
    if (!url) return fallbackPhoto;
    if (url.startsWith("s3://") || url.startsWith("ipfs://"))
      return fallbackPhoto;
    return url;
  }

  // === Perubahan: tampilkan username (bukan name) ===
  const userDisplayData = {
    username: user?.username ?? "username",
    points: stats?.totalPoints ?? 0,
  };
  const photoSrc = normalizeImgSrc(user?.profilePictureUrl);

  const levelAssets = getLevelAssets(userDisplayData.points);

  const statsCards = [
    { value: stats?.totalChallenges ?? 0, l1: "COMPLETED", l2: "CHALLENGE" },
    { value: stats?.totalReps ?? 0, l1: "SQUAT", l2: "REPETITION" },
    { value: stats?.totalCalori ?? 0, l1: "BURNED", l2: "KCAL" },
  ];

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

  return (
    <MobileShell
      header={<Header onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/ball.png"
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "top" }}
          className="opacity-25"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div
        className="relative z-10 w-full overflow-visible text-white grid justify-items-center pb-10"
        style={{
          gridTemplateRows: "73px 116px 64px auto",
          rowGap: "8px",
        }}
      >
        {/* Banner */}
        <div className="w-[320px] h-[73px] flex items-end justify-center">
          <Image
            src="/images/logo2.png"
            alt="UNLOCK YOUR 100"
            width={205}
            height={73}
            priority
          />
        </div>

        {/* Profil + points */}
        <section className="w-[320px] h-[116px] flex items-center mt-30">
          <div className="relative w-[116px] h-[116px] shrink-0">
            <div className="absolute inset-[18%] overflow-hidden [clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]">
              <Image
                key={photoSrc}
                src={photoSrc}
                alt="User"
                fill
                sizes="116px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>

            <Image
              src={levelAssets.frame}
              alt={`${levelAssets.label} frame`}
              fill
              sizes="116px"
              style={{ objectFit: "contain" }}
              priority
              className="pointer-events-none select-none"
            />
          </div>

          <div>
            <Image
              src={levelAssets.tag}
              alt={`${levelAssets.label} tag`}
              width={40}
              height={40}
              priority
              className="object-contain opacity-90"
            />
          </div>

          <div className="flex-1 h-[116px] flex flex-col justify-center">
            <div className="font-heading text-[12px] tracking-[.02em] leading-none">
              {userDisplayData.username}
            </div>

            <div className="flex items-end gap-2">
              <div className="flex flex-col items-center justify-end h-[55px]">
                <div className="font-heading tabular-nums text-[30px] text-red-500 leading-none">
                  {Intl.NumberFormat("id-ID").format(userDisplayData.points)}
                </div>
                <span className="font-heading text-[9px] uppercase tracking-widest text-red-500 whitespace-nowrap pt-1">
                  Physical Points
                </span>
              </div>

              <a
                href="/leaderboard"
                className="flex flex-col items-center justify-end h-[55px] w-[54px]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-[40px] w-[40px] fill-none stroke-[2] stroke-red-500"
                >
                  <path d="M4 21h16M6 21v-6h4v6M14 21V8h4v13M10 21V12h4v9" />
                </svg>
                <span className="font-heading text-[9px] uppercase tracking-widest text-red-500 pt-1">
                  Leaderboard
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* Tiga statistik singkat */}
        <section className="grid grid-cols-3 w-[320px] h-[64px] mt-30">
          {statsCards.map((s, i) => (
            <div key={i} className="flex flex-col items-center justify-center">
              <div className="font-heading tabular-nums text-[28px] leading-none">
                {Intl.NumberFormat("id-ID").format(s.value)}
              </div>
              <div className="font-heading text-[9px] uppercase leading-[11px] tracking-widest text-center">
                {s.l1}
                <br />
                {s.l2}
              </div>
            </div>
          ))}
        </section>

        <button
          onClick={() => router.push("/challenge")}
          className="w-[320px] h-[56px] mt-48 rounded-md grid place-items-center font-heading text-[15px] tracking-[.02em]
                   bg-[radial-gradient(120%_120%_at_50%_10%,#ff6b6b_0%,#d90429_40%,#b00020_70%,#7a0015_100%)]
                   shadow-[0_10px_24px_rgba(0,0,0,.45)]"
        >
          START CHALLENGE
        </button>
      </div>

      <OverlayMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={authMenu}
      />
    </MobileShell>
  );
}

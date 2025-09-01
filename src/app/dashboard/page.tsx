"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";
import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, stats, isLoading } = useAuthStore();

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const CONTENT_H = 590;

  const userDisplayData = {
    name: user?.name ?? "User",
    username: user?.username ?? "username",
    points: stats?.totalPoints ?? 0,
    photoUrl: user?.profilePictureUrl ?? "",
  };

  const statsCards = [
    { value: stats?.totalChallenges ?? 0, l1: "COMPLETED", l2: "CHALLENGE" },
    { value: stats?.totalReps ?? 0, l1: "SQUAT", l2: "REPETITION" },
    { value: stats?.totalCalori ?? 0, l1: "BURNED", l2: "KCAL" },
  ];

  const weekly = [9, 6, 8, 5, 7, 3, 2];
  const barHeights = useMemo(
    () => weekly.map((v) => `${Math.max(0, Math.min(10, v)) * 10}%`),
    [weekly]
  );
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
      contentHeight={CONTENT_H}
    >
      {/* BG */}
      <div className="absolute inset-0">
        <Image
          src="/images/ball.png"
          alt=""
          fill
          sizes="360px"
          style={{ objectFit: "cover", objectPosition: "top" }}
          className="opacity-25"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div
        className="relative z-10 h-full w-full overflow-hidden text-white grid justify-items-center"
        style={{
          gridTemplateRows: "73px 116px 64px 160px 56px",
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

        {/* Row profil */}
        <section className="w-[320px] h-[116px] flex items-center">
          <div
            className="relative w-[101px] h-[116px] p-[7px] shrink-0"
            style={{
              clipPath:
                "polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)",
              background:
                "linear-gradient(180deg,#bdbdbd 0%,#6b6b6b 50%,#d1d1d1 100%)",
            }}
          >
            <div
              className="relative w-full h-full overflow-hidden"
              style={{
                clipPath:
                  "polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)",
                background:
                  "radial-gradient(120% 120% at 50% 10%,#3d3d3d,#171717 70%)",
                border: "2px solid #ff2a2a",
                boxShadow:
                  "0 0 10px rgba(255,42,42,.6), inset 0 0 18px rgba(255,42,42,.35)",
              }}
            >
              <Image
                src={userDisplayData.photoUrl || "/images/bottle.png"}
                alt="User"
                fill
                sizes="120px"
                style={{ objectFit: "cover" }}
                className="opacity-85"
              />
            </div>
          </div>

          <div className="w-[74px] h-[116px] grid place-items-center shrink-0">
            <Image
              src="/images/legendary.png"
              alt="Legendary"
              width={74}
              height={116}
              priority
              className="object-contain opacity-90"
            />
          </div>

          <div className="flex-1 h-[116px] flex flex-col justify-center pl-2">
            <div className="font-heading text-[12px] tracking-[.02em] leading-none">
              {userDisplayData.name}
            </div>
            <div className="flex items-end gap-2">
              <div className="leading-none">
                <div className="font-heading tabular-nums text-[30px] text-red-500 leading-none">
                  {Intl.NumberFormat("id-ID").format(userDisplayData.points)}
                </div>
                <div className="font-heading text-[9px] uppercase tracking-widest text-red-500">
                  Physical Points
                </div>
              </div>

              <a
                href="/leaderboard"
                className="flex flex-col items-center justify-end h-[55px] w-[54px]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-[30px] w-[30px] fill-none stroke-[2] stroke-red-500"
                >
                  <path d="M4 21h16M6 21v-6h4v6M14 21V8h4v13M10 21V12h4v9" />
                </svg>
                <span className="font-heading text-[9px] uppercase tracking-widest text-red-500 -mt-0.5">
                  Leaderboard
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="w/[320px] h-[64px] grid grid-cols-3 w-[320px]">
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

        {/* Weekly card */}
        <section className="w-[320px] h-[160px] rounded-2xl bg-[#3a3a3a] text-white/95">
          <div className="h-full w-full px-3 pt-3">
            <div className="font-heading text-[12px] tracking-[.02em]">
              WEEKLY WORKOUTS
            </div>
            <div className="mt-1 flex justify-between">
              <div className="w-[193px] h-[109px]">
                <div className="flex items-end gap-[10px] h-[90px]">
                  {barHeights.map((h, i) => (
                    <div
                      key={i}
                      className="w-[14px] rounded-t-md"
                      style={{
                        height: h,
                        background:
                          i % 2 === 0
                            ? "linear-gradient(180deg,#ff3b3b,#a40012)"
                            : "linear-gradient(180deg,#6a6a6a,#434343)",
                      }}
                    />
                  ))}
                </div>
                <div className="mt-[6px] grid grid-cols-7 text-center text-[9px] opacity-90">
                  {DAYS.map((d, idx) => (
                    <div key={`${d}-${idx}`}>{d[0]}</div>
                  ))}
                </div>
              </div>

              <div className="w-[56px] h-[102px] text-right mr-1">
                <div className="font-heading tabular-nums text-[30px] leading-none">
                  32
                </div>
                <div className="font-heading text-[9px] uppercase tracking-widest opacity-90">
                  Challenge/Week
                </div>
                <div className="mt-[4px] font-heading tabular-nums text-[30px] leading-none">
                  604
                </div>
                <div className="font-heading text-[9px] uppercase tracking-widest opacity-90">
                  Avg.Reps/Day
                </div>
              </div>
            </div>
          </div>
        </section>

        <a
          href="/challenge"
          className="w-[320px] h-[56px] mt-8 rounded-md grid place-items-center font-heading text-[15px] tracking-[.02em]
                     bg-[radial-gradient(120%_120%_at_50%_10%,#ff6b6b_0%,#d90429_40%,#b00020_70%,#7a0015_100%)]
                     shadow-[0_10px_24px_rgba(0,0,0,.45)]"
        >
          START CHALLENGE
        </a>
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

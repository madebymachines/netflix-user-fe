"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";
import { useAuthStore } from "@/store/authStore";

function HexAvatar({
  size = 64,
  src = "/images/bottle.png",
  badge,
}: {
  size?: number;
  src?: string;
  badge?: string | number;
}) {
  const outer: React.CSSProperties = {
    width: size,
    height: size,
    clipPath: "polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)",
    background: "linear-gradient(180deg,#bdbdbd,#6b6b6b 50%,#d1d1d1)",
    padding: Math.max(4, Math.round(size * 0.06)),
  };

  return (
    <div className="relative inline-block" style={outer}>
      <div
        className="w-full h-full overflow-hidden"
        style={{
          clipPath: "polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)",
          background:
            "radial-gradient(120% 120% at 50% 10%,#3d3d3d,#171717 70%)",
          border: "2px solid #ff2a2a",
          boxShadow:
            "0 0 10px rgba(255,42,42,.5), inset 0 0 18px rgba(255,42,42,.3)",
        }}
      >
        <Image
          src={src}
          alt="avatar"
          width={size}
          height={size}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {badge != null && (
        <span className="absolute -top-2 -right-2 grid place-items-center h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
          {badge}
        </span>
      )}
    </div>
  );
}

function SegTab({
  items,
  value,
  onChange,
  className = "",
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-2 bg-black/40 rounded-md border border-white/15 overflow-hidden ${className}`}
    >
      {items.map((it) => {
        const active = it === value;
        return (
          <button
            key={it}
            onClick={() => onChange(it)}
            className={`h-8 text-[12px] font-heading tracking-wider ${
              active ? "bg-red-600" : "bg-transparent"
            }`}
          >
            {it.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

export default function LeaderboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [region, setRegion] = useState<"Singapore" | "Global">("Singapore");
  const [period, setPeriod] = useState<"All Time" | "Weekly" | "Top Streak">(
    "All Time"
  );

  const { user, isLoading } = useAuthStore();
  const isLoggedIn = !!user;

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // Dummy data
  const podium = useMemo(
    () => [
      { name: "@ryan", pts: 12658, photo: "" },
      { name: "@dwiotten", pts: 12658, photo: "" },
      { name: "@gina", pts: 12658, photo: "" },
    ],
    []
  );

  const rows = useMemo(
    () =>
      [
        ["04", "@yandha", "11,000", "12,000"],
        ["05", "@morgan", "11,000", "12,000"],
        ["06", "@hanzo", "11,000", "12,000"],
        ["07", "@nanda", "11,000", "12,000"],
        ["08", "@brenda", "11,000", "12,000"],
        ["09", "@julya", "11,000", "12,000"],
        ["10", "@elcapo", "11,000", "12,000"],
      ] as [string, string, string, string][],
    []
  );

  const guestMenu = [
    { label: "Home", href: "/" },
    { label: "Sign In", href: "/sign-in" },
    { label: "Register", href: "/register" },
    { label: "Leaderboard", href: "/leaderboard" },
  ];
  const authMenu = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Profile", href: "/profile" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Logout", onClick: () => alert("Logout…") },
  ];

  const menuItems = isLoading ? [] : isLoggedIn ? authMenu : guestMenu;

  return (
    <MobileShell
      header={<Header onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />}
    >
      <div className="absolute inset-0">
        <Image
          src="/images/ball.png"
          alt=""
          fill
          sizes="360px"
          style={{ objectFit: "cover", objectPosition: "top" }}
          className="opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative z-10 w-full text-white px-4 pb-6">
        <div className="w-full flex justify-center pt-2">
          <Image src="/images/logo2.png" alt="unlock" width={205} height={73} />
        </div>

        <h1 className="mt-1 mb-2 text-center font-heading text-[18px] tracking-widest">
          LEADERBOARD
        </h1>

        <SegTab
          items={["Singapore", "Global"]}
          value={region}
          onChange={(v) => setRegion(v as any)}
          className="w-[320px] mx-auto"
        />

        <div className="grid grid-cols-3 gap-2 w-[320px] mx-auto mt-2">
          {(["All Time", "Weekly", "Top Streak"] as const).map((it) => {
            const active = period === it;
            return (
              <button
                key={it}
                onClick={() => setPeriod(it)}
                className={`h-8 rounded-md text-[11px] font-heading tracking-wider border border-white/15 ${
                  active ? "bg-red-600" : "bg-black/40"
                }`}
              >
                {it.toUpperCase()}
              </button>
            );
          })}
        </div>

        <div className="w-[320px] mx-auto mt-3 p-3 rounded-xl bg-black/30 border border-white/10">
          <div className="flex items-end justify-center gap-5">
            <div className="grid justify-items-center gap-1">
              <HexAvatar size={62} badge={3} />
              <div className="text-[10px]">@{podium[0].name.slice(1)}</div>
              <div className="text-[10px] opacity-90">
                {podium[0].pts.toLocaleString("id-ID")}
              </div>
            </div>
            <div className="grid justify-items-center gap-1 -mt-3">
              <HexAvatar size={70} badge={1} />
              <div className="text-[10px] text-red-500">{podium[1].name}</div>
              <div className="text-[10px] opacity-90">
                {podium[1].pts.toLocaleString("id-ID")}
              </div>
            </div>
            <div className="grid justify-items-center gap-1">
              <HexAvatar size={62} badge={2} />
              <div className="text-[10px]">@{podium[2].name.slice(1)}</div>
              <div className="text-[10px] opacity-90">
                {podium[2].pts.toLocaleString("id-ID")}
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-md overflow-hidden border border-white/10">
            <div className="grid grid-cols-[40px_1fr_60px_70px] bg-black/60 text-[10px] uppercase tracking-widest px-2 py-2">
              <div>Rank</div>
              <div>User</div>
              <div className="text-right pr-2">Total Rep</div>
              <div className="text-right pr-1">Total Points</div>
            </div>
            <div className="bg-black/30">
              {rows.map(([rk, user, rep, pts]) => (
                <div
                  key={`${rk}-${user}`}
                  className="grid grid-cols-[40px_1fr_60px_70px] text-[11px] px-2 py-1 border-t border-white/5"
                >
                  <div>{rk}</div>
                  <div>{user}</div>
                  <div className="text-right pr-2">{rep}</div>
                  <div className="text-right pr-1">{pts}</div>
                </div>
              ))}

              <div className="grid grid-cols-[40px_1fr_60px_70px] text-[11px] px-2 py-1 bg-red-600">
                <div>01</div>
                <div>@dwiotten</div>
                <div className="text-right pr-2">12,658</div>
                <div className="text-right pr-1">13,208</div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-[320px] mx-auto mt-3">
          <button
            className="w-full h-[40px] rounded-md font-heading tracking-wider bg-white text-black"
            onClick={() => alert(`Share ${region} • ${period}`)}
          >
            SHARE TO SOCIAL MEDIA
          </button>
        </div>
      </div>

      <OverlayMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={menuItems}
      />
    </MobileShell>
  );
}

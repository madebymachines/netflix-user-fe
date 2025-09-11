/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { isAxiosError } from "axios";
import * as htmlToImage from "html-to-image";

const COUNTRIES = [{ code: "MY", label: "Malaysia" }];

const codeToLabel = (code?: string | null) =>
  COUNTRIES.find((c) => c.code === (code || "").toUpperCase())?.label ??
  code ??
  "";

type TimespanUI = "All Time" | "Weekly" | "Top Streak";
const TIMESPAN_TO_QUERY: Record<TimespanUI, "alltime" | "weekly" | "streak"> = {
  "All Time": "alltime",
  Weekly: "weekly",
  "Top Streak": "streak",
};

type Row = {
  rank: number;
  username: string;
  profilePictureUrl: string | null;
  points: number;
};

type LeaderboardResponse = {
  pagination: {
    currentPage: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  leaderboard: Row[];
};

function frameForPoints(points: number | null | undefined): string {
  const p = Math.max(0, Number(points ?? 0));
  if (p >= 6000) return "/images/f_legendary.png";
  if (p >= 3000) return "/images/f_warrior.png";
  if (p >= 1000) return "/images/f_challenger.png";
  return "/images/f_rookie.png";
}

function HexFrameAvatar({
  size = 88,
  src,
  points,
  rankBadge,
  gender,
  className = "",
}: {
  size?: number;
  src?: string | null;
  points?: number | null;
  rankBadge?: 1 | 2 | 3;
  gender?: "MALE" | "FEMALE";
  className?: string;
}) {
  const HEX = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";
  const inset = Math.round(size * 0.16);
  const frameSrc = frameForPoints(points);

  const genderPlaceholder =
    gender === "FEMALE"
      ? "/images/placeholder_female.png"
      : "/images/placeholder_male.png";

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Foto ter-clip */}
      <div
        className="absolute inset-0"
        style={{ clipPath: HEX, padding: inset, boxSizing: "border-box" }}
      >
        <div
          className="w-full h-full relative overflow-hidden"
          style={{ clipPath: HEX }}
        >
          <Image
            src={src || genderPlaceholder}
            alt="avatar"
            fill
            sizes={`${size}px`}
            style={{ objectFit: "cover" }}
            priority={false}
          />
        </div>
      </div>

      {/* Frame */}
      <Image
        src={frameSrc}
        alt="frame"
        fill
        sizes={`${size}px`}
        style={{ objectFit: "contain", pointerEvents: "none" }}
        priority={false}
      />

      {/* Badge rank */}
      {rankBadge && (
        <div className="absolute -bottom-2 -left-2">
          <Image
            src={`/images/${rankBadge}.png`}
            alt={`rank-${rankBadge}`}
            width={28}
            height={28}
            style={{ objectFit: "contain" }}
            priority={false}
          />
        </div>
      )}
    </div>
  );
}

export default function LeaderboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [period, setPeriod] = useState<TimespanUI>("All Time");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { user, isLoading, checkAuth } = useAuthStore();
  const isLoggedIn = !!user;

  const REGION_CODE = "MY";
  const REGION_LABEL = "Malaysia";

  useEffect(() => {
    checkAuth({ allowRefresh: false });
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const { data } = await api.get<LeaderboardResponse>("/leaderboard", {
          params: {
            timespan: TIMESPAN_TO_QUERY[period],
            page: 1,
            limit: 10,
            region: REGION_CODE,
          },
          signal: ctrl.signal,
          _skipAuthRefresh: true,
        });
        setRows(data.leaderboard);
      } catch (err: unknown) {
        if (isAxiosError(err) && err.code === "ERR_CANCELED") return;
        setErrorMsg(
          isAxiosError(err) ? err.message : "Failed to load leaderboard."
        );
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [period]);

  const podium = useMemo(() => rows.slice(0, 3), [rows]);
  const tableRows = useMemo(
    () => (rows.length <= 3 ? rows.slice(0, 10) : rows.slice(3, 10)),
    [rows]
  );

  const isSelf = (u?: string | null) =>
    !!user?.username && !!u && u.toLowerCase() === user.username.toLowerCase();

  const guestMenu = [
    { label: "Home", href: "/" },
    { label: "Sign In", href: "/sign-in" },
    { label: "Leaderboard", href: "/leaderboard" },
  ];
  const authMenu = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Profile", href: "/profile" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Logout", onClick: () => alert("Logout…") },
  ];
  const menuItems = isLoading ? [] : isLoggedIn ? authMenu : guestMenu;

  const shareRegionLabel = REGION_LABEL;

  const shareRef = useRef<HTMLDivElement>(null);
  const handleShare = async () => {
    const node = shareRef.current;
    if (!node) return;
    try {
      const dataUrl = await htmlToImage.toPng(node, {
        pixelRatio: 3,
        backgroundColor: "#000000",
        skipFonts: false,
        cacheBust: true,
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File(
        [blob],
        `leaderboard-${shareRegionLabel}-${period}.png`,
        { type: "image/png" }
      );

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Leaderboard",
          text: `Physical Asia – ${shareRegionLabel} • ${period}`,
          files: [file],
        });
        return;
      }

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      alert("Gambar sudah diunduh. Upload manual ke Instagram/TikTok ya 👍");
    } catch (e) {
      console.error(e);
      alert("Gagal membuat gambar untuk dibagikan.");
    }
  };

  return (
    <MobileShell
      header={<Header onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />}
    >
      {/* BG */}
      <div className="absolute inset-0">
        <Image
          src="/images/ball.png"
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "top" }}
          className="opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div ref={shareRef} className="relative z-10 w-full text-white px-4 pb-6">
        <div className="w-full flex justify-center pt-2">
          <Image src="/images/logo2.png" alt="unlock" width={205} height={73} />
        </div>

        <h1 className="mt-4 text-center font-semibold text-red-500 text-[20px] tracking-widest">
          LEADERBOARD
        </h1>

        <div className="w-[320px] mx-auto mt-1">
          <div
            className="h-8 rounded-md bg-red-600 grid place-items-center
                  font-heading text-[12px] tracking-wider"
          >
            {REGION_LABEL.toUpperCase()}
          </div>
        </div>

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

        {errorMsg && (
          <div className="w-[320px] mx-auto mt-3 p-2 rounded-md bg-red-500/20 border border-red-500 text-red-200 text-[12px]">
            {errorMsg}
          </div>
        )}

        <div className="w-[320px] mx-auto mt-3 p-3 rounded-xl bg-black/30 border border-white/10">
          {/* Podium */}
          <div className="flex items-end justify-center gap-6">
            {[podium[1], podium[0], podium[2]].map((p, idx) => {
              const size = idx === 1 ? 92 : 82;
              const rank = (idx === 1 ? 1 : idx === 0 ? 2 : 3) as 1 | 2 | 3;
              const shiftY = idx === 1 ? -12 : 20;
              const pts = p?.points ?? 0;

              return (
                <div
                  key={rank}
                  className="grid justify-items-center gap-1"
                  style={{ transform: `translateY(${shiftY}px)` }}
                >
                  <HexFrameAvatar
                    size={size}
                    src={p?.profilePictureUrl || null}
                    points={pts}
                    rankBadge={rank}
                  />
                  <div
                    className={`text-[10px] ${
                      isSelf(p?.username) ? "text-red-500" : ""
                    }`}
                  >
                    @{p?.username ?? "-"}
                  </div>
                  <div className="text-[10px] opacity-90">
                    {pts.toLocaleString("id-ID")}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table */}
          <div className="mt-6 rounded-md overflow-hidden border border-white/10">
            <div className="grid grid-cols-[40px_1fr_70px] bg-black/60 text-[10px] uppercase tracking-widest px-2 py-2">
              <div>Rank</div>
              <div>User</div>
              <div className="text-right pr-1">Points</div>
            </div>
            <div className="bg-black/30">
              {loading ? (
                <div className="px-2 py-3 text-[12px] opacity-80">Loading…</div>
              ) : (
                tableRows.map((r) => (
                  <div
                    key={`${r.rank}-${r.username}`}
                    className="grid grid-cols-[40px_1fr_70px] text-[11px] px-2 py-1 border-t border-white/5"
                  >
                    <div>{String(r.rank).padStart(2, "0")}</div>
                    <div
                      className={`${isSelf(r.username) ? "text-red-500" : ""}`}
                    >
                      @{r.username}
                    </div>
                    <div className="text-right pr-1">
                      {(r?.points ?? 0).toLocaleString("id-ID")}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tombol Share */}
      <div className="relative z-10 w-[320px] mx-auto -mt-2 mb-6">
        <button
          className="w-full h-[40px] rounded-md font-heading tracking-wider bg-white text-black"
          onClick={handleShare}
        >
          SHARE TO SOCIAL MEDIA
        </button>
      </div>

      <OverlayMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={menuItems}
      />
    </MobileShell>
  );
}

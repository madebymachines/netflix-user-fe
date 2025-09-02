/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { isAxiosError } from "axios";

const COUNTRIES = [
  { code: "SG", label: "Singapore" },
  { code: "MY", label: "Malaysia" },
  { code: "TH", label: "Thailand" },
];

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

function HexAvatar({
  size = 64,
  src,
  badge,
}: {
  size?: number;
  src?: string | null;
  badge?: string | number;
}) {
  const outer: React.CSSProperties = {
    width: size,
    height: size,
    clipPath: "polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)",
    background: "linear-gradient(180deg,#bdbdbd,#6b6b6b 50%,#d1d1d1)",
    padding: Math.max(4, Math.round(size * 0.06)),
  };
  const imgSrc = src || "/images/bottle.png";
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
          src={imgSrc}
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
  items: { key: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-2 bg-black/40 rounded-md border border-white/15 overflow-hidden ${className}`}
    >
      {items.map(({ key, label }) => {
        const active = key === value;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`h-8 text-[12px] font-heading tracking-wider ${
              active ? "bg-red-600" : "bg-transparent"
            }`}
          >
            {label.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

export default function LeaderboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [period, setPeriod] = useState<TimespanUI>("All Time");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const { user, isLoading, checkAuth } = useAuthStore();
  const isLoggedIn = !!user;

  useEffect(() => {
    checkAuth({ allowRefresh: false });
  }, []);

  const homeRegionCode = useMemo(() => {
    if (user?.country) return user.country.toUpperCase();
    const fromUrl = (searchParams.get("region") || "").toUpperCase();
    if (fromUrl && fromUrl !== "GLOBAL") return fromUrl;
    if (typeof window !== "undefined") {
      const ls = (localStorage.getItem("guestRegion") || "").toUpperCase();
      if (ls) return ls;
    }
    return "SG";
  }, [user?.country, searchParams]);

  const [regionCode, setRegionCode] = useState<string>(homeRegionCode);
  useEffect(() => setRegionCode(homeRegionCode), [homeRegionCode]);

  const regionIsGlobal = regionCode === "GLOBAL";
  const homeRegionLabel = useMemo(
    () => codeToLabel(homeRegionCode) || homeRegionCode,
    [homeRegionCode]
  );

  const segItems = useMemo(
    () => [
      { key: "region", label: homeRegionLabel },
      { key: "global", label: "Global" },
    ],
    [homeRegionLabel]
  );
  const segValue = regionIsGlobal ? "global" : "region";
  const onChangeSeg = (k: string) =>
    setRegionCode(k === "global" ? "GLOBAL" : homeRegionCode);

  useEffect(() => {
    const ctrl = new AbortController();
    const load = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const params: Record<string, string | number> = {
          timespan: TIMESPAN_TO_QUERY[period],
          page: 1,
          limit: 10,
        };
        if (!regionIsGlobal) params.region = regionCode;

        const { data } = await api.get<LeaderboardResponse>("/leaderboard", {
          params,
          signal: ctrl.signal,
          _skipAuthRefresh: true,
        });
        setRows(data.leaderboard);
      } catch (err: unknown) {
        if (isAxiosError(err) && err.code === "ERR_CANCELED") return;
        const msg = isAxiosError(err)
          ? err.message
          : "Failed to load leaderboard.";
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => ctrl.abort();
  }, [regionCode, regionIsGlobal, period]);

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

  const shareRegionLabel = regionIsGlobal ? "Global" : homeRegionLabel;

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
          items={segItems}
          value={segValue}
          onChange={onChangeSeg}
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

        {errorMsg && (
          <div className="w-[320px] mx-auto mt-3 p-2 rounded-md bg-red-500/20 border border-red-500 text-red-200 text-[12px]">
            {errorMsg}
          </div>
        )}

        <div className="w-[320px] mx-auto mt-3 p-3 rounded-xl bg-black/30 border border-white/10">
          {/* Podium */}
          <div className="flex items-end justify-center gap-5">
            {[podium[1], podium[0], podium[2]].map((p, idx) => {
              const size = idx === 1 ? 70 : 62;
              const rank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
              return (
                <div
                  key={rank}
                  className={`grid justify-items-center gap-1 ${
                    idx === 1 ? "-mt-3" : ""
                  }`}
                >
                  <HexAvatar
                    size={size}
                    badge={rank}
                    src={p?.profilePictureUrl || null}
                  />
                  <div
                    className={`text-[10px] ${
                      isSelf(p?.username) ? "text-red-500" : ""
                    }`}
                  >
                    @{p?.username ?? "-"}
                  </div>
                  <div className="text-[10px] opacity-90">
                    {(p?.points ?? 0).toLocaleString("id-ID")}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table */}
          <div className="mt-3 rounded-md overflow-hidden border border-white/10">
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

        <div className="w-[320px] mx-auto mt-3">
          <button
            className="w-full h-[40px] rounded-md font-heading tracking-wider bg-white text-black"
            onClick={() => alert(`Share ${shareRegionLabel} • ${period}`)}
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

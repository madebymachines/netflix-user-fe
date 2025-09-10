"use client";

import { useEffect, useMemo, useState } from "react";
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

type WeeklyAPI = {
  weekly: {
    senin: number;
    selasa: number;
    rabu: number;
    kamis: number;
    jumat: number;
    sabtu: number;
    minggu: number;
  };
  averageRepsPerDay: number;
  averageChallengePerWeek: number;
};

export default function DashboardPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [weeklyApi, setWeeklyApi] = useState<WeeklyAPI | null>(null);

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
          // biarkan interceptor auth yang handle
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

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await api.get<WeeklyAPI>(
          "/activities/stats/weekly-workout"
        );
        if (!active) return;
        setWeeklyApi(data);
      } catch (e) {
        console.warn("Failed to fetch weekly workout", e);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const dayOrder = [
    "senin",
    "selasa",
    "rabu",
    "kamis",
    "jumat",
    "sabtu",
    "minggu",
  ] as const;
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const dayValues: number[] = useMemo(() => {
    if (!weeklyApi) return [0, 0, 0, 0, 0, 0, 0];
    return dayOrder.map((k) => Math.max(0, weeklyApi.weekly[k]));
  }, [weeklyApi]);

  const maxVal = Math.max(1, ...dayValues);
  const barHeights = dayValues.map((v) => `${(v / maxVal) * 100}%`);
  const challengePerWeek = weeklyApi?.averageChallengePerWeek ?? 0;
  const avgRepsPerDay = weeklyApi?.averageRepsPerDay ?? 0;

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
      {/* BG */}
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
          gridTemplateRows: "73px 116px 64px 160px auto",
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
          <div className="relative w-[116px] h-[116px] shrink-0">
            <div
              className="
        absolute inset-[18%] overflow-hidden
        [clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]
      "
            >
              <Image
                src={userDisplayData.photoUrl || "/images/bottle.png"}
                alt="User"
                fill
                sizes="116px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>

            {/* FRAME */}
            <Image
              src="/images/f_legendary.png"
              alt="Legendary frame"
              fill
              sizes="116px"
              style={{ objectFit: "contain" }}
              priority
              className="pointer-events-none select-none"
            />
          </div>

          <div className="w-[74px] h-[116px] grid place-items-center shrink-0">
            <Image
              src="/images/legendary.png"
              alt="Legendary Badge"
              width={74}
              height={116}
              priority
              className="object-contain opacity-90"
            />
          </div>

          {/* data pengguna */}
          <div className="flex-1 h-[116px] flex flex-col justify-center">
            <div className="font-heading text-[12px] tracking-[.02em] leading-none">
              {userDisplayData.name}
            </div>
            <div className="flex items-end gap-2">
              {/* Physical Points */}
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

        {/* Stats */}
        <section className="grid grid-cols-3 w-[320px] h-[64px]">
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
                  {barHeights.map((h, i) => {
                    const isActive = dayValues[i] > 0;
                    return (
                      <div
                        key={i}
                        className="w-[14px] rounded-t-md transition-[height] duration-300"
                        style={{
                          height: h,
                          background: isActive
                            ? "linear-gradient(180deg,#ff3b3b,#a40012)"
                            : "linear-gradient(180deg,#6a6a6a,#434343)",
                        }}
                        title={`${dayLabels[i]}: ${dayValues[i]}`}
                      />
                    );
                  })}
                </div>
                <div className="mt-[6px] grid grid-cols-7 text-center text-[9px] opacity-90">
                  {dayLabels.map((d, idx) => (
                    <div key={idx}>{d[0]}</div>
                  ))}
                </div>
              </div>

              <div className="w-[56px] h-[102px] text-right mr-4">
                <div className="font-heading tabular-nums text-[30px] leading-none">
                  {Intl.NumberFormat("id-ID").format(challengePerWeek)}
                </div>
                <div className="font-heading text-[9px] uppercase tracking-widest opacity-90">
                  CHALLENGE/WEEK
                </div>

                <div className="mt-[24px] font-heading tabular-nums text-[30px] leading-none">
                  {Intl.NumberFormat("id-ID").format(avgRepsPerDay)}
                </div>
                <div className="font-heading text-[9px] uppercase tracking-widest opacity-90">
                  AVG.REPS/DAY
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
      />
    </MobileShell>
  );
}

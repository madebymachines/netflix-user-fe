// app/(whatever)/page.tsx  — LandingPage
"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronsDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import CountryPill from "@/components/CountryPill";
import OverlayMenu from "@/components/OverlayMenu";
import { useRouter } from "next/navigation";

const COUNTRIES = [{ code: "MY", label: "Malaysia" }];

const CONTENT_H = 590; // tinggi stage hero (tetap)
const BALL_H = 420; // tinggi background bola (tetap)
const GAP_AFTER_BALL = 20;
const BTN_H = 40;

// ==== POSISI VERTIKAL TETAP (px) ====
const LOGO_TOP = 120; // posisi logo
const BOTTLE_TOP = 240; // posisi botol
const SCROLL_CUE_TOP = BALL_H + GAP_AFTER_BALL + BTN_H + 10;

const STORAGE_KEY = "guestRegion";

export default function LandingPage() {
  const [country, setCountry] = useState<string | null>(null);
  const unlocked = !!country;

  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) setCountry(saved);
  }, []);

  const onCountryChange = (val: string | null) => {
    setCountry(val);
    if (typeof window === "undefined") return;
    if (val) localStorage.setItem(STORAGE_KEY, val);
    else localStorage.removeItem(STORAGE_KEY);
  };

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (!unlocked || menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = prev || "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [unlocked, menuOpen]);

  const moreRef = useRef<HTMLDivElement | null>(null);
  const goMore = () => moreRef.current?.scrollIntoView({ behavior: "smooth" });

  const leaderboardHref = useMemo(
    () => `/leaderboard${country ? `?region=${country}` : ""}`,
    [country]
  );

  const menuItems = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Sign In", href: "/sign-in" },
      { label: "Leaderboard", href: leaderboardHref },
    ],
    [leaderboardHref]
  );

  return (
    <>
      <MobileShell
        header={<Header onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />}
        contentHeight={CONTENT_H}
        dimAll={!unlocked}
        overlayChildren={
          !unlocked ? (
            <div className="relative h-full w-full">
              <div className="absolute left-1/2 -translate-x-1/2 top-[62px] pointer-events-auto">
                <CountryPill
                  value={country}
                  onChange={onCountryChange}
                  options={COUNTRIES}
                  placeholder="Select Country First"
                />
              </div>
            </div>
          ) : null
        }
      >
        {/* BG bola (tinggi tetap) */}
        <div
          className="absolute top-0 left-0 w-full"
          style={{ height: BALL_H }}
        >
          <Image
            src="/images/ball.png"
            alt="Background ball"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "top" }}
          />
        </div>

        {/* HERO content */}
        <div className="absolute inset-0 z-20">
          {/* pill country saat sudah pilih */}
          {unlocked && (
            <div className="absolute left-1/2 -translate-x-1/2 top-6 z-30">
              <CountryPill
                value={country}
                onChange={onCountryChange}
                options={COUNTRIES}
                placeholder="Select Country"
              />
            </div>
          )}

          {/* Logo: posisi Y tetap */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-20"
            style={{ top: LOGO_TOP }}
          >
            <Image
              src="/images/logo2.png"
              alt="UNLOCK YOUR 100"
              width={294}
              height={105}
              priority
            />
          </div>

          {/* Botol: posisi Y tetap (pakai top, bukan bottom) */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: BOTTLE_TOP }}
          >
            <Image
              src="/images/bottle.png"
              alt="100PLUS PRO"
              width={244}
              height={330}
              priority
              className="drop-shadow-[0_18px_40px_rgba(0,0,0,.55)]"
            />
          </div>

          {/* Tombol Unlock – posisikan segera setelah bola (tetap) */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: BALL_H + GAP_AFTER_BALL }}
          >
            <button
              disabled={!unlocked}
              onClick={() => router.push("/sign-in")}
              className={`h-[40px] w-[160px] rounded-full text-white font-bold text-[14px] tracking-wide
                shadow-[0_10px_24px_rgba(0,0,0,.45)]
                bg-[radial-gradient(120%_120%_at_50%_10%,#ff6b6b_0%,#d90429_40%,#b00020_70%,#7a0015_100%)]
                border border-white/15
                ${unlocked ? "" : "opacity-50 cursor-not-allowed"}`}
            >
              UNLOCK NOW
            </button>
          </div>

          {/* Scroll cue – tetap */}
          <button
            onClick={goMore}
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center text-white"
            style={{ top: SCROLL_CUE_TOP }}
            aria-label="Scroll to Learn More"
          >
            <span
              className={`text-[14px] mb-4 ${unlocked ? "" : "opacity-60"}`}
            >
              Scroll to Learn More
            </span>
            <ChevronsDown
              className={`w-7 h-7 ${
                unlocked ? "animate-bounce" : "opacity-60"
              }`}
            />
          </button>
        </div>

        {/* Overlay menu */}
        <OverlayMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          items={menuItems}
          contentHeight={CONTENT_H}
        />
      </MobileShell>

      {/* Section bawah (lebar responsif, tinggi bebas) */}
      <section className="w-full bg-black flex justify-center">
        <div className="relative w-full max-w-screen-md" ref={moreRef}>
          <div className="relative w-full min-h-[940px] overflow-hidden">
            <Image
              src="/images/ball2.png"
              alt="Background lower"
              fill
              sizes="100vw"
              style={{ objectFit: "cover", objectPosition: "top" }}
            />
            <div className="relative z-10 px-5 pt-8 pb-10 text-white">
              <h2 className="text-center text-[22px] font-extrabold tracking-wider mb-4">
                100 <span className="text-red-500">REWARDS</span> AWAIT!
              </h2>

              <div className="mx-auto w-[250px] space-y-4 p-3">
                {[
                  "100 FREE GYM MEMBERSHIPS & TRIALS",
                  "PHYSICAL ASIA EXCLUSIVE MERCHANDISE",
                  "MEET THE PHYSICAL ASIA WINNER",
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-full bg-white/10 border border-white/20 flex-shrink-0" />
                    <p className="text-[12px] leading-snug">{t}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-center text-[20px] font-extrabold tracking-wider mt-8 mb-3">
                GUIDE TO <span className="text-red-500">JOIN</span>
              </h3>

              {/* GUIDE TO JOIN – zigzag tetap */}
              <div className="relative mx-auto w-[300px] rounded-md px-4 text-white isolate">
                {[
                  {
                    n: "01",
                    t: "Upload receipt or membership upload to unlock the challenge.",
                  },
                  {
                    n: "02",
                    t: "Every rep you complete in the challenge converts into points.",
                  },
                  {
                    n: "03",
                    t: "Collect as many points as possible & stay consistent daily to earn bonus points.",
                  },
                  {
                    n: "04",
                    t: "Compete on the leaderboard to win Weekly, Monthly, Most Consistent, and Grand Prizes.",
                  },
                ].map((s, i) => {
                  const INDENT = 36;
                  const CIRCLE_L = -28;
                  const CIRCLE_R = -10;
                  const isZag = i % 2 === 1;
                  const indent = isZag ? INDENT : 0;
                  const circleLeft = isZag ? CIRCLE_R : CIRCLE_L;

                  return (
                    <div
                      key={i}
                      className="relative py-5"
                      style={{ marginLeft: indent }}
                    >
                      <span
                        className="absolute h-10 w-10 rounded-full bg-white/10 border border-white/20 pointer-events-none"
                        style={{ left: circleLeft }}
                      />
                      <div className="pl-12">
                        <div className="text-[22px] font-extrabold leading-none mb-1">
                          {s.n}
                        </div>
                        <p className="text-[12px] leading-snug opacity-90">
                          {s.t}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <a
                  href={leaderboardHref}
                  className="inline-block text-[12px] font-semibold underline text-red-500 pl-20"
                >
                  Leaderboard
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

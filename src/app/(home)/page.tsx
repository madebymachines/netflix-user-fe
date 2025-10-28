"use client";

import Image from "next/image";
import { ChevronsDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";
import { useRouter } from "next/navigation";

const CONTENT_H = 590;
const BALL_H = 420;
const GAP_AFTER_BALL = 20;
const BTN_H = 40;

const LOGO_TOP = 120;
const BOTTLE_TOP = 240;
const SCROLL_CUE_TOP = BALL_H + GAP_AFTER_BALL + BTN_H + 10;

function RoundThumb({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="h-14 w-14 rounded-full bg-white border border-white/20 overflow-hidden relative flex-shrink-0 p-1">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="56px"
        style={{ objectFit: "contain" }}
        priority={false}
      />
    </div>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = prev || "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const moreRef = useRef<HTMLDivElement | null>(null);
  const goMore = () => moreRef.current?.scrollIntoView({ behavior: "smooth" });

  const menuItems = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Sign In", href: "/sign-in" },
      { label: "Leaderboard", href: "/leaderboard" },
    ],
    []
  );

  return (
    <>
      <MobileShell
        header={
          <Header fixed onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />
        }
        contentHeight={CONTENT_H}
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
          {/* Logo: posisi Y tetap */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-20"
            style={{ top: LOGO_TOP, width: "310px", height: "100px" }}
          >
            <Image
              src="/images/logo2.png"
              alt="UNLOCK YOUR 100"
              fill
              priority
              style={{ objectFit: "contain" }}
            />
          </div>

          {/* Botol: posisi Y tetap */}
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

          {/* Tombol Unlock */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: BALL_H + GAP_AFTER_BALL }}
          >
            <button
              onClick={() => router.push("/sign-in")}
              className="h-[40px] w-[160px] rounded-full text-white font-bold text-[14px] tracking-wide
                shadow-[0_10px_24px_rgba(0,0,0,.45)]
                bg-[radial-gradient(120%_120%_at_50%_10%,#ff6b6b_0%,#d90429_40%,#b00020_70%,#7a0015_100%)]
                border border-white/15"
            >
              UNLOCK NOW
            </button>
          </div>

          {/* Scroll cue */}
          <button
            onClick={goMore}
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center text-white"
            style={{ top: SCROLL_CUE_TOP }}
            aria-label="Scroll to Learn More"
          >
            <span className="text-[14px] mb-4">Scroll to Learn More</span>
            <ChevronsDown className="w-7 h-7 animate-bounce" />
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

      {/* Section bawah */}
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
                <span className="text-red-500">EXCITING</span> REWARDS AWAIT!
              </h2>

              {/* Rewards list */}
              <div className="mx-auto w-[300px] space-y-5 p-3">
                {/* GRAND PRIZE */}
                <div className="flex items-start gap-4">
                  <RoundThumb
                    src="/images/Grand_Prize.png"
                    alt="Fitness First & Celebrity Fitness"
                  />
                  <div>
                    <div className="uppercase font-extrabold tracking-wide text-[14px]">
                      Grand Prize 5x per month
                    </div>
                    <p className="text-[12px] leading-snug opacity-90">
                      WIN 3 months of dual brand gym memberships at Fitness
                      First &amp; Celebrity Fitness
                    </p>
                  </div>
                </div>

                {/* WEEKLY PRIZE */}
                <div className="flex items-start gap-4">
                  <RoundThumb
                    src="/images/Weekly_Prize.png"
                    alt="100PLUS PRO Kit"
                  />
                  <div>
                    <div className="uppercase font-extrabold tracking-wide text-[14px]">
                      Weekly Prizes 20x per month
                    </div>
                    <p className="text-[12px] leading-snug opacity-90">
                      WIN 100PLUS PRO Kit
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-center text-[20px] font-extrabold tracking-wider mt-8 mb-3">
                GUIDE TO <span className="text-red-500">JOIN</span>
              </h3>

              {/* GUIDE TO JOIN – zigzag */}
              <div className="relative mx-auto w-[300px] rounded-md px-4 text-white isolate">
                {[
                  {
                    n: "01",
                    t: "Upload receipt or membership gym to unclock the challange.",
                  },
                  {
                    n: "02",
                    t: "Every rep you complete in the challenge converts into points.",
                  },
                  {
                    n: "03",
                    t: "Collect as many points as possible and stay consistent daily to earn bonus points.",
                  },
                  {
                    n: "04",
                    t: "Compete on the leaderboard to win the Grand Prizes.",
                  },
                ].map((s, i) => {
                  const INDENT = 36;
                  const isZag = i % 2 === 1;
                  const indent = isZag ? INDENT : 0;

                  return (
                    <div
                      key={i}
                      className="relative py-5"
                      style={{ marginLeft: indent }}
                    >
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
                  href="/leaderboard"
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

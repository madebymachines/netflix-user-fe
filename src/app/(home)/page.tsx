"use client";
import Image from "next/image";
import { ChevronsDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import CountryPill from "@/components/CountryPill";
import OverlayMenu from "@/components/OverlayMenu";
import { useAuthStore } from "@/store/authStore"; // Import store

const COUNTRIES = [
  { code: "ID", label: "Indonesia" },
  { code: "SG", label: "Singapore" },
  { code: "MY", label: "Malaysia" },
  { code: "TH", label: "Thailand" },
  { code: "KH", label: "Cambodia" },
  { code: "VN", label: "Vietnam" },
  { code: "PH", label: "Philippines" },
  { code: "BN", label: "Brunei" },
  { code: "LA", label: "Laos" },
  { code: "MM", label: "Myanmar" },
];

const CONTENT_H = 590;
const BALL_H = 420;
const BOTTOM_TO_ALIGN = CONTENT_H - BALL_H;
const GAP_AFTER_BALL = 20;
const BTN_H = 40;

export default function LandingPage() {
  const [country, setCountry] = useState<string | null>(null);
  const unlocked = !!country;

  const [loggedIn, setLoggedIn] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

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

  const guestMenu = [
    { label: "Home", href: "/" },
    { label: "Sign In", href: "/sign-in" },
    { label: "Register", href: "/register" },
  ];
  const authMenu = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Profile", href: "/profile" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Logout", onClick: () => setLoggedIn(false) },
    
  ];

  const menuItems = loggedIn ? authMenu : guestMenu;

  return (
    <>
      <MobileShell
        header={<Header onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />}
        contentHeight={CONTENT_H}
        dimAll={!unlocked}
        overlayChildren={
          !unlocked ? (
            <div className="relative w-[360px] h-full">
              <div className="absolute left-1/2 -translate-x-1/2 top-[62px] pointer-events-auto">
                <CountryPill
                  value={country}
                  onChange={setCountry}
                  options={COUNTRIES}
                  placeholder="Select Country First"
                />
              </div>
            </div>
          ) : null
        }
      >
        <div className="absolute top-0 left-0 w-full h-[420px]">
          <Image
            src="/images/ball.png"
            alt="Background ball"
            fill
            priority
            sizes="360px"
            style={{ objectFit: "cover", objectPosition: "top" }}
          />
        </div>

        <div className="absolute inset-0 z-20">
          {unlocked && (
            <div className="absolute left-1/2 -translate-x-1/2 top-4 z-30">
              <CountryPill
                value={country}
                onChange={setCountry}
                options={COUNTRIES}
                placeholder="Select Country"
              />
            </div>
          )}

          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: BOTTOM_TO_ALIGN }}
          >
            <Image
              src="/images/bottle.png"
              alt="100PLUS PRO"
              width={244}
              height={336}
              priority
              className="drop-shadow-[0_18px_40px_rgba(0,0,0,.55)]"
            />
          </div>

          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: BALL_H + GAP_AFTER_BALL }}
          >
            <button
              disabled={!unlocked}
              className={`h-[40px] w-[160px] rounded-full text-white font-bold text-[14px] tracking-wide
                shadow-[0_10px_24px_rgba(0,0,0,.45)]
                bg-[radial-gradient(120%_120%_at_50%_10%,#ff6b6b_0%,#d90429_40%,#b00020_70%,#7a0015_100%)]
                border border-white/15
                ${unlocked ? "" : "opacity-50 cursor-not-allowed"}`}
            >
              UNLOCK NOW
            </button>
          </div>

          <button
            onClick={goMore}
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center text-white"
            style={{ top: BALL_H + GAP_AFTER_BALL + BTN_H + 10 }}
            aria-label="Scroll to Learn More"
          >
            <span
              className={`text-[14px] mb-1 ${unlocked ? "" : "opacity-60"}`}
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

        <OverlayMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          items={menuItems}
          contentHeight={CONTENT_H}
        />
      </MobileShell>

      <section className="w-full bg-black flex justify-center">
        <div className="relative w-[360px]" ref={moreRef}>
          <div className="relative w-[360px] min-h-[940px] overflow-hidden">
            <Image
              src="/images/ball2.png"
              alt="Background lower"
              fill
              sizes="360px"
              style={{ objectFit: "cover", objectPosition: "top" }}
            />
            <div className="relative z-10 px-5 pt-8 pb-10 text-white">
              <h2 className="text-center text-[22px] font-extrabold tracking-wider mb-4">
                100 <span className="text-red-500">REWARDS</span> AWAIT!
              </h2>
              <div className="mx-auto w-[215px] border border-white/10 rounded-md p-3">
                {[
                  "100 FREE GYM MEMBERSHIPS & TRIALS",
                  "PHYSICAL ASIA EXCLUSIVE MERCHANDISE",
                  "MEET THE PHYSICAL ASIA WINNER",
                  "…and more",
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-3 py-2">
                    <span className="mt-1 inline-block h-7 w-7 rounded-full bg-white/10 border border-white/20" />
                    <p className="text-[12px] leading-tight">{t}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-center text-[20px] font-extrabold tracking-wider mt-8 mb-3">
                GUIDE TO <span className="text-red-500">JOIN</span>
              </h3>

              <div className="mx-auto w-[280px] border border-white/10 rounded-md p-4">
                {[
                  {
                    n: "01",
                    t: "Scan or unscrew cap to unlock the challenge.",
                  },
                  {
                    n: "02",
                    t: "Every rep you complete converts into points.",
                  },
                  {
                    n: "03",
                    t: "Collect many points & stay consistent daily to earn bonus points.",
                  },
                  {
                    n: "04",
                    t: "Compete on the leaderboard to win weekly, monthly & grand prizes.",
                  },
                ].map((s, i) => (
                  <div key={i} className="grid grid-cols-[28px_1fr] gap-3 py-3">
                    <span className="h-7 w-7 rounded-full bg-white/10 border border-white/20" />
                    <div>
                      <div className="text-[18px] font-extrabold leading-none mb-1">
                        {s.n}
                      </div>
                      <p className="text-[12px] leading-tight opacity-90">
                        {s.t}
                      </p>
                    </div>
                  </div>
                ))}
                <button className="mt-3 text-[12px] underline text-red-400">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

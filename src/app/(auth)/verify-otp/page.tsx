"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";

export default function VerifyOtpPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const CONTENT_H = 590;

  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "diwotten.25@gmail.com";

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const guestMenu = [
    { label: "Home", href: "/" },
    { label: "Sign In", href: "/sign-in" },
    { label: "Register", href: "/register" },
  ];

  const onChangeOtp = (v: string) => {
    const next = v.replace(/\D/g, "").slice(0, 6);
    setOtp(next);
  };

  const isValid = /^\d{6}$/.test(otp);

  const onVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    // TODO: panggil API verifikasi kamu
    alert(`Verifikasi OTP ${otp} untuk ${email}`);
  };

  return (
    <MobileShell
      header={<Header onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />}
      contentHeight={CONTENT_H}
    >
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

      <div className="relative z-10 h-full w-full px-5 pt-6 text-white">
        <h1 className="text-center text-[24px] font-extrabold tracking-wide mb-3">
          Verify Your Email
        </h1>

        <p className="text-center text-[12px] leading-snug opacity-90 mb-6">
          We have sent you an OTP via Email, to{" "}
          <span className="font-semibold underline">{email}</span> check your
          inbox &amp; spam folder and enter the code below.
        </p>

        <form onSubmit={onVerify} className="space-y-5">
          <input
            value={otp}
            onChange={(e) => onChangeOtp(e.target.value)}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter OTP here"
            className="w-full bg-transparent border-b border-white/40 px-0 py-3 placeholder-white/40
                       focus:outline-none focus:border-white text-[16px] tracking-[0.2em]"
          />

          <div className="text-[12px]">
            Did not receive the OTP?{" "}
            <button
              type="button"
              onClick={() => alert("Resend code")}
              className="underline"
            >
              Resend Code
            </button>
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className={`w-full rounded-md py-3 font-bold transition
              ${
                isValid
                  ? "bg-white text-black"
                  : "bg-white/20 text-white/60 cursor-not-allowed"
              }`}
          >
            Verify
          </button>
        </form>

        <Link
          href="/register"
          className="block mt-5 w-full rounded-md border border-white/40 bg-black/50 py-3 text-center font-bold"
        >
          Back to Sign Up
        </Link>
      </div>

      <OverlayMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={guestMenu}
        contentHeight={CONTENT_H}
      />
    </MobileShell>
  );
}

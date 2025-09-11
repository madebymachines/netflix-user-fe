"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";

const CONTENT_H = 590;

export default function CheckEmailPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";

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

  return (
    <MobileShell
      header={<Header onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />}
      contentHeight={CONTENT_H}
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

      {/* Centered content */}
      <div className="relative z-10 h-full w-full px-6 text-white flex flex-col justify-center items-center text-center">
        <h1 className="text-[24px] font-extrabold tracking-wide mb-3">
          Check Your Email
        </h1>
        <p className="text-[13px] leading-snug opacity-90 mb-8">
          We just sent a password reset link to your email{" "}
          <span className="font-semibold">{email}</span>. <br />
          Please check and click on the link to reset your password.
        </p>

        <Link
          href="/sign-in"
          className="w-full max-w-[280px] rounded-md py-3 font-bold bg-white text-black text-center"
        >
          BACK TO SIGN IN
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

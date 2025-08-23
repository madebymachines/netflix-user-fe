"use client";
import { useEffect, useState } from "react";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";

export default function SignInPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const CONTENT_H = 590;

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
      <div className="absolute inset-0 bg-[url('/images/ball.png')] bg-cover bg-center opacity-15" />

      <div className="relative z-10 h-full w-full px-5 pt-6 text-white">
        <h1 className="text-[28px] font-extrabold mb-6">Sign In</h1>

        <form className="space-y-5">
          <div>
            <label className="block text-[12px] mb-1 opacity-80">Email</label>
            <input
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40
                         focus:outline-none focus:border-white"
              placeholder="Enter Email here"
            />
          </div>

          <div>
            <label className="block text-[12px] mb-1 opacity-80">
              Password
            </label>
            <input
              type="password"
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40
                         focus:outline-none focus:border-white"
              placeholder="Enter Password here"
            />
          </div>

          <a
            href="/forgot-password"
            className="text-[12px] underline opacity-80"
          >
            Forgot your password?
          </a>

          <button className="w-full rounded-md bg-white text-black py-2 mt-2 font-bold">
            Login
          </button>
        </form>

        <p className="mt-8 text-center text-[12px]">
          Don’t have an account?{" "}
          <a href="/register" className="text-red-500 underline">
            Register here
          </a>
        </p>
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

"use client";
import { useEffect, useState } from "react";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";

export default function RegisterPage() {
  const [menuOpen, setMenuOpen] = useState(false);

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
    >
      <div className="absolute inset-0 bg-[url('/images/ball.png')] bg-cover bg-center opacity-15" />

      <div className="relative z-10 w-full px-5 pt-6 pb-8 text-white">
        <h1 className="text-[28px] font-extrabold mb-6">Sign Up</h1>

        <form className="space-y-5">
          <div>
            <label className="block text-[12px] mb-1 opacity-80">
              Full Name
            </label>
            <input
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40
                         focus:outline-none focus:border-white"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-[12px] mb-1 opacity-80">
              Username
            </label>
            <input
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40
                         focus:outline-none focus:border-white"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-[12px] mb-1 opacity-80">Email</label>
            <input
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40
                         focus:outline-none focus:border-white"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label className="block text-[12px] mb-1 opacity-80">
              Phone Number
            </label>
            <div className="flex items-center gap-2">
              <span className="px-2 py-2 rounded-md bg-white/10 border border-white/20 text-[12px]">
                +65
              </span>
              <input
                className="flex-1 bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40
                           focus:outline-none focus:border-white"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] mb-1 opacity-80">
              Create New Password
            </label>
            <input
              type="password"
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40
                         focus:outline-none focus:border-white"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-[12px] mb-1 opacity-80">
              Re-type New Password
            </label>
            <input
              type="password"
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40
                         focus:outline-none focus:border-white"
              placeholder="Confirm new password"
            />
          </div>

          <label className="flex items-start gap-2 text-[12px] leading-snug">
            <input type="checkbox" className="mt-0.5 accent-red-600" />
            <span>
              By creating an account, you agree on our{" "}
              <a href="/privacy-policy" className="underline">
                privacy policy
              </a>
              .
            </span>
          </label>

          <button className="w-full rounded-md bg-white text-black py-2 font-bold">
            Submit
          </button>
        </form>

        <p className="mt-6 text-center text-[12px]">
          Already have an account?{" "}
          <a href="/sign-in" className="text-red-500 underline">
            Login here
          </a>
        </p>
      </div>

      <OverlayMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={guestMenu}
      />
    </MobileShell>
  );
}

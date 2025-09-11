// src/app/(auth)/forgot-password/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";

const CONTENT_H = 590;

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
type FormInputs = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormInputs>({ resolver: zodResolver(schema), mode: "onChange" });

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

  const showToast = (msg: string, cb?: () => void) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
      cb?.();
    }, 1800);
  };

  const onSubmit: SubmitHandler<FormInputs> = async ({ email }) => {
    try {
      setSubmitting(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        { email: email.trim() }
      );
      showToast("Reset link sent to your email.", () =>
        router.push(`/check-email?email=${encodeURIComponent(email)}`)
      );
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : "Failed to send reset link. Try again.";
      showToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MobileShell
      header={<Header onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />}
      contentHeight={CONTENT_H}
    >
      {/* TOAST */}
      {toast && (
        <div className="fixed z-50 left-1/2 top-4 -translate-x-1/2">
          <div className="rounded-md bg-white text-black px-4 py-2 shadow-[0_10px_24px_rgba(0,0,0,.35)] font-semibold">
            {toast}
          </div>
        </div>
      )}

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
      <div className="relative z-10 h-full w-full px-5 text-white grid place-items-center">
        <div className="w-full max-w-[360px]">
          <h1 className="text-center text-[24px] font-extrabold tracking-wide mb-3">
            Forgot Password
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <label className="block">
              <div className="text-[12px] mb-1 opacity-80">Email</div>
              <input
                type="email"
                placeholder="Enter Email here"
                {...register("email")}
                className="w-full bg-transparent border-b border-white/40 px-0 py-3
                           placeholder-white/40 focus:outline-none focus:border-white"
              />
            </label>
            {errors.email && (
              <p className="text-red-500 text-xs -mt-3">
                {errors.email.message}
              </p>
            )}

            <button
              type="submit"
              disabled={!isValid || submitting}
              className={`w-full rounded-md py-3 font-bold transition
                ${
                  isValid && !submitting
                    ? "bg-white text-black"
                    : "bg-white/20 text-white/60 cursor-not-allowed"
                }`}
            >
              {submitting ? "SENDING..." : "SEND RESET LINK"}
            </button>
          </form>

          <div className="mt-6 text-center text-[12px]">
            Back to{" "}
            <Link href="/sign-in" className="text-red-500 underline">
              Login Page
            </Link>
          </div>
        </div>
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

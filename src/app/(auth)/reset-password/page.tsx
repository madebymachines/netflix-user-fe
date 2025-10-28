"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";

const hasLetter = /[A-Za-z]/;
const hasNumber = /\d/;
const hasSymbol = /[^A-Za-z0-9]/;

const formSchema = z
  .object({
    email: z.string().email("Enter a valid email").toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine((v) => hasLetter.test(v), {
        message: "Password must include at least one letter (A–Z or a–z)",
      })
      .refine((v) => hasNumber.test(v), {
        message: "Password must include at least one number (0–9)",
      })
      .refine((v) => hasSymbol.test(v), {
        message: "Password must include at least one symbol (e.g. !@#$%^&*)",
      }),
    confirmPassword: z.string(),
    otp: z
      .string()
      .min(6, "OTP must be 6 digits")
      .max(6, "OTP must be 6 digits")
      .regex(/^\d{6}$/, "OTP must be numeric (6 digits)"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Inputs = z.infer<typeof formSchema>;

export default function ResetPasswordPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds

  const router = useRouter();
  const search = useSearchParams();
  const emailFromQuery = search.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    getValues,
    trigger,
  } = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "", confirmPassword: "", otp: "" },
  });

  // Prefill & lock email if provided in query
  useEffect(() => {
    if (emailFromQuery) setValue("email", emailFromQuery);
  }, [emailFromQuery, setValue]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  // cooldown timer
  useEffect(() => {
    if (!cooldown) return;
    const t = setInterval(() => setCooldown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Watch password field and clear error messages when user types
  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");
  
  useEffect(() => {
    if (passwordValue || confirmPasswordValue) {
      setApiError(null);
      setApiSuccess(null);
    }
  }, [passwordValue, confirmPasswordValue]);

  const CONTENT_H = 590;

  const guestMenu = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Sign In", href: "/sign-in" },
      { label: "Leaderboard", href: "/leaderboard" },
    ],
    []
  );

  const onSubmit: SubmitHandler<Inputs> = async ({ email, otp, password }) => {
    setApiError(null);
    setApiSuccess(null);

    try {
      await axios.post("/api/v1/auth/reset-password", { email, otp, password });
      setApiSuccess("Password updated. Redirecting to Sign In…");
      reset();
      setTimeout(() => router.replace("/sign-in"), 1200);
    } catch (err) {
      const msg =
        (axios.isAxiosError(err) && (err.response?.data?.message as string)) ||
        "Failed to reset password. Please try again.";
      setApiError(msg);
    }
  };

  // Resend OTP without navigation
  const handleResend = async () => {
    setApiError(null);
    setApiSuccess(null);

    // Validate email field first
    const ok = await trigger("email");
    if (!ok) return;

    if (cooldown > 0) return;

    try {
      setResending(true);
      const email = getValues("email").trim().toLowerCase();
      await axios.post("/api/v1/auth/forgot-password", { email });
      setApiSuccess("A new OTP has been sent to your email.");
      setCooldown(60); // prevent spamming
    } catch (err) {
      const msg =
        (axios.isAxiosError(err) && (err.response?.data?.message as string)) ||
        "Failed to resend OTP. Please try again.";
      setApiError(msg);
    } finally {
      setResending(false);
    }
  };

  // Live checklist (same as Register)
  const pwd = watch("password", "");
  const policyOkLen = pwd.length >= 8;
  const policyOkLetter = hasLetter.test(pwd);
  const policyOkNumber = hasNumber.test(pwd);
  const policyOkSymbol = hasSymbol.test(pwd);

  return (
    <MobileShell
      header={<Header onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />}
      contentHeight={CONTENT_H}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[url('/images/ball.png')] bg-cover bg-center opacity-15" />

      {/* Content */}
      <div className="relative z-10 h-full w-full px-5 pt-6 text-white">
        <h1 className="text-[28px] font-extrabold mb-6">Reset Password</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-[12px] mb-1 opacity-80">Email</label>
            <input
              {...register("email")}
              type="email"
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40 focus:outline-none focus:border-white disabled:opacity-70"
              placeholder="name@email.com"
              autoComplete="email"
              disabled={!!emailFromQuery}
              readOnly={!!emailFromQuery}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-[12px] mb-1 opacity-80">
              New Password
            </label>
            <input
              {...register("password")}
              type="password"
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40 focus:outline-none focus:border-white"
              placeholder="At least 8 chars, letter, number & symbol"
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
            {/* Live checklist */}
            <ul className="mt-2 text-[11px] space-y-1">
              <li className={policyOkLen ? "text-green-400" : "text-white/70"}>
                {policyOkLen ? "✔" : "•"} At least 8 characters
              </li>
              <li
                className={policyOkLetter ? "text-green-400" : "text-white/70"}
              >
                {policyOkLetter ? "✔" : "•"} Contains a letter (A–Z / a–z)
              </li>
              <li
                className={policyOkNumber ? "text-green-400" : "text-white/70"}
              >
                {policyOkNumber ? "✔" : "•"} Contains a number (0–9)
              </li>
              <li
                className={policyOkSymbol ? "text-green-400" : "text-white/70"}
              >
                {policyOkSymbol ? "✔" : "•"} Contains a symbol (!@#$%^&*)
              </li>
            </ul>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-[12px] mb-1 opacity-80">
              Confirm New Password
            </label>
            <input
              {...register("confirmPassword")}
              type="password"
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40 focus:outline-none focus:border-white"
              placeholder="Re-type new password"
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* OTP (bottom) */}
          <div>
            <label className="block text-[12px] mb-1 opacity-80">
              OTP Code
            </label>
            <input
              {...register("otp")}
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40 focus:outline-none focus:border-white tracking-[0.3em]"
              placeholder="Enter the 6-digit code"
              onInput={(e) => {
                const t = e.currentTarget;
                t.value = t.value.replace(/\D/g, "").slice(0, 6);
              }}
            />
            {errors.otp && (
              <p className="text-red-500 text-xs mt-1">{errors.otp.message}</p>
            )}
            <div className="text-[12px] mt-2 opacity-80">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || cooldown > 0}
                className="underline text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending
                  ? "Sending..."
                  : cooldown > 0
                  ? `Resend (${cooldown}s)`
                  : "Resend"}
              </button>
            </div>
          </div>

          {/* Alerts - Positioned above button with proper spacing */}
          {(apiError || apiSuccess) && (
            <div className="!mt-4">
              {apiError && (
                <div className="text-center bg-red-500/20 border border-red-500 text-red-300 text-sm rounded-md p-2 mb-3">
                  {apiError}
                </div>
              )}
              {apiSuccess && (
                <div className="text-center bg-green-500/20 border border-green-500 text-green-300 text-sm rounded-md p-2 mb-3">
                  {apiSuccess}
                </div>
              )}
            </div>
          )}

          {/* Submit Button - Always visible at the bottom */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-white text-black py-2 !mt-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "SUBMIT"}
          </button>
        </form>
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
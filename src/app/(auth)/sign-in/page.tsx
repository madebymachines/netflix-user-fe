"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";
import api from "@/lib/axios";
import { isAxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/store/authStore";

// ===== Schemas & types =====
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type LoginFormInputs = z.infer<typeof loginSchema>;

type LoginResponse = { message: string; user: User };

type PurchaseStatus = "NOT_VERIFIED" | "PENDING" | "REJECTED" | "VERIFIED";
type PurchaseStatusResponse = {
  status: PurchaseStatus;
  reason?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
};

export default function SignInPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

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
    { label: "Leaderboard", href: "/leaderboard" },
  ];

  const onSubmit: SubmitHandler<LoginFormInputs> = async (payload) => {
    setApiError(null);
    try {
      const { data } = await api.post<LoginResponse>("/auth/login", payload);
      setUser(data.user);

      const { data: pv } = await api.get<PurchaseStatusResponse>(
        "/user/purchase-verification/status"
      );

      if (pv.status === "REJECTED") {
        const msg = encodeURIComponent(pv.reason ?? "");
        router.replace(`/verify-purchase?method=RECEIPT&rejected=1&msg=${msg}`);
      } else if (pv.status === "NOT_VERIFIED") {
        router.replace("/verify-purchase?method=RECEIPT");
      } else {
        router.replace("/dashboard");
      }
    } catch (err: unknown) {
      const msg = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message || err.message
        : "Login failed. Please check your credentials.";
      setApiError(msg);
    }
  };

  const CONTENT_H = 590;

  return (
    <MobileShell
      header={<Header onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />}
      contentHeight={CONTENT_H}
    >
      <div className="absolute inset-0 bg-[url('/images/ball.png')] bg-cover bg-center opacity-15" />

      <div className="relative z-10 h-full w-full px-5 pt-6 text-white">
        <h1 className="text-[28px] font-extrabold mb-6">Sign In</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-[12px] mb-1 opacity-80">Email</label>
            <input
              {...register("email")}
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40 focus:outline-none focus:border-white"
              placeholder="Enter Email here"
              inputMode="email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[12px] mb-1 opacity-80">
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40 focus:outline-none focus:border-white"
              placeholder="Enter Password here"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <a
            href="/forgot-password"
            className="text-[12px] underline opacity-80"
          >
            Forgot your password?
          </a>

          {apiError && (
            <div className="!mt-4 text-center bg-red-500/20 border border-red-500 text-red-300 text-sm rounded-md p-2">
              {apiError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-white text-black py-2 !mt-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Logging in..." : "Login"}
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

"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";

const formSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type Inputs = z.infer<typeof formSchema>;

export default function ResetPasswordPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  const router = useRouter();
  const search = useSearchParams();
  const token = search.get("token") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Inputs>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const CONTENT_H = 590;

  const guestMenu = [
    { label: "Home", href: "/" },
    { label: "Sign In", href: "/sign-in" },
    { label: "Leaderboard", href: "/leaderboard" },
  ];

  const onSubmit: SubmitHandler<Inputs> = async ({ password }) => {
    setApiError(null);
    setApiSuccess(null);

    if (!token) {
      setApiError("Invalid or missing reset token.");
      return;
    }

    try {
      await axios.post(
        "/api/v1/auth/reset-password",
        { password },
        { params: { token } }
      );

      setApiSuccess("Password has been reset. Redirecting to Sign In…");
      reset();
      setTimeout(() => router.replace("/sign-in"), 1200);
    } catch (err) {
      const msg =
        (axios.isAxiosError(err) && (err.response?.data?.message as string)) ||
        "Failed to reset password. Please try again.";
      setApiError(msg);
    }
  };

  return (
    <MobileShell
      header={<Header onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />}
      contentHeight={CONTENT_H}
    >
      {/* BG */}
      <div className="absolute inset-0 bg-[url('/images/ball.png')] bg-cover bg-center opacity-15" />

      {/* Posisi  */}
      <div className="relative z-10 h-full w-full px-5 pt-6 text-white">
        <h1 className="text-[28px] font-extrabold mb-6">Reset Password</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-[12px] mb-1 opacity-80">
              Create New Password
            </label>
            <input
              {...register("password")}
              type="password"
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40 focus:outline-none focus:border-white"
              placeholder="Enter new password"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[12px] mb-1 opacity-80">
              Re–type New Password
            </label>
            <input
              {...register("confirmPassword")}
              type="password"
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40 focus:outline-none focus:border-white"
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Alerts */}
          {apiError && (
            <div className="!mt-4 text-center bg-red-500/20 border border-red-500 text-red-300 text-sm rounded-md p-2">
              {apiError}
            </div>
          )}
          {apiSuccess && (
            <div className="!mt-4 text-center bg-green-500/20 border border-green-500 text-green-300 text-sm rounded-md p-2">
              {apiSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-white text-black py-2 !mt-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
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

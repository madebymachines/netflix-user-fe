"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type OtpFormInputs = z.infer<typeof otpSchema>;

interface ApiErrorResponse {
  message: string;
}

export default function VerifyOtpPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const CONTENT_H = 590;

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<OtpFormInputs>({
    resolver: zodResolver(otpSchema),
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

  const showToastThenRedirect = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
      router.push("/sign-in");
    }, 2000);
  };

  const onSubmit: SubmitHandler<OtpFormInputs> = async (data) => {
    if (!isValid) return;
    setApiError(null);
    try {
      await axios.post(process.env.NEXT_PUBLIC_API_URL + "/auth/verify-email", {
        email,
        otp: data.otp,
      });
      showToastThenRedirect("Verification successful! You can now log in.");
    } catch (error) {
      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        setApiError(error.response?.data?.message || "Verification failed");
      } else {
        setApiError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <MobileShell
      header={<Header onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />}
      contentHeight={CONTENT_H}
    >
      {toast && (
        <div className="fixed z-50 left-1/2 top-4 -translate-x-1/2">
          <div className="rounded-md bg-white text-black px-4 py-2 shadow-[0_10px_24px_rgba(0,0,0,.35)] font-semibold">
            {toast}
          </div>
        </div>
      )}

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <input
            {...register("otp")}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="Enter OTP here"
            className="w-full bg-transparent border-b border-white/40 px-0 py-3 placeholder-white/40
                       focus:outline-none focus:border-white text-[16px] tracking-[0.2em]"
          />
          {errors.otp && (
            <p className="text-red-500 text-xs mt-1">{errors.otp.message}</p>
          )}

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

          {apiError && (
            <div className="text-center bg-red-500/20 border border-red-500 text-red-300 text-sm rounded-md p-2">
              {apiError}
            </div>
          )}

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

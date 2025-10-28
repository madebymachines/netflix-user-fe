"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";

type JoiDetail = {
  message: string;
  path: string[] | string;
};

type ValidatorError = {
  message?: string;
  msg?: string;
  path?: string;
  param?: string;
  field?: string;
};

type FieldErr<T> = { path: keyof T; message: string };

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null;
}

function isJoiDetailArray(val: unknown): val is JoiDetail[] {
  return (
    Array.isArray(val) &&
    val.every((x) => isRecord(x) && typeof x.message === "string")
  );
}

function isValidatorErrArray(val: unknown): val is ValidatorError[] {
  return Array.isArray(val) && val.every((x) => isRecord(x));
}

const COUNTRY_CODE = "MY";

const hasLetter = /[A-Za-z]/;
const hasNumber = /\d/;
const hasSymbol = /[^A-Za-z0-9]/;

const registerSchema = z
  .object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .refine((v) => hasLetter.test(v), {
        message: "Password must contain at least one letter (A–Z or a–z)",
      })
      .refine((v) => hasNumber.test(v), {
        message: "Password must contain at least one number (0–9)",
      })
      .refine((v) => hasSymbol.test(v), {
        message: "Password must contain at least one symbol (e.g. !@#$%^&*)",
      }),
    confirmPassword: z.string(),
    agree: z.boolean().refine((val) => val === true, {
      message: "You must agree to the privacy policy",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormInputs = z.infer<typeof registerSchema>;

type PayloadWithDetails = { details: JoiDetail[] };
type PayloadWithErrors = { errors: ValidatorError[] };

function hasDetails(payload: unknown): payload is PayloadWithDetails {
  return (
    isRecord(payload) &&
    Array.isArray((payload as Record<string, unknown>).details)
  );
}

function hasErrors(payload: unknown): payload is PayloadWithErrors {
  return (
    isRecord(payload) &&
    Array.isArray((payload as Record<string, unknown>).errors)
  );
}

function extractServerErrors<TFields>(
  payload: unknown,
  mapKnown?: (msg: string) => Array<FieldErr<TFields>>
): { formMessage: string; fieldErrors: Array<FieldErr<TFields>> } {
  const result = {
    formMessage: "Registration failed",
    fieldErrors: [] as Array<FieldErr<TFields>>,
  };

  if (!payload) return result;
  if (typeof payload === "string") {
    result.formMessage = payload;
    if (mapKnown) result.fieldErrors.push(...mapKnown(payload));
    return result;
  }
  if (!isRecord(payload)) return result;

  const msg = typeof payload.message === "string" ? payload.message : undefined;
  if (msg) {
    result.formMessage = msg;
    if (mapKnown) result.fieldErrors.push(...mapKnown(msg));
  }

  if (hasDetails(payload) && isJoiDetailArray(payload.details)) {
    payload.details.forEach((e) => {
      const pathRaw = Array.isArray(e.path) ? e.path[0] : e.path;
      if (typeof pathRaw === "string") {
        result.fieldErrors.push({
          path: pathRaw as keyof TFields,
          message: e.message || "Invalid value",
        });
      }
    });
    if (!msg && payload.details.length) {
      result.formMessage = payload.details.map((x) => x.message).join(", ");
    }
  }

  if (hasErrors(payload) && isValidatorErrArray(payload.errors)) {
    payload.errors.forEach((e) => {
      const p = e.path || e.param || e.field;
      const m = e.msg || e.message || "Invalid value";
      if (p) {
        result.fieldErrors.push({
          path: p as keyof TFields,
          message: m,
        });
      }
    });
    if (!msg && payload.errors.length) {
      result.formMessage = payload.errors
        .map((x) => x.msg || x.message || "")
        .filter(Boolean)
        .join(", ");
    }
  }

  return result;
}

export default function RegisterPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  const API_BASE = "/api/v1";
  const DRAFT_KEY = "registerDraft:v1";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setError,
    reset,
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: { agree: false },
    mode: "onChange",
  });

  const agreeChecked = watch("agree", false);
  const pwd = watch("password", "");
  const confirmPwd = watch("confirmPassword", "");

  // Clear API error when user types in password fields
  useEffect(() => {
    if (pwd || confirmPwd) {
      setApiError(null);
    }
  }, [pwd, confirmPwd]);

  // Restore draft
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<RegisterFormInputs>;
        reset({ agree: false, ...draft });
      }
    } catch {}
  }, [reset]);

  // Save draft
  useEffect(() => {
    const sub = watch((value) => {
      const { username, email, password, confirmPassword, agree } =
        value as RegisterFormInputs;
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          username,
          email,
          password,
          confirmPassword,
          agree,
        })
      );
    });
    return () => sub.unsubscribe();
  }, [watch]);

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

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    setApiError(null);

    try {
      await axios.post(`${API_BASE}/auth/register`, {
        username: data.username,
        email: data.email,
        password: data.password,
        country: COUNTRY_CODE,
      });

      sessionStorage.removeItem(DRAFT_KEY);
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const ct = err.response?.headers?.["content-type"] as
          | string
          | undefined;
        const data = err.response?.data;
        const looksHtml =
          (typeof data === "string" && /<\s*html|<!doctype/i.test(data)) ||
          (ct && ct.includes("text/html"));

        if (looksHtml) {
          setApiError(
            `${err.response?.status || ""} ${
              err.response?.statusText || "Request failed"
            }`
          );
        } else {
          const { formMessage, fieldErrors } =
            extractServerErrors<RegisterFormInputs>(data, (m) => {
              const arr: Array<{
                path: keyof RegisterFormInputs;
                message: string;
              }> = [];
              if (m.includes("Email already taken"))
                arr.push({ path: "email", message: m });
              if (m.includes("Username already taken"))
                arr.push({ path: "username", message: m });
              return arr;
            });
          setApiError(formMessage);
          fieldErrors.forEach(({ path, message }) =>
            setError(path, { type: "server", message })
          );
        }
      } else {
        setApiError("Terjadi kesalahan tak terduga. Silakan coba lagi.");
      }
    }
  };

  const policyOkLen = pwd.length >= 8;
  const policyOkLetter = hasLetter.test(pwd);
  const policyOkNumber = hasNumber.test(pwd);
  const policyOkSymbol = hasSymbol.test(pwd);

  return (
    <MobileShell
      header={<Header onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />}
    >
      <div className="absolute inset-0 bg-[url('/images/ball.png')] bg-cover bg-center opacity-15" />

      <div className="relative z-10 w-full px-5 pt-6 pb-8 text-white">
        <h1 className="text-[28px] font-extrabold mb-6">Sign Up</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-[12px] mb-1 opacity-80">
              Username
            </label>
            <input
              {...register("username")}
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40 focus:outline-none focus:border-white"
              placeholder="Enter username"
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-[12px] mb-1 opacity-80">Email</label>
            <input
              {...register("email")}
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40 focus:outline-none focus:border-white"
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
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

            {/* Checklist live */}
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

          {/* Confirm Password */}
          <div>
            <label className="block text-[12px] mb-1 opacity-80">
              Re-type New Password
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

          {/* Agree */}
          <label className="flex items-start gap-2 text-[12px] leading-snug">
            <input
              {...register("agree")}
              type="checkbox"
              className="mt-0.5 accent-red-600"
            />
            <span>
              By creating an account, you agree on our{" "}
              <a href="/privacy-policy" className="underline">
                privacy policy
              </a>{" "}
              &{" "}
              <a href="/t&c" className="underline">
                T&amp;C
              </a>
            </span>
          </label>
          {errors.agree && (
            <p className="text-red-500 text-xs -mt-4">{errors.agree.message}</p>
          )}

          {/* Error API - Positioned above button */}
          {apiError && (
            <div className="!mt-4 mb-3 text-center bg-red-500/20 border border-red-500 text-red-300 text-sm rounded-md p-2">
              {apiError}
            </div>
          )}

          {/* Submit Button - Always visible at the bottom */}
          <button
            type="submit"
            disabled={!agreeChecked || isSubmitting}
            className="w-full rounded-md bg-white text-black py-2 !mt-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
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
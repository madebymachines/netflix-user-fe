"use client";

import { useEffect, useMemo, useState } from "react";
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

const COUNTRIES = [{ code: "MY", label: "Malaysia" }];
const COUNTRY_DIAL: Record<string, string> = { MY: "+60" };
const DEFAULT_CODE = "MY";
const codeToLabel = (code?: string | null) =>
  COUNTRIES.find((c) => c.code === (code || "").toUpperCase())?.label;

const normalizeNumber = (raw?: string) => {
  const digits = String(raw || "").replace(/\D+/g, "");
  return digits.replace(/^0+/, "");
};

const registerSchema = z
  .object({
    name: z.string().min(1, "Full Name is required"),
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    gender: z.enum(["MALE", "FEMALE"]),
    phoneNumber: z
      .string()
      .regex(/^\d{7,9}$/, "Phone number must be 7–9 digits")
      .optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    agree: z.boolean().refine((val) => val === true, {
      message: "You must agree to the privacy policy",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormInputs = z.infer<typeof registerSchema>;

function extractServerErrors<TFields>(
  payload: unknown,
  mapKnown?: (msg: string) => Array<FieldErr<TFields>>
): { formMessage: string; fieldErrors: Array<FieldErr<TFields>> } {
  const result = {
    formMessage: "Registration failed",
    fieldErrors: [] as Array<FieldErr<TFields>>,
  };

  if (!payload) return result;

  // string payload
  if (typeof payload === "string") {
    result.formMessage = payload;
    if (mapKnown) result.fieldErrors.push(...mapKnown(payload));
    return result;
  }

  if (!isRecord(payload)) return result;

  // generic message
  const msg = typeof payload.message === "string" ? payload.message : undefined;
  if (msg) {
    result.formMessage = msg;
    if (mapKnown) result.fieldErrors.push(...mapKnown(msg));
  }

  // Joi / Celebrate
  if (isJoiDetailArray(payload.details)) {
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

  // express-validator style
  if (isValidatorErrArray(payload.errors)) {
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
  const [country, setCountry] = useState<string | null>(null);
  const router = useRouter();

  const API_BASE = "/api/v1";

  useEffect(() => {
    try {
      const c = (localStorage.getItem("guestRegion") || "").toUpperCase();
      setCountry(c || null);
    } catch {
      setCountry(null);
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setError,
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: { agree: false, gender: "MALE" },
    mode: "onChange",
  });

  const agreeChecked = watch("agree", false);

  const usingCountryLabel = useMemo(() => {
    const label = codeToLabel(country);
    if (label) return label;
    return codeToLabel(DEFAULT_CODE) || DEFAULT_CODE;
  }, [country]);

  const dialCode = useMemo(() => {
    const c = (country || DEFAULT_CODE).toUpperCase();
    return COUNTRY_DIAL[c] || COUNTRY_DIAL[DEFAULT_CODE];
  }, [country]);

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
    const countryCode = (country || DEFAULT_CODE).toUpperCase();

    try {
      await axios.post(`${API_BASE}/auth/register`, {
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        gender: data.gender,
        phoneNumber: data.phoneNumber
          ? `${dialCode}${normalizeNumber(data.phoneNumber)}`
          : undefined,
        country: countryCode,
      });

      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // aman kalau server balas HTML 404 dari FE
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
  return (
    <MobileShell
      header={<Header onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />}
    >
      <div className="absolute inset-0 bg-[url('/images/ball.png')] bg-cover bg-center opacity-15" />

      <div className="relative z-10 w-full px-5 pt-6 pb-8 text-white">
        <h1 className="text-[28px] font-extrabold mb-6">Sign Up</h1>

        <div className="mb-4 text-[12px] text-white/80">
          Using country:{" "}
          <span className="font-semibold">
            {usingCountryLabel}
            {!country ? " (default)" : ""}
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-[12px] mb-1 opacity-80">
              Full Name
            </label>
            <input
              {...register("name")}
              className="w-full bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40 focus:outline-none focus:border-white"
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

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

          {/* Gender */}
          <div>
            <label className="block text-[12px] mb-1 opacity-80">Gender</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 border-b border-white/40 pb-2">
                <input
                  type="radio"
                  value="MALE"
                  {...register("gender")}
                  className="h-4 w-4 accent-red-600"
                />
                <span>Male</span>
              </label>
              <label className="flex items-center gap-2 border-b border-white/40 pb-2">
                <input
                  type="radio"
                  value="FEMALE"
                  {...register("gender")}
                  className="h-4 w-4 accent-red-600"
                />
                <span>Female</span>
              </label>
            </div>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">
                {errors.gender.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[12px] mb-1 opacity-80">
              Phone Number
            </label>
            <div className="flex items-center gap-2">
              <span className="px-2 py-2 rounded-md bg-white/10 border border-white/20 text-[12px] select-none">
                {dialCode}
              </span>
              <input
                {...register("phoneNumber")}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={9}
                className="flex-1 bg-transparent border-b border-white/40 px-0 py-2 placeholder-white/40 focus:outline-none focus:border-white"
                placeholder="Enter your phone number"
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phoneNumber.message}
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
              </a>
              .
            </span>
          </label>
          {errors.agree && (
            <p className="text-red-500 text-xs -mt-4">{errors.agree.message}</p>
          )}

          {/* Error API */}
          {apiError && (
            <div className="text-center bg-red-500/20 border border-red-500 text-red-300 text-sm rounded-md p-2">
              {apiError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!agreeChecked || isSubmitting}
            className="w-full rounded-md bg-white text-black py-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
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

"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";
import { Pencil } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";

type FormState = {
  fullName: string;
  username: string;
  email: string;
  phone: string;
};

const CONTENT_H = 590;

export default function ProfilePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoading, setUser } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize form with user data from auth store
  const getInitialFormState = (): FormState => ({
    fullName: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
  });

  const [form, setForm] = useState<FormState>(getInitialFormState());
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setForm(getInitialFormState());
    }
  }, [user]);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const onPickAvatar = () => fileRef.current?.click();
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAvatarUrl((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
  };

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const onCancel = () => setForm(getInitialFormState());

  const onUpdate = async () => {
    if (!user) return;

    // Basic validation
    if (!form.fullName.trim()) {
      alert("Full name is required");
      return;
    }
    if (!form.username.trim()) {
      alert("Username is required");
      return;
    }
    if (!form.email.trim()) {
      alert("Email is required");
      return;
    }

    setIsUpdating(true);
    try {
      // Prepare update data
      const updateData = {
        name: form.fullName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phoneNumber: form.phone.trim() || undefined,
      };

      // Send update request to backend
      const response = await api.put(`/users/${user.id}`, updateData);

      // Update user data in auth store
      setUser(response.data);

      alert("Profile updated successfully!");
    } catch (error: any) {
      console.error("Update profile error:", error);
      alert(
        error.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const authMenu = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Profile", href: "/profile" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Logout", onClick: () => alert("Logout…") },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <MobileShell
      header={<Header onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />}
      contentHeight={CONTENT_H}
    >
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
        <div className="absolute inset-0 bg-black/15" />
      </div>

      <div className="relative z-10 h-full w-full px-5 pt-4 text-white">
        <h1 className="font-heading text-[28px] tracking-[.02em] mb-3">
          Profile
        </h1>

        <div className="w-full flex justify-center mb-4">
          <div className="relative">
            <div className="h-[120px] w-[120px] rounded-lg overflow-hidden ring-1 ring-white/20 bg-black/30">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  fill
                  sizes="120px"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <Image
                  src="/images/bottle.png"
                  alt="Avatar"
                  fill
                  sizes="120px"
                  style={{ objectFit: "cover" }}
                  className="opacity-80"
                />
              )}
            </div>

            <button
              onClick={onPickAvatar}
              className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-red-500 grid place-items-center ring-2 ring-black/40"
              aria-label="Change avatar"
            >
              <Pencil className="w-4 h-4 text-white" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={onFile}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Field
            label="Full Name"
            value={form.fullName}
            onChange={(v) => setForm((s) => ({ ...s, fullName: v }))}
            required
          />
          <Field
            label="Username"
            value={form.username}
            onChange={(v) => setForm((s) => ({ ...s, username: v }))}
            required
          />
          <Field
            label="Email"
            value={form.email}
            onChange={(v) => setForm((s) => ({ ...s, email: v }))}
            type="email"
            required
          />
          <Field
            label="Phone Number"
            value={form.phone}
            onChange={(v) => setForm((s) => ({ ...s, phone: v }))}
            placeholder="Optional"
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={onCancel}
            className="h-[48px] rounded-md border border-white/30 text-white font-heading tracking-[.02em]"
          >
            CANCEL
          </button>
          <button
            onClick={onUpdate}
            disabled={isUpdating}
            className="h-[48px] rounded-md bg-white text-black font-heading tracking-[.02em] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? "UPDATING..." : "UPDATE"}
          </button>
        </div>
      </div>

      <OverlayMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={authMenu}
        contentHeight={CONTENT_H}
      />
    </MobileShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="text-[12px] mb-1 opacity-80">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-b border-white/30 px-0 py-2 placeholder-white/40
                   focus:outline-none focus:border-white text-[14px]"
        placeholder={placeholder || label}
        required={required}
      />
    </label>
  );
}

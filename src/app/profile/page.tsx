"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";
import { Pencil } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/axios";
import { isAxiosError } from "axios";

type FormState = {
  fullName: string;
  username: string;
  email: string;
  phone: string;
};

const CONTENT_H = 590;

export default function ProfilePage() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoading, checkAuth } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);

  // ==== Toast ====
  const [toast, setToast] = useState<string | null>(null);
  const showToastThenDashboard = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
      router.push("/dashboard");
    }, 2000);
  };

  // ==== Avatar state ====
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(""); // preview (blob)
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // ==== Form state ====
  const initialFormState = useMemo<FormState>(
    () => ({
      fullName: user?.name ?? "",
      username: user?.username ?? "",
      email: user?.email ?? "",
      phone: user?.phoneNumber ?? "",
    }),
    [user]
  );
  const [form, setForm] = useState<FormState>(initialFormState);
  useEffect(() => setForm(initialFormState), [initialFormState]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    return () => {
      if (avatarUrl && avatarUrl.startsWith("blob:"))
        URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  const onPickAvatar = () => fileRef.current?.click();

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) {
      alert("File harus berupa gambar");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      alert("Maksimal ukuran 5MB");
      return;
    }
    const url = URL.createObjectURL(f);
    setAvatarFile(f);
    setAvatarUrl((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
  };

  const uploadAvatar = async () => {
    if (!avatarFile) {
      alert("Pilih gambar terlebih dahulu");
      return;
    }
    try {
      setIsUploadingPhoto(true);
      const fd = new FormData();
      fd.append("profilePicture", avatarFile);

      await api.post("/user/me/profile-picture", fd);

      await checkAuth();
      showToastThenDashboard("Profile picture updated!");
      setAvatarFile(null);
      if (avatarUrl.startsWith("blob:")) URL.revokeObjectURL(avatarUrl);
      setAvatarUrl("");
    } catch (err: unknown) {
      const msg = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message || err.message
        : "Gagal upload foto.";
      console.error(err);
      alert(msg);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const onCancel = () => {
    router.push("/dashboard");
  };

  const onUpdate = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      const payload = {
        name: form.fullName.trim(),
        username: form.username.trim(),
        phoneNumber: form.phone.trim() || undefined,
      };
      await api.put("/user/me", payload);
      await checkAuth();
      showToastThenDashboard("Profile updated successfully!");
    } catch (error: unknown) {
      const msg = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || error.message
        : "Failed to update profile.";
      alert(msg);
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

  const isBlobPreview = avatarUrl.startsWith("blob:");

  return (
    <MobileShell
      header={<Header onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />}
      contentHeight={CONTENT_H}
    >
      {/* Toast */}
      {toast && (
        <div className="fixed z-50 left-1/2 top-4 -translate-x-1/2">
          <div className="rounded-md bg-white text-black px-4 py-2 shadow-[0_10px_24px_rgba(0,0,0,.35)] font-semibold">
            {toast}
          </div>
        </div>
      )}

      {/* BG */}
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

        {/* Avatar */}
        <div className="w-full flex flex-col items-center gap-3 mb-4">
          <div className="relative">
            <div className="h-[120px] w-[120px] rounded-lg overflow-hidden ring-1 ring-white/20 bg-black/30 relative">
              {isBlobPreview ? (
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={user?.profilePictureUrl || "/images/bottle.png"}
                  alt="Avatar"
                  fill
                  sizes="120px"
                  style={{ objectFit: "cover" }}
                  className={!user?.profilePictureUrl ? "opacity-80" : ""}
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

          {avatarFile && (
            <button
              onClick={uploadAvatar}
              disabled={isUploadingPhoto}
              className="h-[36px] px-4 rounded-md bg-white text-black font-heading tracking-[.02em] disabled:opacity-50"
            >
              {isUploadingPhoto ? "UPLOADING..." : "SAVE PHOTO"}
            </button>
          )}
        </div>

        {/* Form */}
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
            disabled
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
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
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
        disabled={disabled}
        className={`w-full bg-transparent border-b border-white/30 px-0 py-2 placeholder-white/40
                    focus:outline-none focus:border-white text-[14px]
                    ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        placeholder={placeholder || label}
        required={required}
      />
    </label>
  );
}

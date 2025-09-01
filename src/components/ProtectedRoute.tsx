"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

type Mode = "auth" | "guest";

interface Props {
  children: React.ReactNode;
  /** 'auth' = harus login, 'guest' = harus belum login */
  require: Mode;
  /** kemana redirect saat kondisi tidak memenuhi */
  redirect: string; // contoh: '/sign-in' utk auth, '/dashboard' utk guest
}

export default function ProtectedRoute({ children, require, redirect }: Props) {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();

  // Sinkronkan status login saat mount/refresh.
  // NOTE: untuk guest -> jangan refresh token. untuk auth -> boleh.
  useEffect(() => {
    checkAuth({ allowRefresh: require === "auth" });
    // kita sengaja hanya bergantung pada 'require' supaya dipanggil sekali
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [require]);

  useEffect(() => {
    if (isLoading) return;

    if (require === "auth") {
      // halaman privat: kalau belum login → ke sign-in (atau redirect yg diberikan)
      if (!isAuthenticated) router.replace(redirect);
    } else {
      // halaman guest: kalau sudah login → ke dashboard (atau redirect yg diberikan)
      if (isAuthenticated) router.replace(redirect);
    }
  }, [require, redirect, isAuthenticated, isLoading, router]);

  // sembunyikan konten ketika loading atau kondisi belum terpenuhi (hindari flicker)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-black text-white">
        Loading...
      </div>
    );
  }
  if (require === "auth" && !isAuthenticated) return null;
  if (require === "guest" && isAuthenticated) return null;

  return <>{children}</>;
}

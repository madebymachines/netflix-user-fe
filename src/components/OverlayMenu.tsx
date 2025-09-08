"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Header from "./Header";
import { useAuthStore } from "@/store/authStore";

type MenuItem = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export default function OverlayMenu({
  open,
  onClose,
  items,
  contentHeight = 590,
}: {
  open: boolean;
  onClose: () => void;
  items: MenuItem[];
  contentHeight?: number;
}) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    router.push("/sign-in"); // Redirect setelah logout
  };

  if (!open) return null;

  return (
    <div
      className="absolute left-0 z-[80] w-full"
      style={{ top: -50, height: 50 + contentHeight }}
    >
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />

      <div className="relative z-10">
        <Header onMenu={onClose} menuOpen className="bg-white" />

        <nav className="px-5 pt-6 space-y-6">
          {items.map((it, i) => {
            // Khusus untuk item "Logout", kita override onClick-nya
            if (it.label === "Logout") {
              return (
                <button
                  key={i}
                  onClick={handleLogout}
                  className="block w-full text-left text-[20px] font-semibold text-white"
                >
                  {it.label}
                </button>
              );
            }

            return it.href ? (
              <Link
                key={i}
                href={it.href}
                onClick={onClose}
                className={`block text-[20px] font-semibold ${
                  isActive(it.href) ? "text-red-500" : "text-white"
                }`}
              >
                {it.label}
              </Link>
            ) : (
              <button
                key={i}
                onClick={() => {
                  it.onClick?.();
                  onClose();
                }}
                className="block w-full text-left text-[20px] font-semibold text-white"
              >
                {it.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

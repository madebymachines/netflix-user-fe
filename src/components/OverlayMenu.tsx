"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "./Header";

type MenuItem = {
  label: string;
  href?: string; // route ("/", "/sign-in", dst)
  onClick?: () => void; // aksi (mis. logout)
};

export default function OverlayMenu({
  open,
  onClose,
  items,
  contentHeight = 590, // tinggi area konten (header selalu 50)
}: {
  open: boolean;
  onClose: () => void;
  items: MenuItem[];
  contentHeight?: number;
}) {
  const pathname = usePathname() || "/";

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  if (!open) return null;

  return (
    // Menutup full stage: geser -50px supaya menutupi header asli
    <div
      className="absolute left-0 z-[80] w-[360px]"
      style={{ top: -50, height: 50 + contentHeight }}
    >
      {/* backdrop — klik di luar menutup */}
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />

      {/* isi (JANGAN pakai pointer-events-none di wrapper ini) */}
      <div className="relative z-10">
        {/* Header dengan tombol X yang memanggil onClose */}
        <Header onMenu={onClose} menuOpen className="bg-white" />

        <nav className="px-5 pt-6 space-y-6">
          {items.map((it, i) =>
            it.href ? (
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
            )
          )}
        </nav>
      </div>
    </div>
  );
}

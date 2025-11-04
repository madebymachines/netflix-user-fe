"use client";
import Image from "next/image";
import { Menu, ArrowLeft, X } from "lucide-react";

type Props = {
  logoSrc?: string;
  onBack?: () => void;
  onMenu?: () => void;
  menuOpen?: boolean;
  rightSlot?: React.ReactNode;
  className?: string;
  sticky?: boolean;
  fixed?: boolean;
};

export default function Header({
  logoSrc = "/images/logo.png",
  onBack,
  onMenu,
  menuOpen = false,
  rightSlot,
  className = "",
  sticky = true,
  fixed = false,
}: Props) {
  return (
    <header
      className={[
        fixed
          ? "fixed top-0 left-0 right-0 z-40"
          : sticky
          ? "sticky top-0 z-40"
          : "relative z-40",
        "bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40",
        "border-b border-white/10",
        "w-full h-[50px] flex items-center justify-between",
        "px-[clamp(12px,4vw,20px)]",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        {onBack ? (
          <button
            aria-label="Back"
            onClick={(e) => {
              e.stopPropagation();
              onBack?.();
            }}
            className="mr-1 p-1 -ml-1"
          >
            {/* putih supaya kontras di bg gelap */}
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
        ) : null}

        {/* Logo responsive: tinggi tetap, lebar mengikuti */}
        <Image
          src={logoSrc}
          alt="Logo"
          width={96}
          height={32}
          priority
          className="h-8 w-auto"
          sizes="100vw"
        />
      </div>

      <div className="flex items-center gap-2">
        {rightSlot}
        <button
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={(e) => {
            e.stopPropagation();
            onMenu?.();
          }}
          className="p-2 -mr-1"
        >
          {menuOpen ? (
            <X className="w-7 h-7 text-white" />
          ) : (
            <Menu className="w-7 h-7 text-white" />
          )}
        </button>
      </div>
    </header>
  );
}

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
};

export default function Header({
  logoSrc = "/images/logo.png",
  onBack,
  onMenu,
  menuOpen = false,
  rightSlot,
  className = "",
}: Props) {
  return (
    <header
      className={`w-[360px] h-[50px] bg-white/98 flex items-center justify-between px-3 ${className}`}
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
            <ArrowLeft className="w-6 h-6 text-black" />
          </button>
        ) : null}
        <Image src={logoSrc} alt="Logo" width={48} height={32} priority />
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
            <X className="w-7 h-7 text-black" />
          ) : (
            <Menu className="w-7 h-7 text-black" />
          )}
        </button>
      </div>
    </header>
  );
}

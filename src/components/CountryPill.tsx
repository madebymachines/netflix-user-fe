"use client";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Option = { code: string; label: string };

export default function CountryPill({
  value,
  onChange,
  options,
  placeholder = "Select Country",
}: {
  value: string | null;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const label = options.find((o) => o.code === value)?.label ?? placeholder;

  return (
    <div ref={ref} className="relative z-[60]">
      <button
        onClick={() => setOpen((s) => !s)}
        className="h-8 min-w-[200px] rounded-full border border-white/30
                   px-3 pr-2 flex items-center gap-2 bg-black/90 text-white
                   shadow-[0_8px_24px_rgba(0,0,0,.45)]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className={`w-4 h-4 ${value ? "text-white" : "text-red-500"}`} />
        <span className="text-[14px] font-semibold tracking-wide line-clamp-1">
          {label}
        </span>
        <ChevronDown className="w-4 h-4 ml-auto" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 mt-2 w-full rounded-xl border border-white/20
                     bg-black/95 text-white max-h-56 overflow-auto"
        >
          {options.map((o) => {
            const active = o.code === value;
            return (
              <li
                key={o.code}
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(o.code);
                  setOpen(false);
                }}
                className="px-3 py-2 flex items-center gap-2 text-[14px] hover:bg-white/10 cursor-pointer"
              >
                <span className="flex-1">{o.label}</span>
                {active && <Check className="w-4 h-4" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

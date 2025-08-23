"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";
import { Upload, Trash2, AlertTriangle } from "lucide-react";

export default function VerifyPurchasePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const CONTENT_H = 590;

  const sp = useSearchParams();
  const rejected = sp.get("rejected") === "1";
  const rejectMsg = sp.get("msg") || "";

  const title = rejected ? "Re-Verify Your Purchase!" : "Verify Your Purchase!";
  const desc = rejected
    ? "We apologize, your proof of purchase did not pass verification, please re-upload with a valid image."
    : "To continue, please upload full receipt / proof of purchase of 100 Plus Drink below.";

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
    { label: "Register", href: "/register" },
  ];

  const openPicker = () => inputRef.current?.click();

  const handleFiles = (files?: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];

    const isImage = /^image\//.test(f.type);
    const under10MB = f.size <= 10 * 1024 * 1024;
    if (!isImage) return setError("File harus berupa gambar (JPG/PNG/HEIC).");
    if (!under10MB) return setError("Ukuran maksimum 10MB.");

    const url = URL.createObjectURL(f);
    setError(null);
    setFile(f);
    setPreview(url);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

  const onSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    if (!file) return;
    // TODO: upload ke server
    alert(`Submit receipt: ${file.name}`);
  };

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
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <form
        onSubmit={onSubmit}
        className="relative z-10 h-full w-full px-5 pt-6 text-white"
      >
        <h1 className="text-center text-[24px] font-extrabold tracking-wide mb-3">
          {title}
        </h1>
        <p className="text-center text-[12px] leading-snug opacity-90 mb-4">
          {desc}
        </p>

        {rejected && (
          <div className="mx-auto mb-4 flex items-start gap-2 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-[12px] text-red-300 max-w-[320px]">
            <AlertTriangle className="mt-[2px] h-4 w-4" />
            <span>{rejectMsg || "Reason: invalid or unreadable receipt."}</span>
          </div>
        )}

        <div
          onClick={openPicker}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`relative mx-auto w-full max-w-[320px] h-[320px] rounded-lg border-2
                      ${
                        preview
                          ? "border-white/20"
                          : "border-white/60 border-dashed"
                      }
                      bg-black/20 flex items-center justify-center overflow-hidden`}
        >
          {!preview ? (
            <div className="flex flex-col items-center gap-3 pointer-events-none">
              <Upload className="w-8 h-8 opacity-80" />
              <span className="text-[13px] opacity-90">
                Upload Receipt Here
              </span>
            </div>
          ) : (
            <>
              <img
                src={preview}
                alt="Receipt preview"
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="absolute top-2 right-2 h-9 w-9 grid place-items-center rounded-full bg-red-600"
                aria-label="Remove file"
              >
                <Trash2 className="w-5 h-5 text-white" />
              </button>
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {error && (
          <p className="text-center text-[12px] text-red-400 mt-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={!file}
          className={`mx-auto mt-6 block w-full max-w-[320px] rounded-md py-3 font-bold transition
            ${
              file
                ? "bg-white text-black"
                : "bg-white/20 text-white/60 cursor-not-allowed"
            }`}
        >
          Submit
        </button>
      </form>

      <OverlayMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={guestMenu}
        contentHeight={CONTENT_H}
      />
    </MobileShell>
  );
}

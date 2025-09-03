/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";
import { Upload, Trash2, AlertTriangle } from "lucide-react";
import api from "@/lib/axios";
import { isAxiosError } from "axios";

type Method = "RECEIPT" | "MEMBER_GYM";

export default function VerifyPurchasePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [method, setMethod] = useState<Method>("RECEIPT");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const CONTENT_H = 590;

  const sp = useSearchParams();
  const rejected = sp.get("rejected") === "1";
  const rejectMsg = sp.get("msg") || "";

  useEffect(() => {
    const m = (sp.get("method") as Method) || "RECEIPT";
    setMethod(m);
    clearFile();
  }, [sp]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const authMenu = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Profile", href: "/profile" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Logout", onClick: () => alert("Logout…") },
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
    setPreview((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const clearFile = () => {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
  };

  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (!file || submitting) return;

    try {
      setSubmitting(true);
      setError(null);

      const fd = new FormData();
      fd.append("receiptImage", file);
      fd.append("type", method);

      await api.post("/user/purchase-verification", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      router.replace("/dashboard");
    } catch (err: unknown) {
      const msg = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message || err.message
        : "Failed to upload image.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Text sesuai mode =====
  const title =
    method === "RECEIPT"
      ? rejected
        ? "Re-Verify Your Purchase!"
        : "Verify Your Purchase!"
      : "Verify Your Membership!";

  const desc =
    method === "RECEIPT"
      ? rejected
        ? "We apologize, your proof of purchase did not pass verification, please re-upload with a valid image."
        : "To continue, please upload full receipt / proof of purchase of 100 Plus Drink below."
      : "To continue, please upload a photo of the front of your gym membership card.";

  const uploadLabel =
    method === "RECEIPT" ? "Upload Receipt Here" : "Upload Card Photo Here";

  // === Dropzone yang adaptif ===
  // Base maksimal berbeda per mode; saat RE-VERIFY kita kecilkan sedikit.
  const baseMaxH =
    method === "MEMBER_GYM" ? (rejected ? 240 : 277) : rejected ? 280 : 320;

  // Tinggi final: minimal 220px, mengisi sisa ruang, tapi tidak lebih dari baseMaxH.
  const dropzoneStyle: React.CSSProperties = {
    height: `clamp(220px, 100%, ${baseMaxH}px)`,
  };

  return (
    <MobileShell
      header={<Header onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />}
      contentHeight={CONTENT_H}
    >
      {/* Background */}
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

      {/* Content */}
      <form
        onSubmit={onSubmit}
        className="relative z-10 h-full w-full px-5 pt-5 pb-6 text-white flex flex-col"
      >
        <p className="mb-3 text-center text-[11px] opacity-80">
          Choose Method to Verified Your Account!
        </p>

        {/* Toggle buttons */}
        <div className="mx-auto mb-5 flex w-full max-w-[320px] gap-2">
          <button
            type="button"
            onClick={() => {
              setMethod("RECEIPT");
              clearFile();
            }}
            className={[
              "flex-1 rounded-md px-3 py-2 text-[12px] font-extrabold tracking-wide transition",
              method === "RECEIPT"
                ? "bg-white text-black shadow"
                : "border border-white/60 text-white",
            ].join(" ")}
          >
            PRODUCT PURCHASE
          </button>
          <button
            type="button"
            onClick={() => {
              setMethod("MEMBER_GYM");
              clearFile();
            }}
            className={[
              "flex-1 rounded-md px-3 py-2 text-[12px] font-extrabold tracking-wide transition",
              method === "MEMBER_GYM"
                ? "bg-white text-black shadow"
                : "border border-white/60 text-white",
            ].join(" ")}
          >
            GYM MEMBER
          </button>
        </div>

        {/* Title & description */}
        <h1 className="mb-2 text-center text-[24px] font-extrabold tracking-wide">
          {title}
        </h1>
        <p className="mb-4 text-center text-[12px] leading-snug opacity-90">
          {desc}
        </p>

        {/* Rejected reason */}
        {rejected && (
          <div className="mx-auto mb-3 flex max-w-[320px] items-start gap-2 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
            <AlertTriangle className="mt-[2px] h-4 w-4" />
            <span>{rejectMsg || "Reason: invalid or unreadable receipt."}</span>
          </div>
        )}

        {/* Dropzone container mengambil sisa ruang */}
        <div className="flex-1 flex items-stretch">
          <div
            onClick={openPicker}
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className={[
              "relative mx-auto flex w-full max-w-[320px] items-center justify-center overflow-hidden rounded-lg border-2 bg-black/20",
              preview ? "border-white/20" : "border-white/60 border-dashed",
            ].join(" ")}
            style={dropzoneStyle}
          >
            {!preview ? (
              <div className="pointer-events-none flex flex-col items-center gap-3">
                <Upload className="h-8 w-8 opacity-80" />
                <span className="text-[13px] opacity-90">{uploadLabel}</span>
              </div>
            ) : (
              <>
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-contain"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-red-600"
                  aria-label="Remove file"
                >
                  <Trash2 className="h-5 w-5 text-white" />
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
        </div>

        {method === "MEMBER_GYM" && (
          <>
            <div className="mx-auto mt-4 h-px w-[85%] max-w-[340px] bg-white/20" />
            <p className="mx-auto mt-2 max-w-[320px] text-center text-[12px] opacity-90">
              This verification is only for member of{" "}
              <span className="font-extrabold">Fitness Verse</span>
            </p>
          </>
        )}

        {/* Error */}
        {error && (
          <p className="mt-2 text-center text-[12px] text-red-400">{error}</p>
        )}

        {/* Submit (selalu muat di bawah) */}
        <button
          type="submit"
          disabled={!file || submitting}
          className={[
            "mt-4 mx-auto block w-full max-w-[320px] rounded-md py-3 text-[13px] font-extrabold tracking-wide transition",
            !file || submitting
              ? "cursor-not-allowed bg-white/20 text-white/60"
              : "bg-white text-black",
          ].join(" ")}
        >
          {submitting ? "UPLOADING…" : "SUBMIT"}
        </button>
      </form>

      <OverlayMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={authMenu}
        contentHeight={CONTENT_H}
      />
    </MobileShell>
  );
}

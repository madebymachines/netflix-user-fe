"use client";
import Image from "next/image";

export default function DesktopGate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Hanya tampil di mobile */}
      <div className="block md:hidden">{children}</div>

      {/* Overlay desktop */}
      <div className="hidden md:flex min-h-screen w-full bg-black items-center justify-center text-white relative overflow-hidden">
        {/* Background */}
        <Image
          src="/images/ball2.png"
          alt=""
          fill
          sizes="100vw"
          priority
          style={{ objectFit: "cover" }}
          className="opacity-50"
        />
        <div className="absolute inset-0 bg-black/50" />

        {/* Konten tengah */}
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <Image
            src="/images/logo2.png"
            alt="UNLOCK YOUR 100"
            width={220}
            height={80}
            priority
          />

          <div className="rounded-md bg-white p-2 shadow-lg">
            <Image
              src="/images/barcode.png"
              alt="QR Code"
              width={220}
              height={220}
              priority
            />
          </div>

          <div className="uppercase tracking-widest text-[10px] bg-white text-black px-3 py-1 rounded-sm">
            Scan from mobile
          </div>

          <p className="max-w-[640px] leading-snug opacity-80 text-sm">
            The UNLOCK YOUR 100 experience is only accessible through mobile.
            <br />
            Please switch your device to get the best experience.
          </p>
        </div>
      </div>
    </>
  );
}

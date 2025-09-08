import Image from "next/image";
import { headers } from "next/headers";

type Props = { children: React.ReactNode };

function isDesktopUA(ua: string) {
  const s = ua.toLowerCase();
  const isMobileLike =
    /iphone|ipod|android|blackberry|bb10|mini|windows\sce|palm|opera mobi|mobile/.test(
      s
    );
  const isTabletLike =
    /ipad|tablet|kindle|silk|playbook|nexus 7|nexus 9|sm\-t|tab/.test(s);
  return !(isMobileLike || isTabletLike);
}

export default async function DesktopGate({ children }: Props) {
  const h = await headers();
  const ua = h.get("user-agent") ?? "";
  const isDesktop = isDesktopUA(ua);

  if (!isDesktop) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-hidden flex items-center justify-center">
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
  );
}

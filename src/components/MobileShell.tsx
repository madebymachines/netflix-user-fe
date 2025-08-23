// components/MobileShell.tsx
import Header from "./Header";

type Props = {
  children: React.ReactNode;
  header?: React.ReactNode;
  /** Jika diisi (mis. 590), konten jadi fixed height. Jika dikosongkan → tinggi fleksibel. */
  contentHeight?: number;
  /** Kunci seluruh stage (header+konten) dengan overlay gelap */
  dimAll?: boolean;
  /** Elemen yang tetap aktif di atas overlay (misal: CountryPill) */
  overlayChildren?: React.ReactNode;
};

export default function MobileShell({
  children,
  header,
  contentHeight, // <- tidak ada default → biar bisa fleksibel
  dimAll = false,
  overlayChildren,
}: Props) {
  const fixed = typeof contentHeight === "number";
  const stageH = fixed ? 50 + (contentHeight as number) : undefined;

  return (
    <div className="w-full min-h-screen bg-black flex justify-center">
      <div
        className="relative w-[360px]"
        // Jika fixed, kita tetapkan tinggi container supaya overlay menutup header+konten
        style={fixed ? { height: stageH } : undefined}
      >
        {/* Header 360x50 */}
        <div className="absolute top-0 left-0 z-30">{header ?? <Header />}</div>

        {/* Konten */}
        <section
          className={`relative mt-[50px] ${fixed ? "overflow-hidden" : ""}`}
          style={{
            width: 360,
            ...(fixed ? { height: contentHeight } : {}),
          }}
        >
          {children}
        </section>

        {/* Overlay pengunci menutupi header+konten */}
        {dimAll && (
          <>
            {/* Backdrop: kalau fixed pakai height spesifik; kalau fleksibel, isi container (inset-0) */}
            <div
              className={`absolute z-40 bg-black/80 pointer-events-auto ${
                fixed ? "" : "inset-0"
              }`}
              style={
                fixed
                  ? { top: 0, left: 0, width: 360, height: stageH }
                  : undefined
              }
            />
            {/* Slot untuk elemen yang tetap bisa diklik di atas overlay */}
            <div
              className={`absolute z-50 ${fixed ? "" : "inset-0"}`}
              style={
                fixed
                  ? { top: 0, left: 0, width: 360, height: stageH }
                  : undefined
              }
            >
              {overlayChildren}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

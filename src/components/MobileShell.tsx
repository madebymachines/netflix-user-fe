import Header from "./Header";

type Props = {
  children: React.ReactNode;
  header?: React.ReactNode;
  contentHeight?: number;
  dimAll?: boolean;
  overlayChildren?: React.ReactNode;
};

export default function MobileShell({
  children,
  header,
  contentHeight,
  dimAll = false,
  overlayChildren,
}: Props) {
  const fixed = typeof contentHeight === "number";

  return (
    <div className="w-full min-h-screen bg-black flex justify-center">
      <div className="relative w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg">
        {/* Header kini ikut flow dokumen (sticky di komponen Header) */}
        {header ?? <Header />}

        {/* Konten di bawah header: tidak perlu mt-[50px] lagi */}
        <section
          className={fixed ? "relative overflow-hidden" : "relative"}
          style={{ height: fixed ? contentHeight : undefined, width: "100%" }}
        >
          {children}
        </section>

        {/* Overlay full stage */}
        {dimAll && (
          <>
            <div className="absolute inset-0 z-50 bg-black/80 pointer-events-auto" />
            <div className="absolute inset-0 z-[60]">{overlayChildren}</div>
          </>
        )}
      </div>
    </div>
  );
}

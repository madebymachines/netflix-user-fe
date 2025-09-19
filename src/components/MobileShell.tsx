type Props = {
  children: React.ReactNode;
  header?: React.ReactNode;
  contentHeight?: number;
  dimAll?: boolean;
  overlayChildren?: React.ReactNode;
};

export default function MobileShell({
  children,
  contentHeight,
  dimAll = false,
  overlayChildren,
}: Props) {
  const fixed = typeof contentHeight === "number";
  const stageH = fixed ? 50 + contentHeight : undefined;

  return (
    <div className="w-full min-h-screen bg-black flex justify-center">
      <div
        className="relative w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg"
        style={fixed ? { height: stageH } : undefined}
      >
        {/* Konten di bawah header */}
        <section
          className={`relative mt-[50px] ${fixed ? "overflow-hidden" : ""}`}
          style={{ height: fixed ? contentHeight : undefined, width: "100%" }}
        >
          {children}
        </section>

        {/* Overlay full stage */}
        {dimAll && (
          <>
            <div
              className="absolute inset-0 z-40 bg-black/80 pointer-events-auto"
              style={fixed ? { height: stageH } : undefined}
            />
            <div
              className="absolute inset-0 z-50"
              style={fixed ? { height: stageH } : undefined}
            >
              {overlayChildren}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

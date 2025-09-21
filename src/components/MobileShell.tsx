type Props = {
  children: React.ReactNode;
  contentHeight?: number; // kalau diisi → fixed height
};

export default function MobileShell({
  children,
  contentHeight,
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
      </div>
    </div>
  );
}

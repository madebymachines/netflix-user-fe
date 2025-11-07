import type { Metadata } from "next";
import "./globals.css";
// import { urw, gravtrac, vancouver, vancouverGothic } from "./fonts";
import DesktopGate from "@/components/DesktopGate";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import Analytics from "@/components/Analytics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Netflix - 100 PLUS",
  description: "Unlock Your 100 Challenge",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Analytics />
      </head>
      <body
        // className={`${urw.variable} ${gravtrac.variable} ${vancouver.variable} ${vancouverGothic.variable} bg-black antialiased`}
        className="bg-black antialiased"
      >
        {/* {children} */}
        <DesktopGate>{children}</DesktopGate>
        <CookieConsentBanner />
      </body>
    </html>
  );
}

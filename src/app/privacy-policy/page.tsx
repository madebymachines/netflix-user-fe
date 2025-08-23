"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";

export default function PrivacyPolicyPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const CONTENT_H = 590;

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

      <div className="relative z-10 h-full w-full px-4 pt-5 text-white">
        <h1 className="text-center text-[24px] font-extrabold tracking-wide mb-4">
          Privacy Policy
        </h1>

        <div className="mx-auto w-full border border-white/30 rounded-md bg-black/30 backdrop-blur-[2px] p-3 max-h-[440px] overflow-y-auto text-[12px] leading-relaxed">
          <p className="mb-3">
            Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque
            faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi,
            pretium tellus duis convallis. Tempus leo eu aenean sed diam urna
            tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.
            Iaculis massa nisl malesuada lacinia integer nunc posuere.
          </p>
          <p className="mb-3">
            Ut hendrerit semper vel class aptent taciti sociosqu ad litora
            torquent per conubia nostra inceptos himenaeos. Lorem ipsum dolor
            sit amet consectetur adipiscing elit. Quisque faucibus ex sapien
            vitae pellentesque sem placerat.
          </p>
          <p className="mb-3">
            In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean
            sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus
            bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc
            posuere.
          </p>
          <p className="mb-3">
            By using our services, you agree to the collection and processing of
            your information in accordance with this policy. We may update this
            policy from time to time—please review it periodically.
          </p>
          <p>
            Contact us at privacy@example.com for questions or requests related
            to your personal data.
          </p>
        </div>

        <Link
          href="/register"
          className="block mt-4 mx-auto w-full rounded-md border border-white/30 bg-black/60 py-3 text-center font-bold"
        >
          Back to Register
        </Link>
      </div>

      <OverlayMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={guestMenu}
        contentHeight={CONTENT_H}
      />
    </MobileShell>
  );
}

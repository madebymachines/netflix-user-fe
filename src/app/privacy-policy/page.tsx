"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";

export default function PrivacyPolicyPage() {
  const [menuOpen, setMenuOpen] = useState(false);

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
    >
      <div className="absolute inset-0">
        <Image
          src="/images/ball.png"
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "top" }}
          className="opacity-25"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 w-full px-4 pt-5 text-white">
        <h1 className="text-center text-[16px] font-extrabold tracking-wide">
          100PLUS PRO UNLOCK YOUR 100 CHALLENGE
        </h1>
        <h1 className="text-center text-[16px] font-extrabold tracking-wide mb-4">
          Privacy Policy
        </h1>

        <div className="mx-auto w-full border border-white/30 rounded-md bg-black/30 backdrop-blur-[2px] p-3 max-h-[460px] overflow-y-auto text-[12px] leading-relaxed">
          <div className="mb-4">
            <h3 className="font-bold mb-2">Effective Date: 1 November 2025</h3>
            <p className="mb-1">
              F&N Beverages Marketing Sdn. Bhd (“F&N”, “we”, “our”, “us”) knows
              how important privacy is to you. This Privacy Policy outlines how
              we collect, use, handle and process your personal information in
              relation to the 100PLUS PRO “UNLOCK YOUR 100 CHALLENGE
              (“Challenge”). By registering or participating, you agree to the
              terms outlined in this Privacy Policy.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">WHAT INFORMATION DO WE COLLECT?</h3>
            <p className="mb-1">
              We collect information and personal data which includes, without
              limitation, the following: <br />
              (a) first name and last name; <br />
              (b) user name; <br />
              (c) email address; <br />
              (d) squats and other fitness metrics from your devices; <br />
              (e) your progress in the Challenge; <br />
              (f) photographs, video footage, or other visual/audio
              representations of you; and <br />
              (g) any other details you have or may provide us with.
            </p>
            <p className="mb-1">
              In addition to the above, we collect the following personal data
              from winners of the Challenge for the purpose of prize
              distribution: <br />
              (a) full name; <br />
              (b) phone number; <br />
              (c) home address; <br />
              and (d) national registration identity card number.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">
              WHERE DO WE GET YOUR INFORMATION FROM?
            </h3>
            <p className="mb-1">
              We collect or receive your personal data from the following
              sources: <br />
              (a) directly from you during registration and/or participation in
              the Challenge; <br />
              (b) automatically through cookies, web beacons or other similar
              tracking technologies when you visit the Challenge website; and{" "}
              <br />
              (c) other sources, including publicly available sources such as
              social media platforms.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">HOW DO WE USE YOUR INFORMATION?</h3>
            <p className="mb-1">
              (a) Challenge management and operations: To administer and manage
              the Challenge, manage account registration, verify participants’
              eligibility, communicate with participants, identify winners,
              communicate results and handle prize distribution. <br />
              (b) Marketing and promotions: To promote the Challenge, and to
              provide news, information, and updates about F&N’s and/or its
              business partners’ products, services, and promotions (only where
              you have given us your separate consent). <br />
              (c) Legal compliance: To comply with our legal obligations under
              applicable laws and regulations, including responding to valid
              court orders and lawful requests from regulatory or governmental
              authorities.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">
              WHO DO WE SHARE YOUR INFORMATION WITH?
            </h3>
            <p className="mb-1">
              We disclose your information internally within our business, as
              well as to the following entities, for the purposes described
              above: <br />
              (a) Affiliates: Subsidiaries, affiliates or related companies
              under Fraser and Neave, Limited and Fraser & Neave Holdings
              Berhad; <br />
              (b) Service Providers: We share participant details with our
              business partners, service providers or suppliers who are engaged
              to facilitate various functions essential for the administration
              of the Challenge, such as operational coordination, technology
              support, account verification, prize fulfilment, and other
              purposes related to the Challenge. <br />
              (c) Other Parties When Required by Law: We may be required by law,
              legal process, court order, or valid requests from governmental
              authorities to disclose your information. <br />
              (d) Other Parties with Your Consent: In addition to the
              disclosures described in this Privacy Policy, we may share
              information about you with third parties when you separately
              consent to or request such sharing.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">
              WHERE DO WE STORE YOUR INFORMATION?
            </h3>
            <p className="mb-1">
              Your personal information may be transferred to a place outside
              Malaysia.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">
              HOW DO WE KEEP YOUR INFORMATION SECURE?
            </h3>
            <p className="mb-1">
              We have put in place appropriate technical and organizational
              safeguards in compliance with applicable laws to protect your
              personal information against unauthorised access, disclosure,
              alteration, and loss. However, please note that no website,
              Internet transmission, computer system, or wireless connection can
              be guaranteed to be completely secure.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">WHAT ARE YOUR RIGHTS?</h3>
            <p className="mb-1">
              Your personal information belongs to you. In accordance with
              applicable laws, you have the right to access, request the
              correction of, and/or limit the processing of your personal
              information. You also have the right to withdraw your consent for
              us to process your personal information. You are responsible for
              ensuring that the personal information you provide is accurate,
              complete and not misleading and that such personal information is
              kept up to date.
            </p>
            <p className="mb-1">
              To make a request concerning your rights or to make an inquiry,
              please contact us. Our contact details are set out below in the
              CONTACT US section.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">
              HOW LONG DO WE KEEP YOUR INFORMATION?
            </h3>
            <p className="mb-1">
              We will retain your personal information for a reasonable period
              in accordance with legal requirements and statutory obligations.
              We will take reasonable steps to ensure that all your personal
              information is destroyed or permanently deleted as soon as it is
              reasonable to assume that (i) the purposes for which the personal
              information was collected is no longer being served by the
              retention of such personal data; and (ii) retention is no longer
              necessary for any other legal, or business purpose. We will not
              delete data that we are required by law to retain.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">CONTACT US</h3>
            <p className="mb-1">
              You can contact us to update your preferences, exercise your
              rights, make a complaint, submit a request or ask us questions.
              You can contact us at:
            </p>
            <p className="font-bold">
              Data Protection Officer F&N Beverages Marketing Sdn. Bhd.
            </p>
            <p>1, Jalan Bukit Belimbing 26/38,</p>
            <p> Persiaran Kuala Selangor,</p>
            <p>Seksyen 26, 40400 Shah Alam,</p>
            <p> Selangor Darul Ehsan.</p>
            <p> Tel: (603) 5101 4288</p>
            <p className="mb-1">
              <span className="underline text-blue-400">
                Email address: dpo@fnnfoods.com
              </span>
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">LANGUAGE</h3>
            <p className="mb-1">
              In the event of any inconsistencies between the English version
              and the Bahasa Malaysia version of this Privacy Policy, the
              English version shall prevail over the Bahasa Malaysia version.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">UPDATES</h3>
            <p className="mb-1">
              This Privacy Policy may be updated from time to time. Please visit
              the Challenge website regularly to stay informed of any updates or
              changes.
            </p>
          </div>
        </div>

        <Link
          href="/register"
          className="block mt-4 mx-auto w-full rounded-md border border-white/30 bg-black/60 py-3 text-center font-bold"
        >
          Back to Sign Up
        </Link>
      </div>

      <OverlayMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={guestMenu}
      />
    </MobileShell>
  );
}

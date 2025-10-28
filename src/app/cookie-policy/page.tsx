"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import MobileShell from "@/components/MobileShell";
import Header from "@/components/Header";
import OverlayMenu from "@/components/OverlayMenu";

export default function CookiePolicyPage() {
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
          Cookie Policy
        </h1>

        <div className="mx-auto w-full border border-white/30 rounded-md bg-black/30 backdrop-blur-[2px] p-3 max-h-[460px] overflow-y-auto text-[12px] leading-relaxed">
          <div className="mb-4">
            <h3 className="font-bold mb-2">Effective Date: 1 November 2025</h3>
            <p className="mb-1">
              This Cookies Policy explains how Unlock 100 Challenge
              (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) uses cookies
              and similar technologies on our website
              https://unlock100challange.100plus.com.my (the
              &quot;Website&quot;). This policy should be read together with our
              Privacy Policy.
            </p>
            <p className="mb-1">
              By continuing to browse or use our Website, you agree to our use
              of cookies as described in this policy.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">What Are Cookies?</h3>
            <p className="mb-1">
              Cookies are small text files that are placed on your device
              (computer, smartphone, or tablet) when you visit a website. They
              are widely used to make websites work more efficiently and provide
              information to website owners.
            </p>
            <p className="mb-1">
              Cookies can be &quot;persistent&quot; or &quot;session&quot;
              cookies:
              <li className="list-disc list-inside">
                <span className="font-bold">Session cookies</span> are temporary
                and are deleted when you close your browser
              </li>
              <li className="list-disc list-inside">
                <span className="font-bold">Persistent cookies</span> remain on
                your device for a set period or until you delete them
              </li>
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">How We Use Cookies</h3>
            <p className="mb-1">
              We use cookies for the following purposes:
              <div className="mb-1">
                <h3 className="font-bold mb-2">1. Essential Cookies</h3>
                <p className="mb-1">
                  These cookies are necessary for the Website to function
                  properly. They enable core functionality such as:
                  <li className="list-disc list-inside">
                    Security and authentication
                  </li>
                  <li className="list-disc list-inside">Network management</li>
                  <li className="list-disc list-inside">
                    Maintaining your session during the challenge
                  </li>
                  <li className="list-disc list-inside">
                    Remembering your preferences
                  </li>
                </p>
                <h3 className="font-bold mb-2">
                  2. Performance and Analytics Cookies
                </h3>
                <p className="mb-1">
                  These cookies help us understand how visitors interact with
                  our Website by collecting anonymous information about:
                  <li className="list-disc list-inside">Number of visitors</li>
                  <li className="list-disc list-inside">Pages visited</li>
                  <li className="list-disc list-inside">
                    Time spent on the site
                  </li>
                  <li className="list-disc list-inside">
                    Click patterns and navigation paths
                  </li>
                  <li className="list-disc list-inside">
                    Device and browser information
                  </li>
                  This information helps us improve the Website&apos;s
                  performance and user experience.
                </p>
                <h3 className="font-bold mb-2">3. Functionality Cookies</h3>
                <p className="mb-1">
                  These cookies allow the Website to remember choices you make
                  and provide enhanced features:
                  <li className="list-disc list-inside">
                    Remembering your login details (if applicable)
                  </li>
                  <li className="list-disc list-inside">
                    Language preferences
                  </li>
                  <li className="list-disc list-inside">
                    Challenge progress tracking
                  </li>
                  <li className="list-disc list-inside">Custom settings</li>
                </p>
                <h3 className="font-bold mb-2">
                  4. Marketing and Social Media Cookie
                </h3>
                <p className="mb-1">
                  These cookies may be used to:
                  <li className="list-disc list-inside">
                    Track the effectiveness of our marketing campaigns
                  </li>
                  <li className="list-disc list-inside">
                    Show you relevant content based on your interests
                  </li>
                  <li className="list-disc list-inside">
                    Enable social media sharing features
                  </li>
                  <li className="list-disc list-inside">
                    Deliver personalized content related to 100PLUS products and
                    promotions
                  </li>
                </p>
              </div>
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">Third-Party Cookies</h3>
            <p className="mb-1">
              We may also use third-party cookies from trusted partners,
              including:
              <li className="list-disc list-inside">
                <span className="font-bold">Google Analytics</span>: To analyze
                Website traffic and user behavior
              </li>
              <li className="list-disc list-inside">
                <span className="font-bold">Social Media Platforms</span>: To
                enable social sharing features (Facebook, Instagram, Twitter)
              </li>
              <li className="list-disc list-inside">
                <span className="font-bold">Advertising Networks</span>: To
                deliver targeted advertisements and measure campaign
                effectiveness
              </li>
            </p>
            <p className="mb-1">
              These third parties may also use cookies to collect information
              about your online activities across different websites.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">Managing Cookies</h3>
            <h4 className="font-bold mb-2">Browser Settings</h4>
            <p className="mb-1">
              You can control and manage cookies through your browser settings.
              Most browsers allow you to:
              <li className="list-disc list-inside">
                View what cookies are stored and delete them individually
              </li>
              <li className="list-disc list-inside">
                Block third-party cookies
              </li>
              <li className="list-disc list-inside">Block all cookies</li>
              <li className="list-disc list-inside">
                Delete all cookies when you close your browser
              </li>
            </p>
            Please note that blocking or deleting cookies may impact your
            experience on our Website and limit certain functionality.
          </div>

          <div className="mb-4">
            <h4 className="font-bold mb-2">Browser-Specific Instructions:</h4>
            <p className="mb-1">
              <span className="font-bold">Google Chrome</span>: Settings &gt;
              Privacy and Security &gt; Cookies and other site data
            </p>
            <p className="mb-1">
              <span className="font-bold">Mozilla Firefox</span>: Settings &gt;
              Privacy & Security &gt; Cookies and Site Data
            </p>
            <p className="mb-1">
              <span className="font-bold">Safari</span>: Preferences &gt;
              Privacy &gt; Cookies and website data
            </p>
            <p className="mb-1">
              <span className="font-bold">Microsoft Edge</span>: Settings &gt;
              Cookies and site permissions &gt; Manage and delete cookies
            </p>
          </div>

          <div className="mb-4">
            <h4 className="font-bold mb-2">Opt-Out Tools</h4>
            <p className="mb-1">
              You can opt out of certain third-party cookies using these
              resources:
              <li className="list-disc list-inside">
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-400"
                >
                  Google Analytics Opt-out
                </a>
              </li>
              <li className="list-disc list-inside">
                <a
                  href="http://www.networkadvertising.org/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-400"
                >
                  Network Advertising Initiative
                </a>
              </li>
              <li className="list-disc list-inside">
                <a
                  href="http://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-400"
                >
                  Digital Advertising Alliance
                </a>
              </li>
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">Mobile Devices</h3>
            <p className="mb-1">
              If you access our Website through a mobile device, you can manage
              cookies through your device settings or the mobile browser
              settings.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">Types of Cookies We Use</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-semibold py-2 pr-6 w-1/4">
                      Cookie Type
                    </th>
                    <th className="text-left font-semibold py-2 pr-6 w-2/4">
                      Purpose
                    </th>
                    <th className="text-left font-semibold py-2 w-1/4">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 pr-6 align-top whitespace-nowrap">
                      Session ID
                    </td>
                    <td className="py-2 pr-6 align-top">
                      Maintains your session during site visit
                    </td>
                    <td className="py-2 align-top">Session</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-6 align-top whitespace-nowrap">
                      Authentication
                    </td>
                    <td className="py-2 pr-6 align-top">Keeps you logged in</td>
                    <td className="py-2 align-top">Persistent (30 days)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-6 align-top whitespace-nowrap">
                      Preferences
                    </td>
                    <td className="py-2 pr-6 align-top">
                      Remembers your settings
                    </td>
                    <td className="py-2 align-top">Persistent (1 year)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-6 align-top whitespace-nowrap">
                      Analytics
                    </td>
                    <td className="py-2 pr-6 align-top">
                      Tracks site usage and performance
                    </td>
                    <td className="py-2 align-top">Persistent (2 years)</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-6 align-top whitespace-nowrap">
                      Marketing
                    </td>
                    <td className="py-2 pr-6 align-top">
                      Delivers personalized content
                    </td>
                    <td className="py-2 align-top">Persistent (90 days)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">Updates to This Policy</h3>
            <p className="mb-1">
              We may update this Cookies Policy from time to time to reflect
              changes in technology, legislation, or our business practices. We
              will notify you of any material changes by posting the updated
              policy on this page with a revised &quot;Last Updated&quot; date.
            </p>
            <p className="mb-1">
              We encourage you to review this policy periodically to stay
              informed about how we use cookies.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">CONTACT US</h3>
            <p className="mb-1">
              If you have any questions about our use of cookies or this Cookies
              Policy, please contact us:
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
            <h3 className="font-bold mb-2">Your Consent</h3>
            <p className="mb-1">
              By using our Website, you consent to the use of cookies as
              described in this policy. If you do not agree with our use of
              cookies, you should adjust your browser settings accordingly or
              refrain from using our Website.
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="block mt-4 mx-auto w-full rounded-md border border-white/30 bg-black/60 py-3 text-center font-bold"
        >
          Back to Home
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

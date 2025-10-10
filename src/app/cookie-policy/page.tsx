'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MobileShell from '@/components/MobileShell';
import Header from '@/components/Header';
import OverlayMenu from '@/components/OverlayMenu';

export default function CookiePolicyPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const guestMenu = [
    { label: 'Home', href: '/' },
    { label: 'Sign In', href: '/sign-in' },
    { label: 'Register', href: '/register' },
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
          style={{ objectFit: 'cover', objectPosition: 'top' }}
          className="opacity-25"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 w-full px-4 pt-5 text-white">
        <h1 className="text-center text-[24px] font-extrabold tracking-wide mb-4">
          COOKIE POLICY
        </h1>

        <div className="mx-auto w-full border border-white/30 rounded-md bg-black/30 backdrop-blur-[2px] p-3 max-h-[460px] overflow-y-auto text-[12px] leading-relaxed">
          <div className="mb-4">
            <p className="mb-1">
              This policy explains how we use cookies and other similar
              technologies to help us ensure that our services function
              properly, prevent fraud and other harm, and analyze and improve
              our services in accordance with our Privacy Policy.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">WHAT ARE COOKIES?</h3>
            <p className="mb-1">
              A cookie is a small piece of information that is placed on your
              Internet browsing software (the “browser”) by a website that you
              visit. It helps the website to remember information about your
              visit to make your next visit easier and the site more useful to
              you.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">HOW WE USE COOKIES</h3>
            <p className="mb-1">
              We may use cookies on our websites for the following purposes:
            </p>
            <ol className="list-decimal list-inside mb-1 space-y-1">
              <li>
                To enable certain features and functions on our websites (e.g.
                remembering your user-ID, browsing and other product and/or
                service preferences).
              </li>
              <li>
                To identify the causes of problems arising at web servers and to
                resolve these problems or improve efficiency of our websites.
              </li>
              <li>
                To improve the contents of our websites and emails from us.
              </li>
              <li>
                To customize the contents of our websites and emails from us to
                suit your individual interests or purposes.
              </li>
              <li>
                To utilize your browsing history on our websites and the results
                of questionnaires for market research or marketing, including
                sending you advertisements via our websites.
              </li>
              <li>
                To obtain aggregated website usage and visitation statistics.
              </li>
              <li>To administer services to you.</li>
            </ol>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">HOW TO MANAGE COOKIES</h3>
            <p className="mb-1">
              You may reject the use of cookies on our websites by configuring
              your browser to disable the use of cookies. However, this may
              result in the loss of functionality which may restrict your use of
              our websites and/or delay or affect the way in which it operates.
              If you disable the use of cookies, you may no longer be able to
              receive personalized features of our websites, which rely on the
              use of cookies.
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">CONTACT US</h3>
            <p className="mb-1">
              For more information about our privacy practices, please review
              our full{' '}
              <Link href="/privacy-policy" className="underline text-blue-400">
                Privacy Policy
              </Link>
              . If you have questions about our use of cookies, you can contact
              us at:{' '}
              <span className="underline text-blue-400">dpo@fnnfoods.com</span>
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

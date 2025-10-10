'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    // Check if consent has been given previously
    const consent = localStorage.getItem('cookie_consent');
    if (consent !== 'true') {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    // Save consent status in localStorage
    localStorage.setItem('cookie_consent', 'true');
    setShowBanner(false);
  };

  const handleNotNow = () => {
    // Optionally, you can handle the decline case.
    // Here, we will just hide the banner for this session.
    localStorage.setItem('cookie_consent', 'false');
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-black p-6 text-white shadow-lg animate-fade-in-up">
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-xl font-bold mb-2 text-left">Cookies Settings</h2>
        <p className="text-sm mb-6  text-left">
          We use cookies to improve your browsing experience, help personalise
          content, tailor and measure ads, and provide a better experience. By
          clicking accept, you agree to this, as outlined in our{' '}
          <Link
            href="/privacy-policy"
            className="underline hover:text-gray-300"
          >
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={handleNotNow}
            className="w-32 py-2 rounded-md text-sm font-bold border border-white bg-black hover:bg-white/10 transition-colors uppercase"
          >
            NOT NOW
          </button>
          <button
            onClick={handleAccept}
            className="w-32 py-2 rounded-md text-sm font-bold bg-red-600 hover:bg-red-700 transition-colors uppercase"
          >
            ACCEPT
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CookieConsentBanner;

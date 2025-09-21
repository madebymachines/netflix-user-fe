"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [screenHeight, setScreenHeight] = useState(0);

  useEffect(() => {
    setScreenHeight(window.innerHeight);
    const handleResize = () => setScreenHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section - Struktur Baru */}
      <div 
        className="relative w-full -mt-26 grid grid-rows-[1fr_auto_1fr]"
        style={{ height: '590px' }}
      >
        {/* Background ball */}
        <Image
          src="/images/ball.png"
          alt="Background ball"
          fill
          priority
          sizes="100vw"
          style={{ 
            objectFit: "cover", 
            objectPosition: "center top",
            zIndex: 1
          }}
        />

        {/* Logo - Posisi Tengah Atas */}
        <div className="flex justify-center items-end z-10 -mb-4">
          <Image
            src="/images/logo-netflix.png"
            alt="UNLOCK YOUR 100"
            width={310}
            height={100}
            priority
            className="sm:w-[310px] sm:h-[100px]"
          />
        </div>

        {/* Bottle - Posisi Tengah Bawah */}
        <div 
          className="absolute w-full flex justify-center"
          style={{ 
            top: '320px',
            zIndex: 10
          }}
        >
          <Image
            src="/images/bottle.png"
            alt="100PLUS PRO"
            width={250}
            height={350}
            priority
            className="drop-shadow-[0_18px_40px_rgba(0,0,0,.55)] 
                      sm:w-[250px] sm:h-[350px]"
          />
        </div>

        {/* Button - Posisi Paling Bawah */}
        <div 
          className="absolute w-full flex justify-center"
          style={{ 
            bottom: '-10px',
            zIndex: 10
          }}
        >
          <button
            onClick={() => router.push("/challenge")}
            className="cursor-pointer hover:scale-105 transition-transform 
                      drop-shadow-[0_10px_24px_rgba(0,0,0,.45)]
                      bg-transparent border-none p-0 touch-manipulation"
          >
            <Image
              src="/images/unlock.png"
              alt="UNLOCK NOW"
              width={160}
              height={40}
              className="sm:w-[170px] sm:h-[44px]"
            />
          </button>
        </div>
      </div>

      {/* Rewards Section */}
      <section className="w-full bg-black mt-5">
        <div className="max-w-screen-md mx-auto px-4 py-8">
          
          {/* Title */}
          <h2 className="text-center text-[30px] font-vancouver font-regular 
                        tracking-wider mb-6 text-white">
            <span className="text-red-500">EXCITING</span> REWARDS AWAIT!
          </h2>

          {/* Rewards list */}
          <div className="max-w-[250px] mx-auto space-y-4">
            
            {/* GRAND PRIZE */}
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full 
                            bg-white/10 border border-white/20 flex-shrink-0" />
              <div className="text-white">
                <div className="uppercase font-regular tracking-wide text-[16px] font-vancouver mb-1">
                  GRAND PRIZE
                </div>
                <p className="text-[12px] font-urw-geometric font-regular leading-snug 
                              opacity-90 text-white">
                  WIN 3 months of dual brand gym memberships at Fitness
                  First &amp; Celebrity Fitness
                </p>
              </div>
            </div>

            {/* GUARANTEED REWARD */}
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full 
                            bg-white/10 border border-white/20 flex-shrink-0" />
              <div className="text-white">
                <div className="uppercase tracking-wide text-[16px] font-vancouver font-regular mb-1">
                  GUARANTEED REWARD
                </div>
                <p className="text-[12px] font-urw-geometric font-regular leading-snug 
                              opacity-90 text-white">
                  FREE 3 days gym trial at Fitness First &amp; Celebrity
                  Fitness
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
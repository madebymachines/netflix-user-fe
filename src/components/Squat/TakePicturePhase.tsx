// components/Squat/TakePicturePhase.tsx
import React, { useState, useRef, useEffect } from 'react';

interface TakePicturePhaseProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const TakePicturePhase: React.FC<TakePicturePhaseProps> = ({
  videoRef,
  canvasRef,
}) => {
  const [showCaptureFlash, setShowCaptureFlash] = useState(false);
  const [countdown, setCountdown] = useState<number>(5);
  const captureFlashRef = useRef<HTMLDivElement>(null);

  // Play camera shutter sound
  const playShutterSound = async (): Promise<void> => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const now = audioContext.currentTime;
      
      // High pitched beep for camera shutter
      const osc1 = audioContext.createOscillator();
      const gain1 = audioContext.createGain();
      osc1.connect(gain1);
      gain1.connect(audioContext.destination);
      
      osc1.frequency.setValueAtTime(800, now);
      osc1.frequency.exponentialRampToValueAtTime(600, now + 0.1);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      
      osc1.start(now);
      osc1.stop(now + 0.1);

      // Second beep
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      
      osc2.frequency.setValueAtTime(600, now + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(400, now + 0.15);
      gain2.gain.setValueAtTime(0.3, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      
      osc2.start(now + 0.05);
      osc2.stop(now + 0.15);

    } catch (error) {
      console.error('Error playing shutter sound:', error);
    }
  };

  // Create camera flash/blitch effect
  const triggerCaptureFlash = async (): Promise<void> => {
    await playShutterSound();
    
    setShowCaptureFlash(true);
    
    if (canvasRef.current) {
      canvasRef.current.style.filter = 'brightness(0.5) saturate(1.5)';
    }

    setTimeout(() => {
      setShowCaptureFlash(false);
      if (canvasRef.current) {
        canvasRef.current.style.filter = 'brightness(1) saturate(1)';
      }
    }, 300);
  };

  // Countdown logic
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Trigger capture when countdown reaches 0
          triggerCaptureFlash();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col bg-black">
      {/* Header with Logo */}
      <div className="w-full px-4 pt-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-red-600 text-sm font-bold">100PLUS</div>
          <span className="text-gray-400 text-sm">PRO × PHYSICAL.ASIA</span>
        </div>
        <button className="text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Main Title */}
      <div className="w-full text-center py-4">
        <h1 className="text-white text-2xl font-bold">UNLOCK YOUR 100</h1>
      </div>

      {/* Video Container */}
      <div className="relative flex-1 flex items-center justify-center px-4">
        <div className="relative w-full max-w-sm aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />

          {/* Canvas overlay for pose */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
          />

          {/* Countdown Display */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="text-red-600 font-bold transition-all duration-300"
              style={{
                fontSize: countdown > 0 ? '80px' : '0px',
                opacity: countdown > 0 ? 1 : 0,
              }}
            >
              {countdown}
            </div>
          </div>

          {/* Capture Flash Effect */}
          {showCaptureFlash && (
            <div
              ref={captureFlashRef}
              className="absolute inset-0 bg-white"
              style={{
                animation: 'captureFlash 0.3s ease-out',
              }}
            />
          )}

          {/* Glitch Lines */}
          {showCaptureFlash && (
            <>
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.3) 2px, rgba(255,0,0,0.3) 4px)',
                  animation: 'glitchLines 0.2s ease-out',
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,255,0,0.2) 2px, rgba(0,255,0,0.2) 4px)',
                  animation: 'glitchLines 0.25s ease-out 0.05s',
                  animationFillMode: 'forwards',
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="w-full text-center py-6 px-4">
        <div className="text-red-600 text-sm font-bold tracking-wider mb-2">GET READY TO</div>
        <div className="text-white text-xl font-bold">POSE FOR A PHOTO</div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes captureFlash {
          0% {
            opacity: 1;
            background-color: rgba(255, 255, 255, 0.9);
          }
          50% {
            opacity: 0.7;
            background-color: rgba(255, 255, 200, 0.6);
          }
          100% {
            opacity: 0;
            background-color: transparent;
          }
        }

        @keyframes glitchLines {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(4px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default TakePicturePhase;
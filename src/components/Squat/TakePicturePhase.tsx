// components/Squat/TakePicturePhase.tsx
import React from 'react';

interface TakePicturePhaseProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const TakePicturePhase: React.FC<TakePicturePhaseProps> = ({
  videoRef,
  canvasRef
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Video Container - matching PositionPhases layout */}
      <div className="relative mx-auto bg-black overflow-hidden flex-1" 
        style={{ 
          aspectRatio: '3/4',
          height: 'auto',
          maxHeight: '60vh',
          minHeight: '300px',
          marginBottom: 0,
          borderRadius: '5px',
        }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ borderRadius: '5px' }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/30" style={{ borderRadius: '5px' }} />

        {/* Countdown Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          {/* Get Ready Text Section */}
          <div className="text-center space-y-3 mb-12">
            <div className="text-[#FF0000] text-xl font-bold tracking-wide font-urw-geometric">
              GET READY TO
            </div>
            <div className="text-white text-2xl font-bold tracking-wide font-urw-geometric">
              POSE FOR A PHOTO!
            </div>
          </div>

          {/* Countdown Circle */}
          <div className="flex items-center justify-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Animated pulse ring */}
              <div
                className="absolute inset-0 rounded-full border-4 border-[#FF0000]"
                style={{
                  animation: `pulse-ring 1s ease-in-out infinite`,
                }}
              />
              
              {/* Checkmark */}
              <div 
                className="text-6xl font-bold text-[#FF0000] select-none font-urw-geometric"
                style={{
                  animation: 'number-pop 0.6s ease-out',
                }}
              >
                ✓
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 15px rgba(255, 0, 0, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
            transform: scale(1);
          }
        }

        @keyframes number-pop {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.15);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default TakePicturePhase;
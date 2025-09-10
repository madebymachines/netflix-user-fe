import React from 'react';

// Interface for position validation object
interface PositionValidation {
  isValid: boolean;
  message: string;
}

// Interface for position component props
interface PositionComponentProps {
  videoRef: React.RefObject<HTMLVideoElement | null>; // Changed to allow null
  canvasRef: React.RefObject<HTMLCanvasElement | null>; // Changed to allow null
  positionValidation: PositionValidation;
  bodyOutlineKey: string | number;
  phase: string;
}

// Position Phase Components
export const PositionBeforeHydrate: React.FC<PositionComponentProps> = ({ 
  videoRef, 
  canvasRef, 
  positionValidation, 
  bodyOutlineKey, 
  phase 
}) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="relative mx-4 bg-black overflow-hidden flex-1" 
      style={{ 
        aspectRatio: '3/4',
        width: '100%',
        maxWidth: 'min(90vw, 60vh * 0.75)',
        height: 'auto',
        maxHeight: '60vh',
        minHeight: '300px',
        marginBottom: 0,
        borderRadius: '5px',
      }}>
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

        {/* Body outline overlay with dynamic key and improved styling */}
        <div 
          key={`body-outline-${bodyOutlineKey}-${phase}`}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <div className="relative w-2/5 h-4/5"> 
            <img 
              src="./images/Union.png"
              alt="Body Position Guide"
              className="w-full h-full object-contain transition-all duration-300"
              style={{ 
                filter: positionValidation.isValid 
                  ? 'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(119%) contrast(119%) drop-shadow(0 0 8px #00FF00)' // Bold green filter
                  : 'brightness(0) saturate(100%) invert(100%) drop-shadow(0 0 6px #FFFFFF)', // White outline
                opacity: positionValidation.isValid ? 1.0 : 0.8,
                transform: positionValidation.isValid ? 'scale(1.02)' : 'scale(1)',
              }}
            />
          </div>
        </div>
      </div>

      <div 
        className="mx-4 text-center flex-shrink-0"
        style={{ 
          paddingTop: '16px',
          marginTop: 0,
          marginBottom: 0
        }}
      >
        <p className="text-white text-[16px] font-urw-geometric font-regular">
          Step back so your whole body is visible, then get into position to start the challenge
        </p>
      </div>
    </div>
  );
};

export const PositionBeforeRecovery: React.FC<PositionComponentProps> = ({ 
  videoRef, 
  canvasRef, 
  positionValidation, 
  bodyOutlineKey, 
  phase 
}) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="relative mx-4 mb-4 bg-black overflow-hidden" style={{ 
        aspectRatio: '3/4',
        width: '100%',
        maxWidth: 'min(90vw, 60vh * 0.75)',
        height: 'auto',
        maxHeight: '60vh',
        minHeight: '300px',
        marginBottom: 0,
        borderRadius: '5px', 
      }}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Body outline overlay with dynamic key and improved styling */}
        <div 
          key={`body-outline-${bodyOutlineKey}-${phase}`}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="relative w-2/5 h-4/5"> 
            <img 
              src="./images/Union.png"
              alt="Body Position Guide"
              className="w-full h-full object-contain transition-all duration-300"
              style={{ 
                filter: positionValidation.isValid 
                  ? 'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(119%) contrast(119%) drop-shadow(0 0 8px #00FF00)' // Bold green filter
                  : 'brightness(0) saturate(100%) invert(100%) drop-shadow(0 0 6px #FFFFFF)', // White outline
                opacity: positionValidation.isValid ? 1.0 : 0.8,
                transform: positionValidation.isValid ? 'scale(1.02)' : 'scale(1)',
              }}
            />
          </div>
        </div>
      </div>

      <div 
        className="mx-4 text-center flex-shrink-0"
        style={{ 
          paddingTop: '16px',
          marginTop: 0,
          marginBottom: 0
        }}
      >
        <p className="text-white text-[16px] font-urw-geometric font-regular">
          Get ready for your second round! Position yourself properly
        </p>
      </div>
    </div>
  );
};
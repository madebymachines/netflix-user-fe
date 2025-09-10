import React, { useEffect } from 'react';
import { Check, X } from 'lucide-react';
import YouTubeVideo from './YoutubeVideo';
import { enableAudio, testAudio } from '../../utils/AudioUtils';

// Interface for SetupPage props
interface SetupPageProps {
  videoRef: React.RefObject<HTMLVideoElement | null>; // Changed to allow null
  canvasRef: React.RefObject<HTMLCanvasElement | null>; // Changed to allow null
  webcamRunning: boolean;
  isFpsCompatible: boolean;
  onBack: () => void;
  onContinue: () => void;
  YOUTUBE_VIDEO_ID: string;
}

// Setup Page Component
const SetupPage: React.FC<SetupPageProps> = ({ 
  videoRef, 
  canvasRef, 
  webcamRunning, 
  isFpsCompatible, 
  onBack, 
  onContinue, 
  YOUTUBE_VIDEO_ID 
}) => {
  
  // Enable audio when component mounts
  useEffect(() => {
    enableAudio();
  }, []);

  const handleContinue = async (): Promise<void> => {
    // Test audio before continuing
    console.log('Testing audio before starting challenge...');
    await testAudio();
    onContinue();
  };

  const handleBack = (): void => {
    // Enable audio on any user interaction
    enableAudio();
    onBack();
  };

  return (
    <div 
      className="w-full bg-black text-white flex flex-col"
    >
      {/* Video Container - Gunakan flex-1 dan remove margin bottom */}
      <div 
        className="relative mx-4 bg-transparent overflow-hidden rounded-lg"
        style={{ 
          aspectRatio: '3/4',
          height: 'auto',
          maxHeight: '60vh',
          minHeight: '300px',
          marginBottom: 0,
          borderRadius: '5px',
        }}
      >
        <YouTubeVideo
          videoId={YOUTUBE_VIDEO_ID}
          className="w-full h-full"
        />
        
        {/* Hidden webcam for initialization */}
        <video
          ref={videoRef}
          className="hidden"
          autoPlay
          playsInline
          muted
          preload="metadata"
        />
        <canvas
          ref={canvasRef}
          className="hidden"
        />
      </div>

      {/* Status Checks - Remove margin top/bottom dan gunakan padding */}
      <div 
        className="mx-4 flex-shrink-0"
        style={{ 
          paddingTop: '5px',
          paddingBottom: '5px',
          marginTop: 0,
          marginBottom: 0
        }}
      >
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full border-2 mb-2 flex items-center justify-center ${webcamRunning ? 'border-[#00FF51]' : 'border-[#FFFFFF]'}`}>
              {webcamRunning ? <Check size={12} className="text-[#00FF51]" /> : <X size={12} className="text-[#FFFFFF]" />}
            </div>
            <span className={`text-[30px] font-vancouver font-regular ${webcamRunning ? 'text-[#00FF51]' : 'text-[#FFFFFF]'}`}>CAMERA</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full border-2 mb-2 flex items-center justify-center ${isFpsCompatible ? 'border-[#00FF51]' : 'border-[#FFFFFF]'}`}>
              {isFpsCompatible ? <Check size={12} className="text-[#00FF51]" /> : <X size={12} className="text-[#FFFFFF]" />}
            </div>
            <span className={`text-[30px] font-vancouver font-regular ${isFpsCompatible ? 'text-[#00FF51]' : 'text-[#FFFFFF]'}`}>FPS CHECK</span>
          </div>
        </div>
        
        {!isFpsCompatible && (
          <div 
            className="text-white text-center bg-red-900/20 border border-red-500/30 rounded-lg p-4"
            style={{ marginTop: '16px' }}
          >
            <div className="text-[16px] font-urw font-regular mb-2">Sorry, Your device is not compatible.</div>
            <div className="text-[16px] font-urw font-regular">Please find other device to do the challenge!</div>
          </div>
        )}
      </div>

      {/* Conditional Button Layout */}
      {!isFpsCompatible ? (
        // Show only BACK TO HOME button when device is not compatible
        <div 
          className="mx-4 flex-shrink-0"
          style={{ 
            paddingBottom: '16px',
            marginTop: 0,
            marginBottom: 0
          }}
        >
          <button
            onClick={handleBack}
            className="w-full bg-transparent border-2 border-white text-white py-4 px-6 rounded-[5px] text-[24px] font-vancouver font-regular hover:bg-white hover:text-black transition-colors"
          >
            BACK TO HOME
          </button>
        </div>
      ) : (
        // Show normal BACK and CONTINUE buttons when device is compatible
        <div 
          className="mx-4 flex-shrink-0 flex gap-4"
          style={{ 
            paddingBottom: '16px',
            marginTop: 0,
            marginBottom: 0
          }}
        >
          <button
            onClick={handleBack}
            className="flex-1 bg-transparent border border-gray-600 text-white py-2 px-6 rounded text-[24px] font-vancouver font-regular hover:bg-gray-800 transition-colors"
          >
            BACK
          </button>
          <button
            onClick={handleContinue}
            disabled={!isFpsCompatible || !webcamRunning}
            className={`flex-1 py-2 px-6 rounded text-[24px] font-vancouver font-regular transition-colors ${
              isFpsCompatible && webcamRunning
                ? 'bg-[#FF0000] text-white hover:bg-[#CC0000]'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            CONTINUE
          </button>
        </div>
      )}
    </div>
  );
};

export default SetupPage;
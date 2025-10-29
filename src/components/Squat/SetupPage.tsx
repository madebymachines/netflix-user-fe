import React, { useEffect, useState } from 'react';
import { Check, X, Volume2, VolumeX } from 'lucide-react';
// import YouTubeVideo from './YoutubeVideo';
import { enableAudio, testAudio, getAudioState, playAnnouncement } from '../../utils/AudioUtils';

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
  
  const [audioTestResult, setAudioTestResult] = useState<boolean | null>(null);
  const [audioState, setAudioState] = useState<any>(null);
  const [showAudioDebug, setShowAudioDebug] = useState<boolean>(false);

  // Update audio state periodically
  useEffect(() => {
    const updateAudioState = () => {
      const state = getAudioState();
      setAudioState(state);
    };

    updateAudioState();
    const interval = setInterval(updateAudioState, 2000);

    return () => clearInterval(interval);
  }, []);

  // Auto-enable audio when component mounts (but don't force interaction)
  useEffect(() => {
    const handleFirstInteraction = async () => {
      console.log('First user interaction detected, enabling audio...');
      try {
        await enableAudio();
        setAudioState(getAudioState());
      } catch (error) {
        console.error('Error enabling audio on first interaction:', error);
      }
    };

    // Listen for any user interaction to enable audio
    const events = ['click', 'touch', 'touchstart', 'keydown'];
    const addListeners = () => {
      events.forEach(event => {
        document.addEventListener(event, handleFirstInteraction, { once: true, passive: true });
      });
    };

    addListeners();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFirstInteraction);
      });
    };
  }, []);

  const handleTestAudio = async (): Promise<void> => {
    console.log('Testing audio manually...');
    setAudioTestResult(null);
    
    try {
      await enableAudio();
      const result = await testAudio();
      setAudioTestResult(result);
      
      if (result) {
        // Test with actual announcement
        setTimeout(() => {
          playAnnouncement('Audio test successful');
        }, 500);
      }
    } catch (error) {
      console.error('Manual audio test failed:', error);
      setAudioTestResult(false);
    }
  };

  const handleContinue = async (): Promise<void> => {
    console.log('Continue button clicked - enabling audio and starting challenge...');
    
    try {
      // Force enable audio on continue click (user interaction)
      await enableAudio();
      
      // Quick audio test in background (non-blocking)
      testAudio().then(result => {
        console.log('Background audio test result:', result);
        if (result) {
          // Play immediate confirmation sound
          setTimeout(() => {
            playAnnouncement('Audio enabled, starting challenge');
          }, 200);
        } else {
          console.warn('Audio test failed, but continuing anyway');
        }
      }).catch(error => {
        console.error('Background audio test error:', error);
      });
      
      // Continue immediately without waiting for audio test
      onContinue();
      
    } catch (error) {
      console.error('Error in handleContinue:', error);
      // Continue anyway even if audio fails
      onContinue();
    }
  };

  const handleBack = async (): Promise<void> => {
    console.log('Back button clicked, enabling audio...');
    
    try {
      // Enable audio on any user interaction
      await enableAudio();
      console.log('Audio enabled on back action');
      
      // Optional: Play back sound confirmation
      setTimeout(() => {
        playAnnouncement('Going back');
      }, 100);
    } catch (error) {
      console.error('Error enabling audio on back:', error);
    }
    
    onBack();
  };

  return (
    <div 
      className="w-full bg-black text-white flex flex-col"
    >
      {/* Video Container - Gunakan flex-1 dan remove margin bottom */}
      <div 
        className="relative mx-auto bg-transparent overflow-hidden rounded-lg"
        style={{ 
          aspectRatio: '3/4',
          width: '100%',
          maxWidth: 'min(90vw, 60vh * 0.75)',
          height: 'auto',
          maxHeight: '60vh',
          minHeight: '300px',
          marginBottom: 0,
          borderRadius: '5px',
        }}
      >
        {/* <YouTubeVideo
          videoId={YOUTUBE_VIDEO_ID}
          className="w-full h-full"
        /> */}
        
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

      {/* Warning Marquee Text */}
      <div 
        className="w-full bg-[#FFA600] overflow-hidden"
      >
        <div 
          className="whitespace-nowrap text-black text-[14px] font-urw font-regular py-2"
          style={{
            display: 'inline-block',
            animation: 'marquee 20s linear infinite'
          }}
        >
          For participants with certain medical conditions, please be mindful of your limits during the challenge and take breaks as needed.
          &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
          For participants with certain medical conditions, please be mindful of your limits during the challenge and take breaks as needed.
          &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
          For participants with certain medical conditions, please be mindful of your limits during the challenge and take breaks as needed.
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
      `}</style>

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

        {/* Audio Debug Section */}
        {/* <div className="mt-4 border border-gray-600 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                audioState?.speechSynthesisSupported && audioState?.hasUserInteracted
                  ? 'border-[#00FF51]' 
                  : 'border-[#FFFFFF]'
              }`}>
                {audioState?.speechSynthesisSupported && audioState?.hasUserInteracted ? 
                  <Volume2 size={12} className="text-[#00FF51]" /> : 
                  <VolumeX size={12} className="text-[#FFFFFF]" />
                }
              </div>
              <span className={`text-[20px] font-vancouver font-regular ${
                audioState?.speechSynthesisSupported && audioState?.hasUserInteracted
                  ? 'text-[#00FF51]' 
                  : 'text-[#FFFFFF]'
              }`}>
                AUDIO {audioState?.speechSynthesisSupported ? 'READY' : 'NOT READY'}
              </span>
            </div>
            <button
              onClick={() => setShowAudioDebug(!showAudioDebug)}
              className="text-gray-400 text-sm border border-gray-500 px-2 py-1 rounded"
            >
              {showAudioDebug ? 'Hide Debug' : 'Show Debug'}
            </button>
          </div>

          <div className="flex gap-2 mb-2">
            <button
              onClick={handleTestAudio}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Test Audio
            </button>
            <div className={`flex items-center px-3 py-2 rounded text-sm ${
              audioTestResult === true 
                ? 'bg-green-600 text-white' 
                : audioTestResult === false 
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-600 text-gray-300'
            }`}>
              {audioTestResult === true 
                ? 'PASS' 
                : audioTestResult === false 
                  ? 'FAIL' 
                  : 'NOT TESTED'
              }
            </div>
          </div>

          {showAudioDebug && audioState && (
            <div className="bg-gray-900 rounded p-2 text-xs text-gray-300 max-h-40 overflow-y-auto">
              <div className="font-bold text-white mb-1">Audio Debug Info:</div>
              <div>User Interacted: {audioState.hasUserInteracted ? '✓' : '✗'}</div>
              <div>Speech Synthesis: {audioState.speechSynthesisSupported ? '✓' : '✗'}</div>
              <div>Audio Enabled: {audioState.isAudioEnabled ? '✓' : '✗'}</div>
              <div>AudioContext State: {audioState.audioContextState}</div>
              <div>Voices Available: {audioState.voicesCount}</div>
              <div>Selected Voice: {audioState.selectedVoice}</div>
              <div>Queue Length: {audioState.queueLength}</div>
              <div>Is Mobile: {audioState.isMobile ? '✓' : '✗'}</div>
              <div>Is iOS: {audioState.isIOS ? '✓' : '✗'}</div>
              <div>Is Android: {audioState.isAndroid ? '✓' : '✗'}</div>
              <div>Speaking: {audioState.speechSynthesisSpeaking ? '✓' : '✗'}</div>
              <div>Pending: {audioState.speechSynthesisPending ? '✓' : '✗'}</div>
              <div>Init Attempts: {audioState.audioInitializationAttempts}</div>
              <div className="mt-1 text-gray-400 break-all">
                UserAgent: {audioState.userAgent.substring(0, 60)}...
              </div>
            </div>
          )}
        </div> */}
        
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
import React, { useEffect, useState } from 'react';
import { Check, X, Volume2, VolumeX, Info } from 'lucide-react';
import YouTubeVideo from './YoutubeVideo';
import { enableAudio, testAudio, getAudioState, forceUserInteraction, playAnnouncement } from '../../utils/AudioUtils';

// Interface for SetupPage props
interface SetupPageProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  webcamRunning: boolean;
  isFpsCompatible: boolean;
  onBack: () => void;
  onContinue: () => void;
  YOUTUBE_VIDEO_ID: string;
}

// Setup Page Component with Audio Debug
const SetupPage: React.FC<SetupPageProps> = ({ 
  videoRef, 
  canvasRef, 
  webcamRunning, 
  isFpsCompatible, 
  onBack, 
  onContinue, 
  YOUTUBE_VIDEO_ID 
}) => {
  
  const [audioState, setAudioState] = useState<any>(null);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [isTestingAudio, setIsTestingAudio] = useState<boolean>(false);

  // Update audio state periodically
  useEffect(() => {
    const updateAudioState = () => {
      const state = getAudioState();
      setAudioState(state);
    };

    // Initial state
    updateAudioState();

    // Update every 2 seconds
    const interval = setInterval(updateAudioState, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleTestAudio = async (): Promise<void> => {
    console.log('Testing audio...');
    setIsTestingAudio(true);
    
    try {
      // Force user interaction
      await forceUserInteraction();
      
      // Test audio
      const result = await testAudio();
      console.log('Audio test result:', result);
      
      // Play a test announcement
      await playAnnouncement('Audio test successful');
      
    } catch (error) {
      console.error('Audio test failed:', error);
    } finally {
      setIsTestingAudio(false);
      // Update state after test
      const newState = getAudioState();
      setAudioState(newState);
    }
  };

  const handleContinue = async (): Promise<void> => {
    console.log('Continue button clicked, enabling audio...');
    setIsTestingAudio(true);
    
    try {
      // Force enable audio before continuing
      await forceUserInteraction();
      await testAudio();
      console.log('Audio enabled successfully');
      
      onContinue();
    } catch (error) {
      console.error('Error enabling audio on continue:', error);
      onContinue(); // Continue anyway
    } finally {
      setIsTestingAudio(false);
    }
  };

  const handleBack = async (): Promise<void> => {
    console.log('Back button clicked, enabling audio...');
    
    try {
      await forceUserInteraction();
      console.log('Audio enabled on back action');
    } catch (error) {
      console.error('Error enabling audio on back:', error);
    }
    
    onBack();
  };

  return (
    <div className="w-full bg-black text-white flex flex-col">
      
      {/* Audio Debug Toggle */}
      <div className="mx-4 mt-2 flex justify-between items-center">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
        >
          <Info size={16} />
          Audio Debug
        </button>
        
        <button
          onClick={handleTestAudio}
          disabled={isTestingAudio}
          className={`flex items-center gap-2 px-3 py-1 rounded text-sm border transition-colors ${
            isTestingAudio 
              ? 'border-gray-600 text-gray-400 cursor-not-allowed' 
              : audioState?.isAudioEnabled
              ? 'border-green-500 text-green-400 hover:bg-green-500/10'
              : 'border-red-500 text-red-400 hover:bg-red-500/10'
          }`}
        >
          {audioState?.isAudioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          {isTestingAudio ? 'Testing...' : 'Test Audio'}
        </button>
      </div>

      {/* Audio Debug Panel */}
      {showDebug && audioState && (
        <div className="mx-4 mt-2 mb-2 bg-gray-900 p-3 rounded text-xs">
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <strong className="text-green-400">Audio Status:</strong>
              <div>Enabled: {audioState.isAudioEnabled ? '✅' : '❌'}</div>
              <div>User Interaction: {audioState.userInteractionReceived ? '✅' : '❌'}</div>
              <div>Initialized: {audioState.audioInitialized ? '✅' : '❌'}</div>
              
              <strong className="text-blue-400 mt-2 block">Context:</strong>
              <div>State: {audioState.audioContextState}</div>
              <div>Sample Rate: {audioState.audioContextSampleRate}</div>
            </div>
            
            <div>
              <strong className="text-yellow-400">Speech Synthesis:</strong>
              <div>Supported: {audioState.speechSynthesisSupported ? '✅' : '❌'}</div>
              <div>Speaking: {audioState.speechSynthesisState.speaking ? '✅' : '❌'}</div>
              <div>Pending: {audioState.speechSynthesisState.pending ? '✅' : '❌'}</div>
              <div>Voices: {audioState.voicesCount}</div>
              <div>Selected: {audioState.selectedVoice || 'none'}</div>
              <div>Queue: {audioState.queueLength}</div>
            </div>
            
            <div className="col-span-2 mt-2">
              <strong className="text-purple-400">Device:</strong>
              <div>Mobile: {audioState.deviceInfo.isMobile ? '✅' : '❌'}</div>
              <div>iOS: {audioState.deviceInfo.isIOS ? '✅' : '❌'}</div>
              <div>Android: {audioState.deviceInfo.isAndroid ? '✅' : '❌'}</div>
              <div>Safari: {audioState.deviceInfo.isSafari ? '✅' : '❌'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Video Container */}
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
        {/* Uncomment if you want to show YouTube video */}
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

      {/* Status Checks */}
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
            <div className={`w-5 h-5 rounded-full border-2 mb-2 flex items-center justify-center ${isFpsCompatible ? 'border-[#00FF51]' : 'border-[#FFFFFF]'}`}>
              {isFpsCompatible ? <Check size={12} className="text-[#00FF51]" /> : <X size={12} className="text-[#FFFFFF]" />}
            </div>
            <span className={`text-[30px] font-vancouver font-regular ${isFpsCompatible ? 'text-[#00FF51]' : 'text-[#FFFFFF]'}`}>FPS CHECK</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full border-2 mb-2 flex items-center justify-center ${audioState?.isAudioEnabled ? 'border-[#00FF51]' : 'border-[#FFFFFF]'}`}>
              {audioState?.isAudioEnabled ? <Volume2 size={12} className="text-[#00FF51]" /> : <VolumeX size={12} className="text-[#FFFFFF]" />}
            </div>
            <span className={`text-[30px] font-vancouver font-regular ${audioState?.isAudioEnabled ? 'text-[#00FF51]' : 'text-[#FFFFFF]'}`}>AUDIO</span>
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

        {!audioState?.isAudioEnabled && (
          <div 
            className="text-white text-center bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mt-4"
          >
            <div className="text-[16px] font-urw font-regular mb-2">Audio is not enabled.</div>
            <div className="text-[14px] font-urw font-regular">Please test audio before continuing to ensure count sounds work properly.</div>
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
            disabled={!isFpsCompatible || !webcamRunning || isTestingAudio}
            className={`flex-1 py-2 px-6 rounded text-[24px] font-vancouver font-regular transition-colors ${
              isFpsCompatible && webcamRunning && !isTestingAudio
                ? 'bg-[#FF0000] text-white hover:bg-[#CC0000]'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isTestingAudio ? 'TESTING...' : 'CONTINUE'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SetupPage;
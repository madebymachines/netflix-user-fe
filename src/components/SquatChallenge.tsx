import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
  PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";

// Import utility classes
import { FPSMonitor } from '../utils/FPSMonitor';
import { PositionValidator } from '../utils/PositionValidator';
import { SquatCounter } from '../utils/SquatCounter';
import { playCountSound, playAnnouncement, enableAudio, stopAllAudio } from '../utils/AudioUtils';

// Import components
import SetupPage from '../components/Squat/SetupPage';
import { PositionBeforeHydrate, PositionBeforeRecovery } from '../components/Squat/PositionPhases';
import { HydratePhase, RecoveryPhase, ExercisePhase, GoPhase } from '../components/Squat/ExercisePhases';
import { HydrateTimer, RecoveryTimer, ExerciseTimer } from '../components/Squat/TimerDisplay';
import GridPhotoPage from '../components/Squat/GridPhotoPage';

// Type definitions
type Phase = 'setup' | 'position-before-hydrate' | 'position-before-recovery' | 
             'hydrate' | 'recovery' | 'exercise' | 'go' | 'completed' | 'grid';

type PhotoType = 'hydrate' | 'round1Squat' | 'recovery' | 'round2Squat';

interface FPSData {
  fps: number;
  avgFps: number;
  isLowPerformance: boolean;
  frameCount: number;
}

interface PositionValidation {
  isValid: boolean;
  message: string;
}

interface SquatPhotoStatus {
  round1: boolean;
  round2: boolean;
}

interface Screenshots {
  [key: string]: string;
}

interface SquatChallengeAppProps {
  onBack: () => void;
  onHideLogo?: (hide: boolean) => void;
}

const SquatChallengeApp: React.FC<SquatChallengeAppProps> = ({ onBack, onHideLogo }) => {
  const [phase, setPhase] = useState<Phase>('setup');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [timeRemaining, setTimeRemaining] = useState<number>(10);
  const [squatCount, setSquatCount] = useState<number>(0);
  const [totalSquats, setTotalSquats] = useState<number>(0);
  const [webcamRunning, setWebcamRunning] = useState<boolean>(false);
  const [fpsData, setFpsData] = useState<FPSData>({ fps: 0, avgFps: 0, isLowPerformance: false, frameCount: 0 });
  const [isFpsCompatible, setIsFpsCompatible] = useState<boolean>(true);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [screenshots, setScreenshots] = useState<Screenshots>({});
  const [hasSquatPhoto, setHasSquatPhoto] = useState<SquatPhotoStatus>({ round1: false, round2: false });
  const [hasSpokenHydrate, setHasSpokenHydrate] = useState<boolean>(false);
  const [hasSpokenRecovery, setHasSpokenRecovery] = useState<boolean>(false);
  const [hasSpokenCongratulations, setHasSpokenCongratulations] = useState<boolean>(false);
  const [positionValidation, setPositionValidation] = useState<PositionValidation>({ isValid: false, message: "" });
  const [isPositionConfirmed, setIsPositionConfirmed] = useState<boolean>(false);
  const [bodyOutlineKey, setBodyOutlineKey] = useState<number>(0);
  // YouTube video ID for shorts
  const YOUTUBE_VIDEO_ID: string = "eFEVKmp3M4g"; // Replace with your YouTube Shorts ID

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const squatCounterRef = useRef<SquatCounter>(new SquatCounter());
  const fpsMonitorRef = useRef<FPSMonitor>(new FPSMonitor());
  const positionValidatorRef = useRef<PositionValidator>(new PositionValidator());
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // ✅ NEW: Ref untuk last frame buffer
  const lastFrameRef = useRef<string | null>(null);

  useEffect(() => {
    if (onHideLogo) {
      onHideLogo(phase === 'grid');
    }
  }, [phase, onHideLogo]);

  // Screenshot function dengan fallback support
  const takeScreenshot = useCallback((photoType: PhotoType, isFallback: boolean = false): void => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (!canvas || !video) return;
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) return;
    
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    
    try {
      tempCtx.drawImage(video, 0, 0);
      const dataURL = tempCanvas.toDataURL('image/png');
      
      // ✅ Validasi dataURL
      if (!dataURL || dataURL.length < 100) {
        console.error(`[${photoType}] Invalid dataURL generated`);
        return;
      }
      
      setScreenshots(prev => ({
        ...prev,
        [photoType]: dataURL
      }));
      
      // ✅ Log dengan fallback indicator
      const fallbackIndicator = isFallback ? ' (FALLBACK)' : '';
      console.log(`✓ Screenshot taken for: ${photoType}${fallbackIndicator}`);
    } catch (error) {
      console.error(`✗ Screenshot failed for ${photoType}:`, error);
    }
  }, []);

  // Initialize MediaPipe
  useEffect(() => {
    const initializePoseLandmarker = async (): Promise<void> => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.3,
          minPosePresenceConfidence: 0.3,
          minTrackingConfidence: 0.3,
        });
        
        poseLandmarkerRef.current = poseLandmarker;
      } catch (error) {
        console.error("Error initializing PoseLandmarker:", error);
      }
    };

    initializePoseLandmarker();
  }, []);

  // Start webcam
  const startWebcam = useCallback(async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { min: 320, ideal: 480, max: 640 },
          height: { min: 240, ideal: 640, max: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30, max: 30 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setWebcamRunning(true);
          fpsMonitorRef.current.reset();
        };
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  }, []);

  useEffect(() => {
    if (webcamRunning && videoRef.current && !videoRef.current.srcObject) {
      console.log('Video lost srcObject, restarting...');
      setWebcamRunning(false);
    }
  }, [phase, webcamRunning]);

  useEffect(() => {
    startWebcam();
  }, [startWebcam]);

  useEffect(() => {
    if (!webcamRunning) {
      startWebcam();
    }
  }, [webcamRunning, startWebcam]);

  const handlePhaseComplete = useCallback((): void => {
    console.log(`Phase completing: ${phase}`);
    
    if (phase === 'position-before-hydrate') {
      console.log('Transitioning from position-before-hydrate to hydrate');
      setPhase('hydrate');
      setTimeRemaining(10);
      setProgressPercent(0);
      
      // Trigger hydrate announcement immediately
      setTimeout(() => {
        if (!hasSpokenHydrate) {
          playAnnouncement('Hydrate and Energize your body');
          setHasSpokenHydrate(true);
        }
      }, 500);
      
    } else if (phase === 'hydrate') {
      console.log('Transitioning from hydrate to go phase');
      takeScreenshot('hydrate');
      setProgressPercent(100);
      
      setTimeout(() => {
        console.log('Setting phase to GO');
        setPhase('go');
        
        // Play GO announcement
        setTimeout(() => {
          playAnnouncement('GO!');
        }, 100);
        
        setTimeout(() => {
          console.log('Setting phase to exercise');
          setPhase('exercise');
          setTimeRemaining(50);
          setProgressPercent(0);
          squatCounterRef.current.resetCount();
          setSquatCount(0);
          setHasSquatPhoto(prev => ({ ...prev, [`round${currentRound}`]: false }));
          // ✅ Reset last frame buffer
          lastFrameRef.current = null;
        }, 2000);
      }, 1000);
      
    } else if (phase === 'exercise') {
      console.log(`Exercise phase complete for round ${currentRound}`);
      setProgressPercent(100);
      
      // ✅ NEW: Fallback screenshot jika belum ada
      const photoKey = `round${currentRound}` as keyof SquatPhotoStatus;
      if (!hasSquatPhoto[photoKey] && lastFrameRef.current) {
        console.warn(`⚠️ No squat detected in round ${currentRound}, using fallback screenshot`);
        const photoType: PhotoType = currentRound === 1 ? 'round1Squat' : 'round2Squat';
        setScreenshots(prev => ({
          ...prev,
          [photoType]: lastFrameRef.current!
        }));
        setHasSquatPhoto(prev => ({ ...prev, [photoKey]: true }));
      } else if (!hasSquatPhoto[photoKey]) {
        console.error(`❌ No screenshot available for round ${currentRound}`);
      }

      if (currentRound === 1) {
        console.log('Transitioning to recovery phase');
        setPhase('recovery');
        setTimeRemaining(10);
        setProgressPercent(0);
        
        // Trigger recovery announcement immediately
        setTimeout(() => {
          if (!hasSpokenRecovery) {
            playAnnouncement('Recover and Repeat Stronger');
            setHasSpokenRecovery(true);
          }
        }, 500);
      } else {
        console.log('Challenge completed, transitioning to grid');
        if (!hasSpokenCongratulations) {
          playAnnouncement('Congratulations! You finished your challenge!');
          setHasSpokenCongratulations(true);
        }
        setTimeout(() => {
          setPhase('grid');
        }, 3000);
      }
      
    } else if (phase === 'recovery') {
      console.log('Recovery phase complete, transitioning to position-before-recovery');
      takeScreenshot('recovery');
      setProgressPercent(100);
      
      setTimeout(() => {
        setPhase('position-before-recovery');
        setProgressPercent(0);
        positionValidatorRef.current.reset();
        setIsPositionConfirmed(false);
      }, 1000);
      
    } else if (phase === 'position-before-recovery') {
      console.log('Position before recovery complete, starting round 2');
      setTimeout(() => {
        setPhase('go');
        setCurrentRound(2);
        
        // Play GO announcement for round 2
        setTimeout(() => {
          playAnnouncement('Round Two, GO!');
        }, 100);
        
        setTimeout(() => {
          setPhase('exercise');
          setTimeRemaining(50);
          setProgressPercent(0);
          squatCounterRef.current.resetCount();
          setSquatCount(0);
          setHasSquatPhoto(prev => ({ ...prev, [`round${currentRound}`]: false }));
          // ✅ Reset last frame buffer untuk round 2
          lastFrameRef.current = null;
        }, 2000);
      }, 1000);
    }
  }, [phase, currentRound, takeScreenshot, hasSpokenCongratulations, hasSpokenHydrate, hasSpokenRecovery, hasSquatPhoto]);

  // Pose detection with proper canvas sizing and positioning
  const detectPose = useCallback(async (): Promise<void> => {
    if (!videoRef.current || !webcamRunning || !poseLandmarkerRef.current) {
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!canvas || video.videoWidth === 0 || video.videoHeight === 0 || video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }

    // Proper canvas sizing
    const videoRect = video.getBoundingClientRect();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.style.width = `${videoRect.width}px`;
    canvas.style.height = `${videoRect.height}px`;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    
    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) {
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }
    
    try {
      const startTimeMs = performance.now();
      const results = await poseLandmarkerRef.current.detectForVideo(video, startTimeMs);

      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        
        // Handle position validation phase - simplified
        if (phase === 'position-before-hydrate' || phase === 'position-before-recovery') {
          const validation = positionValidatorRef.current.validatePosition(landmarks);
          setPositionValidation(validation);
          
          // Simplified position confirmation
          if (validation.isValid && !isPositionConfirmed) {
            console.log('Position confirmed, starting transition...');
            setIsPositionConfirmed(true);
            
            // Trigger phase completion after delay
            setTimeout(() => {
              console.log('Triggering handlePhaseComplete from position validation');
              handlePhaseComplete(); 
            }, 3000);
          }
        }
        
        // Handle exercise phase
        if (phase === 'exercise') {
          // Draw skeleton
          const drawingUtils = new DrawingUtils(canvasCtx);
          drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, { color: '#FFFFFF', lineWidth: 2 });
          drawingUtils.drawLandmarks(landmarks, { color: '#FFFFFF', radius: 4 });
          
          // ✅ NEW: Simpan current frame sebagai last frame (untuk fallback)
          try {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = video.videoWidth;
            tempCanvas.height = video.videoHeight;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
              tempCtx.drawImage(video, 0, 0);
              lastFrameRef.current = tempCanvas.toDataURL('image/png');
            }
          } catch (error) {
            console.error('Error capturing last frame:', error);
          }
          
          // Process squat counting
          const result = squatCounterRef.current.processPose(landmarks);
          
          if (result.isSquatDown && !hasSquatPhoto[`round${currentRound}` as keyof SquatPhotoStatus]) {
            const photoType: PhotoType = currentRound === 1 ? 'round1Squat' : 'round2Squat';
            takeScreenshot(photoType);
            setHasSquatPhoto(prev => ({ ...prev, [`round${currentRound}`]: true }));
          }
          
          if (result.newCount) {
            setSquatCount(result.count);
            setTotalSquats(prev => prev + 1);
            
            // Play count sound immediately without delay
            playCountSound(result.count).catch(error => {
              console.error('Error playing count sound:', error);
            });
            
            sessionStorage.setItem(`squats_round_${currentRound}`, result.count.toString());
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(detectPose);
    } catch (error) {
      console.error('Error in pose detection:', error);
      animationFrameRef.current = requestAnimationFrame(detectPose);
    }
  }, [webcamRunning, phase, currentRound, takeScreenshot, hasSquatPhoto, isPositionConfirmed, handlePhaseComplete]);

  useEffect(() => {
    if (webcamRunning) {
      detectPose();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [webcamRunning, detectPose]);

  useEffect(() => {
    if (phase === 'position-before-hydrate' || phase === 'position-before-recovery') {
      console.log(`Entering position validation phase: ${phase}`);
      setIsPositionConfirmed(false);
      positionValidatorRef.current.reset();
      setBodyOutlineKey(prev => prev + 1);
      stopAllAudio(); // Clear any pending audio
    }
  }, [phase]);

  useEffect(() => {
    const handleUserInteraction = async (event: Event) => {
      try {
        await enableAudio();
      } catch (error) {
        console.error('Error re-enabling audio on interaction:', error);
      }
    };

    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  // Progress bar calculation
  useEffect(() => {
    let totalTime: number;
    if (phase === 'hydrate' || phase === 'recovery') totalTime = 10;
    else if (phase === 'exercise') totalTime = 50;
    else return;

    const progress = ((totalTime - timeRemaining) / totalTime) * 100;
    setProgressPercent(Math.min(100, Math.max(0, progress)));
  }, [timeRemaining, phase]);

  // Timer logic with screenshot taking and audio announcements
  useEffect(() => {
    console.log(`Timer started for phase: ${phase}, time: ${timeRemaining}`);
    
    if (phase === 'hydrate' || phase === 'exercise' || phase === 'recovery') {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          console.log(`Timer tick: ${phase}, remaining: ${prev - 1}`);
          
          // Play countdown announcement
          if ((phase === 'hydrate' || phase === 'recovery') && prev === 5) {
            const message = phase === 'hydrate' ? 'Your First Round Begin in' : 'Your Second Round Begin in';
            playAnnouncement(message);
          }
          
          // When timer reaches 0, trigger phase completion
          if (prev <= 1) {
            console.log(`Timer finished for phase: ${phase}`);
            clearInterval(interval);
            
            // Call handlePhaseComplete after a small delay to ensure state updates
            setTimeout(() => {
              handlePhaseComplete();
            }, 100);
            
            return 0;
          }
          
          return prev - 1;
        });
      }, 1000);

      // Cleanup function
      return () => {
        console.log(`Cleaning up timer for phase: ${phase}`);
        clearInterval(interval);
      };
    }
  }, [phase, handlePhaseComplete]);

  const handleContinue = async (): Promise<void> => {
    console.log('Starting challenge with immediate audio activation...');
    
    if (isFpsCompatible) {
      try {
        // Force enable audio immediately when continue is clicked
        await enableAudio();
        console.log('Audio enabled successfully on continue');
        
        // Play immediate welcome sound
        setTimeout(() => {
          playAnnouncement('Challenge starting, get ready');
        }, 300);
        
      } catch (error) {
        console.error('Error enabling audio on continue:', error);
      }
      
      setPhase('position-before-hydrate');
      
      if (videoRef.current) {
        videoRef.current.play().catch(e => console.log('Video play error:', e));
      }
    }
  };

  // Show grid page
  if (phase === 'grid') {
    const round1Count = parseInt(sessionStorage.getItem('squats_round_1') || '0');
    const round2Count = parseInt(sessionStorage.getItem('squats_round_2') || '0');
    const photosArray: (string | undefined)[] = [
      screenshots.hydrate,
      screenshots.round1Squat,
      screenshots.recovery,
      screenshots.round2Squat
    ];
    
    return (
      <GridPhotoPage
        photos={photosArray}
        totalSquats={totalSquats}
        round1Count={round1Count}
        round2Count={round2Count}
        onBack={onBack}
        onShare={() => {}}
      />
    );
  }

  return (
    <div 
      className="w-full bg-black text-white flex flex-col" 
      // style={{ 
      //   maxWidth: '430px', 
      //   margin: "0 auto",
      //   minHeight: '100vh',
      //   height: '100vh', // Tambahkan height eksplisit untuk konsistensi Safari
      //   overflow: 'hidden' // Cegah scrolling yang tidak diinginkan
      // }}
    >
      {phase === 'setup' && (
        <SetupPage
          videoRef={videoRef}
          canvasRef={canvasRef}
          webcamRunning={webcamRunning}
          isFpsCompatible={isFpsCompatible}
          onBack={onBack}
          onContinue={handleContinue}
          YOUTUBE_VIDEO_ID={YOUTUBE_VIDEO_ID}
        />
      )}

      {phase === 'position-before-hydrate' && (
        <div className="flex-1 flex flex-col">
          <PositionBeforeHydrate
            videoRef={videoRef}
            canvasRef={canvasRef}
            positionValidation={positionValidation}
            bodyOutlineKey={bodyOutlineKey}
            phase={phase}
          />
        </div>
      )}

      {phase === 'position-before-recovery' && (
        <div className="flex-1 flex flex-col">
          <PositionBeforeRecovery
            videoRef={videoRef}
            canvasRef={canvasRef}
            positionValidation={positionValidation}
            bodyOutlineKey={bodyOutlineKey}
            phase={phase}
          />
        </div>
      )}

      {phase === 'hydrate' && (
        <>
          <HydratePhase
            videoRef={videoRef}
            canvasRef={canvasRef}
            progressPercent={progressPercent}
          />
          
          {/* Progress Bar */}
          <div className="mx-4 flex-shrink-0">
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FF0000] transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <HydrateTimer timeRemaining={timeRemaining} />
        </>
      )}

      {phase === 'recovery' && (
        <>
          <RecoveryPhase
            videoRef={videoRef}
            canvasRef={canvasRef}
            progressPercent={progressPercent}
          />
          
          {/* Progress Bar */}
          <div className="mx-4 flex-shrink-0">
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FF0000] transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <RecoveryTimer timeRemaining={timeRemaining} />
        </>
      )}

      {phase === 'exercise' && (
        <>
          <ExercisePhase
            videoRef={videoRef}
            canvasRef={canvasRef}
            currentRound={currentRound}
            squatCount={squatCount}
          />
          
          {/* Progress Bar */}
          <div className="mx-4 flex-shrink-0">
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FF0000] transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <ExerciseTimer timeRemaining={timeRemaining} />
        </>
      )}

      {phase === 'go' && (
        <>
          <GoPhase
            videoRef={videoRef}
            canvasRef={canvasRef}
          />
          
          {/* Progress Bar */}
          <div className="mx-4 flex-shrink-0">
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FF0000] transition-all duration-1000 ease-linear"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SquatChallengeApp;
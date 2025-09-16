// AudioUtils.tsx - Fixed version with enhanced mobile browser support
let audioContext: AudioContext | null = null;
let isAudioEnabled = false;
let speechQueue: Array<{ text: string; rate: number; volume: number; resolve: () => void }> = [];
let isProcessingQueue = false;
let audioInitialized = false;
let userInteractionReceived = false;

// Initialize audio context after user interaction
const initAudioContext = async (): Promise<void> => {
  if (!audioContext) {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContext = new AudioContext();
      
      console.log('Audio context created, state:', audioContext.state);
      
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('Audio context resumed, new state:', audioContext.state);
      }
      
      audioInitialized = true;
      console.log('Audio context initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  } else if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
      console.log('Existing audio context resumed, state:', audioContext.state);
    } catch (error) {
      console.error('Failed to resume audio context:', error);
    }
  }
};

// Force enable audio with user interaction
export const enableAudio = async (): Promise<void> => {
  console.log('enableAudio called');
  userInteractionReceived = true;
  
  try {
    await initAudioContext();
    
    // Test speech synthesis
    if ('speechSynthesis' in window) {
      console.log('Speech synthesis available');
      
      // Cancel any ongoing speech
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      
      // Load voices
      await loadVoices();
      
      // Test with a silent utterance to wake up the speech engine
      const testUtterance = new SpeechSynthesisUtterance('');
      testUtterance.volume = 0;
      speechSynthesis.speak(testUtterance);
      
      isAudioEnabled = true;
      console.log('Audio enabled successfully');
      
      // Play a test sound to verify everything works
      await testAudioWithSound();
    } else {
      console.error('Speech synthesis not supported');
    }
  } catch (error) {
    console.error('Error enabling audio:', error);
  }
};

// Load voices with promise
const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      console.log('Voices already loaded:', voices.length);
      resolve(voices);
      return;
    }
    
    const loadVoicesHandler = () => {
      const loadedVoices = speechSynthesis.getVoices();
      console.log('Voices loaded:', loadedVoices.length);
      resolve(loadedVoices);
    };
    
    speechSynthesis.addEventListener('voiceschanged', loadVoicesHandler, { once: true });
    
    // Fallback timeout
    setTimeout(() => {
      const fallbackVoices = speechSynthesis.getVoices();
      console.log('Voices loaded (fallback):', fallbackVoices.length);
      resolve(fallbackVoices);
    }, 1000);
  });
};

// Test audio with actual sound
const testAudioWithSound = async (): Promise<void> => {
  return new Promise((resolve) => {
    try {
      const testUtterance = new SpeechSynthesisUtterance('Test');
      testUtterance.volume = 0.1;
      testUtterance.rate = 2.0;
      testUtterance.pitch = 1.0;
      
      const voice = selectVoice();
      if (voice) {
        testUtterance.voice = voice;
      }
      
      testUtterance.onend = () => {
        console.log('Test audio completed successfully');
        resolve();
      };
      
      testUtterance.onerror = (event) => {
        console.error('Test audio failed:', event.error);
        resolve(); // Resolve anyway to continue
      };
      
      console.log('Playing test audio...');
      speechSynthesis.speak(testUtterance);
      
      // Fallback resolve
      setTimeout(resolve, 2000);
    } catch (error) {
      console.error('Test audio error:', error);
      resolve();
    }
  });
};

// Test audio functionality with detailed logging
export const testAudio = async (): Promise<boolean> => {
  console.log('=== AUDIO TEST STARTING ===');
  
  try {
    // Check basic support
    const speechSynthesisSupported = 'speechSynthesis' in window;
    const audioContextSupported = 'AudioContext' in window || 'webkitAudioContext' in window;
    
    console.log('Speech Synthesis supported:', speechSynthesisSupported);
    console.log('AudioContext supported:', audioContextSupported);
    console.log('User interaction received:', userInteractionReceived);
    console.log('Audio initialized:', audioInitialized);
    console.log('Audio enabled:', isAudioEnabled);
    
    if (!userInteractionReceived) {
      console.warn('No user interaction received yet - audio may not work');
    }
    
    // Enable audio if not already enabled
    if (!isAudioEnabled) {
      await enableAudio();
    }
    
    // Test audio context
    if (audioContext) {
      console.log('Audio context state:', audioContext.state);
      console.log('Audio context sample rate:', audioContext.sampleRate);
      
      if (audioContext.state === 'suspended') {
        console.log('Resuming suspended audio context...');
        await audioContext.resume();
        console.log('Audio context resumed, new state:', audioContext.state);
      }
    }
    
    // Test speech synthesis
    if (speechSynthesisSupported) {
      const voices = speechSynthesis.getVoices();
      console.log('Available voices:', voices.length);
      
      if (voices.length > 0) {
        voices.forEach((voice, index) => {
          console.log(`Voice ${index}: ${voice.name} (${voice.lang}) - Default: ${voice.default}, Local: ${voice.localService}`);
        });
        
        const selectedVoice = selectVoice();
        if (selectedVoice) {
          console.log('Selected voice:', selectedVoice.name, selectedVoice.lang);
        }
      }
      
      console.log('Speech synthesis speaking:', speechSynthesis.speaking);
      console.log('Speech synthesis pending:', speechSynthesis.pending);
      console.log('Speech synthesis paused:', speechSynthesis.paused);
    }
    
    console.log('=== AUDIO TEST COMPLETED SUCCESSFULLY ===');
    return true;
    
  } catch (error) {
    console.error('=== AUDIO TEST FAILED ===', error);
    return false;
  }
};

// Complete number mapping for better pronunciation
const englishNumbers: Record<number, string> = {
  1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
  6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
  11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen',
  16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen', 20: 'twenty',
  21: 'twenty one', 22: 'twenty two', 23: 'twenty three', 24: 'twenty four', 25: 'twenty five',
  26: 'twenty six', 27: 'twenty seven', 28: 'twenty eight', 29: 'twenty nine', 30: 'thirty',
  31: 'thirty one', 32: 'thirty two', 33: 'thirty three', 34: 'thirty four', 35: 'thirty five',
  36: 'thirty six', 37: 'thirty seven', 38: 'thirty eight', 39: 'thirty nine', 40: 'forty',
  41: 'forty one', 42: 'forty two', 43: 'forty three', 44: 'forty four', 45: 'forty five',
  46: 'forty six', 47: 'forty seven', 48: 'forty eight', 49: 'forty nine', 50: 'fifty',
  51: 'fifty one', 52: 'fifty two', 53: 'fifty three', 54: 'fifty four', 55: 'fifty five',
  56: 'fifty six', 57: 'fifty seven', 58: 'fifty eight', 59: 'fifty nine', 60: 'sixty',
  61: 'sixty one', 62: 'sixty two', 63: 'sixty three', 64: 'sixty four', 65: 'sixty five',
  66: 'sixty six', 67: 'sixty seven', 68: 'sixty eight', 69: 'sixty nine', 70: 'seventy',
  71: 'seventy one', 72: 'seventy two', 73: 'seventy three', 74: 'seventy four', 75: 'seventy five',
  76: 'seventy six', 77: 'seventy seven', 78: 'seventy eight', 79: 'seventy nine', 80: 'eighty',
  81: 'eighty one', 82: 'eighty two', 83: 'eighty three', 84: 'eighty four', 85: 'eighty five',
  86: 'eighty six', 87: 'eighty seven', 88: 'eighty eight', 89: 'eighty nine', 90: 'ninety',
  91: 'ninety one', 92: 'ninety two', 93: 'ninety three', 94: 'ninety four', 95: 'ninety five',
  96: 'ninety six', 97: 'ninety seven', 98: 'ninety eight', 99: 'ninety nine', 100: 'one hundred'
};

// Enhanced voice selection for mobile browsers
const selectVoice = (): SpeechSynthesisVoice | null => {
  const voices = speechSynthesis.getVoices();
  
  if (voices.length === 0) {
    console.warn('No voices available');
    return null;
  }
  
  const userAgent = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  const isSafari = /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent);
  
  console.log('Device detection:', { isMobile, isIOS, isAndroid, isSafari });
  
  let selectedVoice: SpeechSynthesisVoice | null = null;
  
  if (isIOS) {
    // For iOS, prefer specific built-in voices
    selectedVoice = voices.find(voice => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      return lang.includes('en-us') && 
             (name.includes('samantha') || name.includes('alex') || name.includes('karen') || voice.default);
    }) || null;
  } else if (isAndroid) {
    // For Android, prefer Google TTS voices
    selectedVoice = voices.find(voice => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      return lang.includes('en-us') && 
             (name.includes('google') || name.includes('speech') || voice.default);
    }) || null;
  }
  
  // Fallback 1: Any English voice
  if (!selectedVoice) {
    selectedVoice = voices.find(voice => {
      const lang = voice.lang.toLowerCase();
      return lang.includes('en-us') || lang.includes('en-gb') || lang.includes('en');
    }) || null;
  }
  
  // Fallback 2: Default voice
  if (!selectedVoice) {
    selectedVoice = voices.find(voice => voice.default) || null;
  }
  
  // Fallback 3: First available voice
  if (!selectedVoice && voices.length > 0) {
    selectedVoice = voices[0];
  }
  
  if (selectedVoice) {
    console.log('Selected voice:', selectedVoice.name, '(' + selectedVoice.lang + ')', 'Default:', selectedVoice.default);
  } else {
    console.warn('No suitable voice found');
  }
  
  return selectedVoice;
};

// Process the speech queue sequentially with better error handling
const processQueue = async (): Promise<void> => {
  if (isProcessingQueue || speechQueue.length === 0) {
    return;
  }

  console.log('Processing speech queue, items:', speechQueue.length);
  isProcessingQueue = true;

  while (speechQueue.length > 0) {
    const item = speechQueue.shift();
    if (!item) continue;

    console.log('Speaking:', item.text);
    await speakTextImmediate(item.text, item.rate, item.volume);
    item.resolve();
    
    // Add a delay between speeches
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  isProcessingQueue = false;
  console.log('Speech queue processing completed');
};

// Enhanced immediate speech function
const speakTextImmediate = (text: string, rate: number = 1.0, volume: number = 0.8): Promise<void> => {
  return new Promise((resolve) => {
    console.log('speakTextImmediate called with:', text, 'rate:', rate, 'volume:', volume);
    
    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported');
      resolve();
      return;
    }

    // Skip empty text
    if (!text.trim()) {
      console.warn('Empty text provided to speech');
      resolve();
      return;
    }
    
    // Check if audio is enabled
    if (!isAudioEnabled) {
      console.warn('Audio not enabled, attempting to enable...');
      enableAudio().then(() => {
        // Retry after enabling
        speakTextImmediate(text, rate, volume).then(resolve);
      }).catch(() => {
        console.error('Failed to enable audio');
        resolve();
      });
      return;
    }
    
    try {
      // Cancel any ongoing speech
      if (speechSynthesis.speaking) {
        console.log('Cancelling ongoing speech');
        speechSynthesis.cancel();
        // Wait a bit for cancellation to complete
        setTimeout(() => {
          proceedWithSpeech();
        }, 100);
      } else {
        proceedWithSpeech();
      }
      
      function proceedWithSpeech() {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = Math.max(0.1, Math.min(10, rate)); // Clamp rate
        utterance.volume = Math.max(0, Math.min(1, volume)); // Clamp volume
        utterance.pitch = 1.0;
        
        // Set voice
        const voice = selectVoice();
        if (voice) {
          utterance.voice = voice;
          console.log('Using voice:', voice.name);
        } else {
          console.warn('No voice selected');
        }
        
        let hasEnded = false;
        
        // Add event listeners
        utterance.onstart = () => {
          console.log('Speech started successfully:', text);
        };
        
        utterance.onend = () => {
          if (!hasEnded) {
            hasEnded = true;
            console.log('Speech ended successfully:', text);
            resolve();
          }
        };
        
        utterance.onerror = (event) => {
          if (!hasEnded) {
            hasEnded = true;
            console.error('Speech error:', event.error, 'for text:', text);
            resolve(); // Always resolve to continue app flow
          }
        };
        
        // Speak the utterance
        console.log('Calling speechSynthesis.speak...');
        speechSynthesis.speak(utterance);
        
        // Enhanced fallback timeout
        const timeoutDuration = Math.max(5000, text.length * 150);
        setTimeout(() => {
          if (!hasEnded) {
            hasEnded = true;
            console.warn('Speech timeout for:', text);
            speechSynthesis.cancel();
            resolve();
          }
        }, timeoutDuration);
      }
      
    } catch (error) {
      console.error('Error in speakTextImmediate:', error);
      resolve();
    }
  });
};

// Queue-based speak text function
const speakText = (text: string, rate: number = 1.0, volume: number = 0.8): Promise<void> => {
  return new Promise((resolve) => {
    console.log('speakText called:', text);
    
    // Skip empty text
    if (!text.trim()) {
      resolve();
      return;
    }

    // Add to queue
    speechQueue.push({ text, rate, volume, resolve });
    console.log('Added to speech queue, total items:', speechQueue.length);
    
    // Process queue
    processQueue();
  });
};

// Enhanced count sound with better logging
export const playCountSound = async (count: number): Promise<void> => {
  console.log('playCountSound called with count:', count);
  
  if (count >= 1 && count <= 100) {
    const countWord = englishNumbers[count];
    if (countWord) {
      console.log('Playing count sound for:', countWord);
      try {
        await speakText(countWord, 1.2, 0.9);
        console.log('Count sound completed for:', countWord);
      } catch (error) {
        console.error('Error playing count sound:', error);
      }
    } else {
      console.error('No word found for count:', count);
    }
  } else {
    console.warn('Count out of range (1-100):', count);
  }
};

export const playAnnouncement = async (text: string): Promise<void> => {
  console.log('playAnnouncement called with text:', text);
  try {
    await speakText(text, 1.0, 0.9);
    console.log('Announcement completed:', text);
  } catch (error) {
    console.error('Error playing announcement:', error);
  }
};

export const stopAllAudio = (): void => {
  console.log('stopAllAudio called');
  
  // Clear the queue
  speechQueue.length = 0;
  isProcessingQueue = false;
  
  // Cancel any ongoing speech
  if (speechSynthesis.speaking) {
    console.log('Cancelling ongoing speech');
    speechSynthesis.cancel();
  }
  
  console.log('All audio stopped');
};

// Enhanced debug info
export const getAudioState = () => {
  const state = {
    userInteractionReceived,
    audioInitialized,
    isAudioEnabled,
    audioContextState: audioContext?.state || 'not created',
    audioContextSampleRate: audioContext?.sampleRate || 'N/A',
    speechSynthesisSupported: 'speechSynthesis' in window,
    speechSynthesisState: {
      speaking: speechSynthesis?.speaking || false,
      pending: speechSynthesis?.pending || false,
      paused: speechSynthesis?.paused || false,
    },
    voicesCount: speechSynthesis ? speechSynthesis.getVoices().length : 0,
    selectedVoice: selectVoice()?.name || 'none',
    queueLength: speechQueue.length,
    isProcessingQueue,
    userAgent: navigator.userAgent,
    deviceInfo: {
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      isAndroid: /Android/i.test(navigator.userAgent),
      isSafari: /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent),
    }
  };
  
  console.log('Audio State:', state);
  return state;
};

// Force user interaction for mobile browsers
export const forceUserInteraction = async (): Promise<void> => {
  console.log('forceUserInteraction called');
  userInteractionReceived = true;
  await enableAudio();
};
// AudioUtils.tsx - Fixed version with better mobile support
let audioContext: AudioContext | null = null;
let isAudioEnabled = false;
let speechQueue: Array<{ text: string; rate: number; volume: number; resolve: () => void }> = [];
let isProcessingQueue = false;
let voicesLoaded = false;

// Detect mobile device
const isMobileDevice = (): boolean => {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Initialize audio context after user interaction
const initAudioContext = async (): Promise<void> => {
  console.log('Initializing audio context...');
  
  if (!audioContext) {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContext = new AudioContext();
      console.log('Audio context created, state:', audioContext.state);
    } catch (error) {
      console.error('Failed to create audio context:', error);
      return;
    }
  }
  
  // Always try to resume audio context
  if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
      console.log('Audio context resumed, new state:', audioContext.state);
    } catch (error) {
      console.error('Failed to resume audio context:', error);
    }
  }
  
  isAudioEnabled = true;
  console.log('Audio initialization completed');
};

// Load voices and wait for them to be available
const ensureVoicesLoaded = (): Promise<void> => {
  return new Promise((resolve) => {
    if (voicesLoaded) {
      resolve();
      return;
    }

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      console.log('Voices available:', voices.length);
      
      if (voices.length > 0) {
        voicesLoaded = true;
        console.log('Voices loaded successfully');
        resolve();
      } else {
        // For mobile, try again after a short delay
        if (isMobileDevice()) {
          setTimeout(() => {
            const retryVoices = speechSynthesis.getVoices();
            if (retryVoices.length > 0) {
              voicesLoaded = true;
              console.log('Voices loaded on retry');
            }
            resolve(); // Resolve anyway to avoid hanging
          }, 500);
        } else {
          resolve();
        }
      }
    };

    // Check if voices are already loaded
    loadVoices();
    
    // Listen for voices changed event (mainly for Chrome)
    speechSynthesis.addEventListener('voiceschanged', loadVoices, { once: true });
    
    // Fallback timeout
    setTimeout(() => {
      if (!voicesLoaded) {
        console.warn('Voice loading timeout, proceeding anyway');
        voicesLoaded = true;
        resolve();
      }
    }, 2000);
  });
};

// Enable audio after user interaction with enhanced mobile support
export const enableAudio = async (): Promise<void> => {
  console.log('Enabling audio...');
  
  // Initialize audio context
  await initAudioContext();
  
  // Test speech synthesis availability
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech first
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    // Ensure voices are loaded
    await ensureVoicesLoaded();
    
    // For mobile devices, create a test utterance to "prime" the speech synthesis
    if (isMobileDevice()) {
      try {
        const testUtterance = new SpeechSynthesisUtterance(' ');
        testUtterance.volume = 0;
        testUtterance.rate = 0.1;
        speechSynthesis.speak(testUtterance);
        
        // Cancel it immediately
        setTimeout(() => {
          if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
          }
        }, 100);
        
        console.log('Mobile speech synthesis primed');
      } catch (error) {
        console.warn('Failed to prime speech synthesis:', error);
      }
    }
  } else {
    console.warn('Speech synthesis not supported');
  }
  
  console.log('Audio enablement completed');
};

// Test audio functionality with mobile-specific checks
export const testAudio = async (): Promise<boolean> => {
  try {
    console.log('Testing audio functionality...');
    
    // Ensure audio is enabled
    await enableAudio();
    
    // Test audio context
    if (audioContext) {
      console.log('Audio context state:', audioContext.state);
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('Audio context resumed during test');
      }
    }
    
    // Test speech synthesis
    if ('speechSynthesis' in window) {
      const voices = speechSynthesis.getVoices();
      console.log('Available voices:', voices.length);
      
      if (voices.length === 0 && isMobileDevice()) {
        console.log('No voices loaded on mobile, trying to trigger voice loading...');
        // Try to trigger voice loading
        speechSynthesis.speak(new SpeechSynthesisUtterance(''));
        speechSynthesis.cancel();
        
        // Wait a bit and check again
        await new Promise(resolve => setTimeout(resolve, 500));
        const retryVoices = speechSynthesis.getVoices();
        console.log('Voices after retry:', retryVoices.length);
      }
    }
    
    console.log('Audio test completed successfully');
    return true;
  } catch (error) {
    console.error('Audio test failed:', error);
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

// Enhanced voice selection with better mobile support
const selectVoice = (): SpeechSynthesisVoice | null => {
  const voices = speechSynthesis.getVoices();
  
  if (voices.length === 0) {
    console.warn('No voices available');
    return null;
  }
  
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);
  
  let selectedVoice: SpeechSynthesisVoice | null = null;
  
  console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
  
  if (isIOS) {
    // iOS voice preferences
    selectedVoice = voices.find(voice => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      return (lang.includes('en-us') || lang.includes('en')) && 
             (name.includes('alex') || name.includes('samantha') || voice.default);
    }) || null;
  } else if (isAndroid) {
    // Android voice preferences
    selectedVoice = voices.find(voice => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      return (lang.includes('en-us') || lang.includes('en')) && 
             (name.includes('google') || name.includes('english') || voice.default);
    }) || null;
  } else {
    // Desktop preferences
    selectedVoice = voices.find(voice => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      return (lang.includes('en-us') || lang.includes('en')) &&
             (name.includes('male') || name.includes('david') || name.includes('mark'));
    }) || null;
  }
  
  // Fallback to any English voice
  if (!selectedVoice) {
    selectedVoice = voices.find(voice => {
      const lang = voice.lang.toLowerCase();
      return lang.includes('en');
    }) || null;
  }
  
  // Final fallback to default or first available voice
  if (!selectedVoice) {
    selectedVoice = voices.find(voice => voice.default) || voices[0] || null;
  }
  
  if (selectedVoice) {
    console.log('Selected voice:', selectedVoice.name, selectedVoice.lang);
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

    try {
      await speakTextImmediate(item.text, item.rate, item.volume);
      item.resolve();
    } catch (error) {
      console.error('Error processing queue item:', error);
      item.resolve(); // Resolve anyway to continue
    }
    
    // Add a delay between speeches for mobile stability
    const delay = isMobileDevice() ? 300 : 100;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  isProcessingQueue = false;
  console.log('Speech queue processing completed');
};

// Enhanced immediate speech function with mobile optimizations
const speakTextImmediate = (text: string, rate: number = 1.0, volume: number = 0.8): Promise<void> => {
  return new Promise((resolve) => {
    console.log('Speaking text:', text);
    
    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      resolve();
      return;
    }

    // Skip empty text
    if (!text.trim()) {
      console.log('Empty text, skipping');
      resolve();
      return;
    }
    
    // Ensure audio is enabled
    if (!isAudioEnabled) {
      console.log('Audio not enabled, trying to enable...');
      enableAudio().then(() => {
        // Retry after enabling
        speakTextImmediate(text, rate, volume).then(resolve);
      }).catch(() => {
        console.warn('Failed to enable audio');
        resolve();
      });
      return;
    }
    
    try {
      // Cancel any ongoing speech
      if (speechSynthesis.speaking || speechSynthesis.pending) {
        speechSynthesis.cancel();
        // Wait a bit for cancellation to complete on mobile
        if (isMobileDevice()) {
          setTimeout(() => proceedWithSpeech(), 200);
          return;
        }
      }
      
      proceedWithSpeech();
      
    } catch (error) {
      console.error('Error in speech preparation:', error);
      resolve();
    }
    
    function proceedWithSpeech() {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set speech parameters with mobile optimizations
        utterance.rate = isMobileDevice() ? Math.max(0.8, rate * 0.9) : rate;
        utterance.volume = volume;
        utterance.pitch = 1.0;
        
        // Set voice
        const voice = selectVoice();
        if (voice) {
          utterance.voice = voice;
        }
        
        let hasEnded = false;
        const cleanup = () => {
          if (hasEnded) return;
          hasEnded = true;
          resolve();
        };
        
        // Add event listeners
        utterance.onstart = () => {
          console.log('Speech started:', text);
        };
        
        utterance.onend = () => {
          console.log('Speech ended:', text);
          cleanup();
        };
        
        utterance.onerror = (event) => {
          if (event.error !== 'interrupted') {
            console.error('Speech error:', event.error, 'for text:', text);
          }
          cleanup();
        };
        
        // Speak the utterance
        speechSynthesis.speak(utterance);
        
        // Enhanced fallback timeout for mobile
        const timeout = isMobileDevice() ? 
          Math.max(5000, text.length * 150) : 
          Math.max(3000, text.length * 100);
          
        setTimeout(() => {
          if (!hasEnded) {
            console.warn('Speech timeout for:', text);
            if (speechSynthesis.speaking) {
              speechSynthesis.cancel();
            }
            cleanup();
          }
        }, timeout);
        
      } catch (error) {
        console.error('Error creating speech utterance:', error);
        resolve();
      }
    }
  });
};

// Queue-based speak text function
const speakText = async (text: string, rate: number = 1.0, volume: number = 0.8): Promise<void> => {
  return new Promise((resolve) => {
    // Skip empty text
    if (!text.trim()) {
      resolve();
      return;
    }

    console.log('Queueing speech:', text);
    
    // Add to queue
    speechQueue.push({ text, rate, volume, resolve });
    
    // Process queue
    processQueue();
  });
};

// Enhanced count sound with extended range
export const playCountSound = async (count: number): Promise<void> => {
  if (count >= 1 && count <= 100) {
    const countWord = englishNumbers[count];
    if (countWord) {
      try {
        console.log('Playing count sound:', count, countWord);
        await speakText(countWord, 1.2, 0.8);
      } catch (error) {
        console.error('Error playing count sound:', error);
      }
    }
  } else {
    console.warn('Count out of range (1-100):', count);
  }
};

export const playAnnouncement = async (text: string): Promise<void> => {
  console.log('playAnnouncement called:', text);
  
  // Ensure audio is enabled before speaking
  if (!isAudioEnabled) {
    console.log('Audio not enabled, enabling before announcement...');
    await enableAudio();
  }
  
  try {
    await speakText(text, 1.0, 0.9);
    console.log('Announcement queued successfully:', text);
  } catch (error) {
    console.error('Error playing announcement:', error);
  }
};

export const stopAllAudio = (): void => {
  console.log('Stopping all audio');
  
  // Clear the queue
  speechQueue.length = 0;
  isProcessingQueue = false;
  
  // Cancel any ongoing speech
  if ('speechSynthesis' in window && speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
};

// Get audio context state for debugging
export const getAudioState = () => {
  return {
    isAudioEnabled,
    audioContextState: audioContext?.state,
    speechSynthesisSupported: 'speechSynthesis' in window,
    voicesCount: speechSynthesis.getVoices().length,
    voicesLoaded,
    queueLength: speechQueue.length,
    isProcessingQueue,
    isMobileDevice: isMobileDevice(),
    speechSynthesisState: {
      speaking: speechSynthesis.speaking,
      pending: speechSynthesis.pending,
      paused: speechSynthesis.paused
    }
  };
};
// AudioUtils.tsx - Fixed version with proper mobile audio support
let audioContext: AudioContext | null = null;
let isAudioEnabled = false;
let speechQueue: Array<{ text: string; rate: number; volume: number; resolve: () => void }> = [];
let isProcessingQueue = false;
let hasUserInteracted = false;
let audioInitializationAttempts = 0;

// Initialize audio context after user interaction
const initAudioContext = async (): Promise<void> => {
  if (!audioContext) {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContext = new AudioContext();
      
      console.log('AudioContext created, initial state:', audioContext.state);
      
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        console.log('AudioContext suspended, attempting to resume...');
        await audioContext.resume();
        console.log('AudioContext resumed, new state:', audioContext.state);
      }
      
      isAudioEnabled = true;
      console.log('Audio context initialized successfully, state:', audioContext.state);
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  } else if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
      console.log('Existing AudioContext resumed, state:', audioContext.state);
    } catch (error) {
      console.error('Failed to resume audio context:', error);
    }
  }
};

// Enable audio after user interaction with better mobile support
export const enableAudio = async (): Promise<void> => {
  console.log('enableAudio called, attempt:', ++audioInitializationAttempts);
  hasUserInteracted = true;
  
  await initAudioContext();
  
  // Test speech synthesis availability
  if ('speechSynthesis' in window) {
    console.log('SpeechSynthesis available');
    
    // Cancel any pending speech first
    speechSynthesis.cancel();
    
    // Load voices if not already loaded
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      console.log('Voices loaded:', voices.length);
      if (voices.length > 0) {
        console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang, default: v.default })));
        return true;
      }
      return false;
    };
    
    if (!loadVoices()) {
      console.log('Voices not loaded yet, waiting for voiceschanged event...');
      speechSynthesis.addEventListener('voiceschanged', () => {
        console.log('Voices changed event fired');
        loadVoices();
      }, { once: true });
    }
    
    // Test with a silent utterance to "prime" the speech synthesis for mobile
    try {
      const testUtterance = new SpeechSynthesisUtterance(' '); // Single space instead of empty
      testUtterance.volume = 0.01; // Very low volume instead of 0
      testUtterance.rate = 2; // Fast rate
      testUtterance.pitch = 1;
      
      testUtterance.onstart = () => {
        console.log('Priming utterance started successfully - audio is ready');
        isAudioEnabled = true;
      };
      
      testUtterance.onend = () => {
        console.log('Priming utterance ended successfully');
      };
      
      testUtterance.onerror = (event) => {
        console.log('Priming utterance error (may be normal):', event.error);
        // Still consider audio enabled even if priming fails
        isAudioEnabled = true;
      };
      
      speechSynthesis.speak(testUtterance);
      console.log('Priming utterance queued');
    } catch (error) {
      console.error('Error with priming utterance:', error);
      // Still mark as enabled to allow attempts
      isAudioEnabled = true;
    }
  } else {
    console.error('SpeechSynthesis not available in this browser');
  }
};

// Test audio functionality with comprehensive debugging
export const testAudio = async (): Promise<boolean> => {
  try {
    console.log('=== AUDIO TEST START ===');
    console.log('User agent:', navigator.userAgent);
    console.log('Has user interacted:', hasUserInteracted);
    console.log('Audio enabled:', isAudioEnabled);
    
    await enableAudio();
    
    // Test audio context
    if (audioContext) {
      console.log('AudioContext state:', audioContext.state);
      console.log('AudioContext sample rate:', audioContext.sampleRate);
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('AudioContext resumed, new state:', audioContext.state);
      }
    }
    
    // Test speech synthesis
    if ('speechSynthesis' in window) {
      const voices = speechSynthesis.getVoices();
      console.log('Speech synthesis voices count:', voices.length);
      console.log('Speech synthesis speaking:', speechSynthesis.speaking);
      console.log('Speech synthesis pending:', speechSynthesis.pending);
      console.log('Speech synthesis paused:', speechSynthesis.paused);
      
      // Test with actual speech
      return new Promise((resolve) => {
        const testUtterance = new SpeechSynthesisUtterance('test');
        testUtterance.volume = 0.1;
        testUtterance.rate = 2;
        testUtterance.pitch = 1;
        
        const voice = selectVoice();
        if (voice) {
          testUtterance.voice = voice;
          console.log('Using voice:', voice.name, voice.lang);
        }
        
        let resolved = false;
        const resolveOnce = (result: boolean) => {
          if (!resolved) {
            resolved = true;
            console.log('Audio test result:', result);
            console.log('=== AUDIO TEST END ===');
            resolve(result);
          }
        };
        
        testUtterance.onstart = () => {
          console.log('Test speech started successfully');
          resolveOnce(true);
        };
        
        testUtterance.onend = () => {
          console.log('Test speech ended');
          if (!resolved) resolveOnce(true);
        };
        
        testUtterance.onerror = (event) => {
          console.error('Test speech error:', event.error);
          resolveOnce(false);
        };
        
        try {
          speechSynthesis.speak(testUtterance);
          console.log('Test utterance queued');
          
          // Timeout fallback
          setTimeout(() => {
            resolveOnce(false);
          }, 3000);
        } catch (error) {
          console.error('Error speaking test utterance:', error);
          resolveOnce(false);
        }
      });
    } else {
      console.error('Speech synthesis not supported');
      console.log('=== AUDIO TEST END ===');
      return false;
    }
  } catch (error) {
    console.error('Audio test failed:', error);
    console.log('=== AUDIO TEST END ===');
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

// Enhanced voice selection with mobile optimization
const selectVoice = (): SpeechSynthesisVoice | null => {
  const voices = speechSynthesis.getVoices();
  
  if (voices.length === 0) {
    console.log('No voices available');
    return null;
  }
  
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);
  
  console.log('Voice selection - Mobile:', isMobile, 'iOS:', isIOS, 'Android:', isAndroid);
  
  let selectedVoice: SpeechSynthesisVoice | null = null;
  
  if (isIOS) {
    // For iOS, prefer built-in English voices
    selectedVoice = voices.find(voice => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      return (lang.includes('en-us') || lang.includes('en-gb')) && 
             (name.includes('samantha') || name.includes('alex') || name.includes('daniel') || voice.default);
    }) || null;
    
    if (!selectedVoice) {
      // Fallback to any English voice on iOS
      selectedVoice = voices.find(voice => voice.lang.toLowerCase().includes('en')) || null;
    }
  } else if (isAndroid) {
    // For Android, prefer Google voices or default
    selectedVoice = voices.find(voice => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      return (lang.includes('en-us') || lang.includes('en-gb')) && 
             (name.includes('google') || name.includes('english') || voice.default);
    }) || null;
    
    if (!selectedVoice) {
      // Fallback to any English voice on Android
      selectedVoice = voices.find(voice => voice.lang.toLowerCase().includes('en')) || null;
    }
  } else {
    // For desktop
    selectedVoice = voices.find(voice => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      return (name.includes('male') || 
              name.includes('david') || 
              name.includes('mark') || 
              name.includes('alex')) && 
            (lang.includes('en') || lang.includes('id'));
    }) || null;
  }
  
  // Final fallback to any available voice
  if (!selectedVoice && voices.length > 0) {
    selectedVoice = voices.find(voice => voice.default) || voices[0];
  }
  
  if (selectedVoice) {
    console.log('Selected voice:', selectedVoice.name, selectedVoice.lang, 'default:', selectedVoice.default);
  } else {
    console.log('No suitable voice found');
  }
  
  return selectedVoice;
};

// Process the speech queue sequentially
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
      item.resolve();
    }
    
    // Add a small delay between speeches to prevent interruption
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  isProcessingQueue = false;
  console.log('Speech queue processing completed');
};

// Enhanced immediate speech function with better mobile support
const speakTextImmediate = (text: string, rate: number = 1.0, volume: number = 0.8): Promise<void> => {
  return new Promise((resolve) => {
    console.log('speakTextImmediate called:', text, 'rate:', rate, 'volume:', volume);
    
    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      resolve();
      return;
    }

    // Skip empty text
    if (!text.trim()) {
      console.log('Empty text, skipping speech');
      resolve();
      return;
    }
    
    // Ensure user has interacted and audio is enabled
    if (!hasUserInteracted) {
      console.warn('No user interaction yet, audio may not work');
    }
    
    // Enable audio context if not already enabled
    if (!isAudioEnabled) {
      console.log('Audio not enabled, attempting to initialize...');
      initAudioContext();
    }
    
    try {
      // Cancel any pending speech first
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = Math.max(0.1, Math.min(2.0, rate)); // Clamp rate
      utterance.volume = Math.max(0, Math.min(1, volume)); // Clamp volume
      utterance.pitch = 1.0;
      
      // Set voice
      const voice = selectVoice();
      if (voice) {
        utterance.voice = voice;
      }
      
      let resolved = false;
      const resolveOnce = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };
      
      // Add event listeners with better error handling
      utterance.onstart = () => {
        console.log('Speech started:', text);
      };
      
      utterance.onend = () => {
        console.log('Speech ended:', text);
        resolveOnce();
      };
      
      utterance.onerror = (event) => {
        // Only log actual errors, not interruptions
        if (event.error !== 'interrupted') {
          console.error('Speech error:', event.error, 'for text:', text);
        } else {
          console.log('Speech interrupted (normal):', text);
        }
        resolveOnce(); // Always resolve to continue app flow
      };
      
      // Speak the utterance
      speechSynthesis.speak(utterance);
      console.log('Utterance queued for speech');
      
      // Enhanced fallback timeout based on text length and mobile detection
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const baseTimeout = isMobile ? 5000 : 3000; // Longer timeout for mobile
      const dynamicTimeout = Math.max(baseTimeout, text.length * 150);
      
      setTimeout(() => {
        if (!resolved) {
          console.warn('Speech timeout for:', text);
          resolveOnce();
        }
      }, dynamicTimeout);
      
    } catch (error) {
      console.error('Error speaking text:', error, 'Text:', text);
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

// Enhanced count sound with extended range
export const playCountSound = async (count: number): Promise<void> => {
  console.log('playCountSound called with count:', count);
  
  if (count >= 1 && count <= 100) {
    const countWord = englishNumbers[count];
    if (countWord) {
      try {
        await speakText(countWord, 1.2, 0.8);
        console.log('Count sound played successfully:', countWord);
      } catch (error) {
        console.error('Error playing count sound:', error);
      }
    } else {
      console.warn('No word mapping for count:', count);
    }
  } else {
    console.warn('Count out of range (1-100):', count);
  }
};

export const playAnnouncement = async (text: string): Promise<void> => {
  console.log('playAnnouncement called:', text);
  
  try {
    await speakText(text, 1.0, 0.9);
    console.log('Announcement played successfully:', text);
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
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    console.log('Canceled ongoing speech synthesis');
  }
};

// Get comprehensive audio state for debugging
export const getAudioState = () => {
  const state = {
    isAudioEnabled,
    hasUserInteracted,
    audioInitializationAttempts,
    audioContextState: audioContext?.state || 'not created',
    audioContextSampleRate: audioContext?.sampleRate || 'N/A',
    speechSynthesisSupported: 'speechSynthesis' in window,
    speechSynthesisSpeaking: speechSynthesis.speaking,
    speechSynthesisPending: speechSynthesis.pending,
    speechSynthesisPaused: speechSynthesis.paused,
    voicesCount: speechSynthesis.getVoices().length,
    queueLength: speechQueue.length,
    isProcessingQueue,
    userAgent: navigator.userAgent,
    isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/i.test(navigator.userAgent),
    selectedVoice: selectVoice()?.name || 'None'
  };
  
  console.log('Current audio state:', state);
  return state;
};
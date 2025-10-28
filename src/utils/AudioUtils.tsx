// AudioUtils.tsx
let audioContext: AudioContext | null = null;
let isAudioEnabled = false;
let speechQueue: Array<{ text: string; rate: number; volume: number; resolve: () => void }> = [];
let isProcessingQueue = false;
let hasUserInteracted = false;
let audioInitializationAttempts = 0;
let selectedVoiceGlobal: SpeechSynthesisVoice | null = null;

// Initialize audio context setelah user interaction
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


const preloadVoices = (): Promise<void> => {
  return new Promise((resolve) => {
    if (speechSynthesis.getVoices().length > 0) {
      console.log('Voices already loaded:', speechSynthesis.getVoices().length);
      resolve();
      return;
    }

    let attempts = 0;
    const maxAttempts = 30; 

    const checkVoices = () => {
      const voices = speechSynthesis.getVoices();
      console.log(`Voice check attempt ${attempts}:`, voices.length);

      if (voices.length > 0) {
        console.log('Voices loaded successfully');
        resolve();
        return;
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkVoices, 100);
      } else {
        console.warn('Timeout waiting for voices');
        resolve();
      }
    };

    const voicesChangedHandler = () => {
      console.log('voiceschanged event fired');
      resolve();
    };

    speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler, { once: true });
    checkVoices();
  });
};


const selectVoiceOptimized = (): SpeechSynthesisVoice | null => {
  const voices = speechSynthesis.getVoices();
  
  if (voices.length === 0) {
    console.log('No voices available');
    return null;
  }

  console.log('=== VOICE SELECTION DEBUG ===');
  console.log('Total voices available:', voices.length);
  
  // Log semua available voices
  voices.forEach((voice, index) => {
    console.log(`[${index}] ${voice.name} | Lang: ${voice.lang} | Local: ${voice.localService} | Default: ${voice.default}`);
  });

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isChrome = /Chrome/.test(navigator.userAgent) && !/Chromium/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isFirefox = /Firefox/.test(navigator.userAgent);

  console.log(`Platform: iOS=${isIOS}, Android=${isAndroid}, Chrome=${isChrome}, Safari=${isSafari}, Firefox=${isFirefox}`);

  let selectedVoice: SpeechSynthesisVoice | null = null;

  if (isIOS) {
    selectedVoice = voices.find(voice => {
      const name = voice.name.toLowerCase();
      return name.includes('samantha') && voice.lang.includes('en');
    }) || null;
  } else if (isAndroid) {
    selectedVoice = voices.find(voice => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      return name.includes('google') && (lang.includes('en-us') || lang.includes('english'));
    }) || null;
  } else if (isSafari) {
    selectedVoice = voices.find(voice => {
      const name = voice.name.toLowerCase();
      return name.includes('samantha') && voice.lang.includes('en');
    }) || null;
  } else if (isChrome || isFirefox) {
    selectedVoice = voices.find(voice => {
      const name = voice.name.toLowerCase();
      return name.includes('google us english') && voice.lang.includes('en');
    }) || null;
  }

  if (selectedVoice) {
    console.log('✓ Selected voice:', selectedVoice.name, '| Lang:', selectedVoice.lang, '| Local:', selectedVoice.localService);
  }

  console.log('=== END VOICE SELECTION ===');
  return selectedVoice;
};

// Enable audio setelah user interaction
export const enableAudio = async (): Promise<void> => {
  console.log('enableAudio called, attempt:', ++audioInitializationAttempts);
  hasUserInteracted = true;
  
  await initAudioContext();
  
  // Test speech synthesis availability
  if ('speechSynthesis' in window) {
    console.log('SpeechSynthesis available');
    
    // Preload voices dengan proper waiting
    await preloadVoices();
    
    // Cancel any pending speech first
    speechSynthesis.cancel();
    
    // Select dan cache voice untuk consistency
    selectedVoiceGlobal = selectVoiceOptimized();
    
    // Test dengan silent utterance untuk prime speech synthesis
    try {
      const testUtterance = new SpeechSynthesisUtterance(' ');
      testUtterance.volume = 1.0;
      testUtterance.rate = 1.0;
      testUtterance.pitch = 1.0;
      
      if (selectedVoiceGlobal) {
        testUtterance.voice = selectedVoiceGlobal;
      }
      
      testUtterance.onstart = () => {
        console.log('Priming utterance started - audio is ready');
        isAudioEnabled = true;
      };
      
      testUtterance.onerror = (event) => {
        console.log('Priming utterance error (may be normal):', event.error);
        isAudioEnabled = true;
      };
      
      speechSynthesis.speak(testUtterance);
      console.log('Priming utterance queued');
    } catch (error) {
      console.error('Error with priming utterance:', error);
      isAudioEnabled = true;
    }
  } else {
    console.error('SpeechSynthesis not available in this browser');
  }
};

// Complete number mapping untuk pronunciation yang lebih baik
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
    
    // Add delay between speeches
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  isProcessingQueue = false;
  console.log('Speech queue processing completed');
};

const speakTextImmediate = (text: string, rate: number = 1.0, volume: number = 1.0): Promise<void> => {
  return new Promise((resolve) => {
    console.log('speakTextImmediate called:', text, 'rate:', rate, 'volume:', volume);
    
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      resolve();
      return;
    }

    if (!text.trim()) {
      console.log('Empty text, skipping speech');
      resolve();
      return;
    }
    
    if (!hasUserInteracted) {
      console.warn('No user interaction yet');
    }
    
    if (!isAudioEnabled) {
      console.log('Audio not enabled, attempting to initialize...');
      initAudioContext();
    }
    
    try {
      // Cancel previous speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.rate = 1.0
      utterance.volume = 1.0
      utterance.pitch = 1.0;
      utterance.lang = 'en-US'; 
      
      // Use cached voice untuk consistency
      if (selectedVoiceGlobal) {
        utterance.voice = selectedVoiceGlobal;
        console.log('Using cached voice:', selectedVoiceGlobal.name);
      } else {
        // Fallback jika belum ada cached voice
        const voice = selectVoiceOptimized();
        if (voice) {
          utterance.voice = voice;
          selectedVoiceGlobal = voice;
        }
      }
      
      let resolved = false;
      const resolveOnce = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };
      
      utterance.onstart = () => {
        console.log('Speech started:', text);
      };
      
      utterance.onend = () => {
        console.log('Speech ended:', text);
        resolveOnce();
      };
      
      utterance.onerror = (event) => {
        if (event.error !== 'interrupted') {
          console.error('Speech error:', event.error);
        } else {
          console.log('Speech interrupted (normal)');
        }
        resolveOnce();
      };
      
      // Speak
      speechSynthesis.speak(utterance);
      console.log('Utterance queued for speech with voice:', utterance.voice?.name);
      
      // Timeout dengan durasi yang lebih panjang untuk stability
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const baseTimeout = isMobile ? 8000 : 5000;
      const dynamicTimeout = Math.max(baseTimeout, text.length * 200);
      
      setTimeout(() => {
        if (!resolved) {
          console.warn('Speech timeout for:', text);
          speechSynthesis.cancel();
          resolveOnce();
        }
      }, dynamicTimeout);
      
    } catch (error) {
      console.error('Error speaking text:', error);
      resolve();
    }
  });
};

// Queue-based speak text function
const speakText = (text: string, rate: number = 1.0, volume: number = 1.0): Promise<void> => {
  return new Promise((resolve) => {
    console.log('speakText called:', text);
    
    if (!text.trim()) {
      resolve();
      return;
    }

    speechQueue.push({ text, rate, volume, resolve });
    console.log('Added to speech queue, total items:', speechQueue.length);
    
    processQueue();
  });
};

// Enhanced count sound
export const playCountSound = async (count: number): Promise<void> => {
  console.log('playCountSound called with count:', count);
  
  if (count >= 1 && count <= 100) {
    const countWord = englishNumbers[count];
    if (countWord) {
      try {
        await speakText(countWord, 1.0, 1.0); 
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
    await speakText(text, 1.0, 1.0); 
    console.log('Announcement played successfully:', text);
  } catch (error) {
    console.error('Error playing announcement:', error);
  }
};

export const stopAllAudio = (): void => {
  console.log('Stopping all audio');
  
  speechQueue.length = 0;
  isProcessingQueue = false;
  
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    console.log('Canceled ongoing speech synthesis');
  }
};

export const getAudioState = () => {
  const state = {
    isAudioEnabled,
    hasUserInteracted,
    audioInitializationAttempts,
    audioContextState: audioContext?.state || 'not created',
    audioContextSampleRate: audioContext?.sampleRate || 'N/A',
    speechSynthesisSupported: 'speechSynthesis' in window,
    speechSynthesisSpeaking: speechSynthesis.speaking,
    voicesCount: speechSynthesis.getVoices().length,
    cachedVoice: selectedVoiceGlobal?.name || 'None',
    queueLength: speechQueue.length,
    isProcessingQueue,
    userAgent: navigator.userAgent,
  };
  
  console.log('Current audio state:', state);
  return state;
};
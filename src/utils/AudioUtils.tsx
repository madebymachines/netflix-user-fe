// AudioUtils.tsx - Fixed version
let isCurrentlySpeaking = false;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let lastSpokenText = ''; // Track last spoken text

// Enable audio after user interaction
export const enableAudio = (): void => {
  console.log('Audio enabled');
};

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
  46: 'forty six', 47: 'forty seven', 48: 'forty eight', 49: 'forty nine', 50: 'fifty'
};

const speakText = (text: string, force: boolean = false): void => {
  // Skip if same text was just spoken (unless forced)
  if (!force && (isCurrentlySpeaking || text === lastSpokenText)) {
    console.log('Skipping duplicate or overlapping speech:', text);
    return;
  }

  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }

  // Set flag immediately
  isCurrentlySpeaking = true;
  lastSpokenText = text;

  // Cancel any existing speech first
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }

  // Short delay to ensure cancellation
  setTimeout(() => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.volume = 0.8;
      utterance.pitch = 1.0;

      currentUtterance = utterance;

      utterance.onstart = () => {
        console.log('Speech started:', text);
        isCurrentlySpeaking = true;
      };

      utterance.onend = () => {
        console.log('Speech ended:', text);
        isCurrentlySpeaking = false;
        currentUtterance = null;
        // Clear lastSpokenText after completion to allow repeat if needed
        setTimeout(() => {
          if (lastSpokenText === text) {
            lastSpokenText = '';
          }
        }, 1000);
      };

      utterance.onerror = (event) => {
        console.log('Speech error:', event.error, text);
        isCurrentlySpeaking = false;
        currentUtterance = null;
        lastSpokenText = '';
      };

      speechSynthesis.speak(utterance);

      // Safety timeout
      setTimeout(() => {
        if (isCurrentlySpeaking && currentUtterance === utterance) {
          console.log('Speech timeout, force stopping:', text);
          isCurrentlySpeaking = false;
          currentUtterance = null;
          lastSpokenText = '';
          if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
          }
        }
      }, 6000);

    } catch (error) {
      console.error('Speech error:', error);
      isCurrentlySpeaking = false;
      currentUtterance = null;
      lastSpokenText = '';
    }
  }, 150);
};

export const playCountSound = (count: number): void => {
  if (count >= 1 && count <= 50) {
    const countWord = englishNumbers[count];
    if (countWord) {
      speakText(countWord);
    }
  }
};

export const playAnnouncement = (text: string, force: boolean = false): void => {
  console.log('playAnnouncement called:', text, 'force:', force);
  speakText(text, force);
};

export const stopAllAudio = (): void => {
  console.log('Stopping all audio');
  isCurrentlySpeaking = false;
  currentUtterance = null;
  lastSpokenText = '';
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
};
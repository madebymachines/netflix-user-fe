interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility: number;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
}

export class PositionValidator {
  private isPositionValid: boolean = false;
  private validFrames: number = 0;
  private readonly requiredValidFrames: number = 15;
  private hasSpokenPositionGood: boolean = false;
  private lastSpeechTime: number = 0;
  private speechCooldown: number = 5000; // 5 second cooldown
  private debugMode: boolean = false; // Set to true for debugging

  // Detect mobile device
  private get isMobile(): boolean {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Adaptive thresholds based on device
  private get adaptiveThresholds() {
    const isMobile = this.isMobile;
    return {
      minVisibility: isMobile ? 0.3 : 0.5,           // Lebih lenient untuk mobile
      frameMargin: isMobile ? 0.02 : 0.05,           // Margin frame lebih kecil untuk mobile
      minBodyHeight: isMobile ? 0.45 : 0.6,          // Body height lebih rendah untuk mobile
      minBodyWidth: isMobile ? 0.06 : 0.08,          // Body width lebih kecil untuk mobile
      maxBodyMisalignment: isMobile ? 0.12 : 0.08,   // Alignment lebih lenient untuk mobile
      requiredValidFrames: isMobile ? 10 : 15,       // Frames lebih sedikit untuk mobile
      audioTriggerFrame: isMobile ? 7 : 10           // Audio trigger lebih cepat untuk mobile
    };
  }

  enableDebugMode(enabled: boolean = true): void {
    this.debugMode = enabled;
  }

  validatePosition(landmarks: Landmark[]): ValidationResult {
    if (!landmarks || landmarks.length < 33) {
      this.validFrames = 0;
      this.isPositionValid = false;
      this.hasSpokenPositionGood = false;
      return { isValid: false, message: "No person detected" };
    }

    const thresholds = this.adaptiveThresholds;

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    // Check if key landmarks are visible with adaptive threshold
    const keyLandmarks = [leftShoulder, rightShoulder, leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle];
    
    for (let landmark of keyLandmarks) {
      if (!landmark || landmark.visibility < thresholds.minVisibility) {
        this.validFrames = 0;
        this.isPositionValid = false;
        this.hasSpokenPositionGood = false;
        
        if (this.debugMode) {
          console.log('Visibility check failed:', {
            landmark: landmark,
            required: thresholds.minVisibility,
            isMobile: this.isMobile
          });
        }
        
        return { isValid: false, message: "Step back so your whole body is visible" };
      }
    }

    // Adaptive body frame checking
    const minY = Math.min(leftShoulder.y, rightShoulder.y);
    const maxY = Math.max(leftAnkle.y, rightAnkle.y);
    const minX = Math.min(leftShoulder.x, rightShoulder.x, leftHip.x, rightHip.x, leftKnee.x, rightKnee.x, leftAnkle.x, rightAnkle.x);
    const maxX = Math.max(leftShoulder.x, rightShoulder.x, leftHip.x, rightHip.x, leftKnee.x, rightKnee.x, leftAnkle.x, rightAnkle.x);

    const margin = thresholds.frameMargin;
    if (minY < margin || maxY > (1 - margin) || minX < margin || maxX > (1 - margin)) {
      this.validFrames = 0;
      this.isPositionValid = false;
      this.hasSpokenPositionGood = false;
      
      if (this.debugMode) {
        console.log('Frame boundary check failed:', {
          minY, maxY, minX, maxX,
          margin,
          isMobile: this.isMobile
        });
      }
      
      return { isValid: false, message: "Step back so your whole body is visible" };
    }

    // Adaptive body height validation
    const bodyHeight = maxY - minY;
    
    if (bodyHeight < thresholds.minBodyHeight) {
      this.validFrames = 0;
      this.isPositionValid = false;
      this.hasSpokenPositionGood = false;
      
      if (this.debugMode) {
        console.log('Body height check failed:', {
          bodyHeight: bodyHeight.toFixed(3),
          required: thresholds.minBodyHeight,
          isMobile: this.isMobile
        });
      }
      
      return { isValid: false, message: "Step back so your whole body is visible" };
    }

    // Adaptive body width checking
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    const hipWidth = Math.abs(leftHip.x - rightHip.x);
    
    if (shoulderWidth < thresholds.minBodyWidth || hipWidth < thresholds.minBodyWidth) {
      this.validFrames = 0;
      this.isPositionValid = false;
      this.hasSpokenPositionGood = false;
      
      if (this.debugMode) {
        console.log('Body width check failed:', {
          shoulderWidth: shoulderWidth.toFixed(3),
          hipWidth: hipWidth.toFixed(3),
          required: thresholds.minBodyWidth,
          isMobile: this.isMobile
        });
      }
      
      return { isValid: false, message: "Face the camera and get into position" };
    }

    // Adaptive body alignment
    const shoulderCenter = (leftShoulder.x + rightShoulder.x) / 2;
    const hipCenter = (leftHip.x + rightHip.x) / 2;
    const bodyAlignment = Math.abs(shoulderCenter - hipCenter);
    
    if (bodyAlignment > thresholds.maxBodyMisalignment) {
      this.validFrames = 0;
      this.isPositionValid = false;
      this.hasSpokenPositionGood = false;
      
      if (this.debugMode) {
        console.log('Body alignment check failed:', {
          bodyAlignment: bodyAlignment.toFixed(3),
          maxAllowed: thresholds.maxBodyMisalignment,
          isMobile: this.isMobile
        });
      }
      
      return { isValid: false, message: "Stand straight and face the camera" };
    }

    // Position looks good, increment valid frames
    this.validFrames++;
    
    // Debug logging for successful validation
    if (this.debugMode) {
      console.log('Position validation success:', {
        frame: this.validFrames,
        bodyHeight: bodyHeight.toFixed(3),
        shoulderWidth: shoulderWidth.toFixed(3),
        bodyAlignment: bodyAlignment.toFixed(3),
        minVisibility: keyLandmarks.map(l => l?.visibility?.toFixed(3)),
        thresholds: thresholds,
        isMobile: this.isMobile
      });
    }
    
    // Adaptive audio control
    const currentTime = Date.now();
    if (this.validFrames >= thresholds.audioTriggerFrame && 
        !this.hasSpokenPositionGood && 
        (currentTime - this.lastSpeechTime) > this.speechCooldown) {
      
      console.log('Position validator: Speaking "Perfect position"');
      this.hasSpokenPositionGood = true;
      this.lastSpeechTime = currentTime;
      
      // Use timeout and force flag to ensure audio plays
      // setTimeout(() => {
      //   playAnnouncement("Perfect position! Hold steady!");
      // }, 200);
    }
    
    // Adaptive frame requirement check
    if (this.validFrames >= thresholds.requiredValidFrames) {
      this.isPositionValid = true;
      
      if (this.debugMode) {
        console.log('Position fully validated! Device:', this.isMobile ? 'Mobile' : 'Desktop');
      }
      
      return { isValid: true, message: "Perfect position! Ready to start!" };
    } else {
      const remaining = thresholds.requiredValidFrames - this.validFrames;
      return { 
        isValid: false, 
        message: `Hold your position... (${remaining} more frames)` 
      };
    }
  }

  reset(): void {
    console.log('PositionValidator: Resetting all flags');
    this.isPositionValid = false;
    this.validFrames = 0;
    this.hasSpokenPositionGood = false;
    this.lastSpeechTime = 0;
  }

  // Utility method to get current validation status for debugging
  getValidationStatus() {
    const thresholds = this.adaptiveThresholds;
    return {
      validFrames: this.validFrames,
      requiredFrames: thresholds.requiredValidFrames,
      isPositionValid: this.isPositionValid,
      isMobile: this.isMobile,
      thresholds: thresholds
    };
  }
}
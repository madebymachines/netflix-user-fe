import { playAnnouncement } from './AudioUtils';

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

  validatePosition(landmarks: Landmark[]): ValidationResult {
    if (!landmarks || landmarks.length < 33) {
      this.validFrames = 0;
      this.isPositionValid = false;
      this.hasSpokenPositionGood = false;
      return { isValid: false, message: "No person detected" };
    }

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    // Check if key landmarks are visible
    const keyLandmarks = [leftShoulder, rightShoulder, leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle];
    const minVisibility = 0.5;
    
    for (let landmark of keyLandmarks) {
      if (!landmark || landmark.visibility < minVisibility) {
        this.validFrames = 0;
        this.isPositionValid = false;
        this.hasSpokenPositionGood = false;
        return { isValid: false, message: "Step back so your whole body is visible" };
      }
    }

    // Stricter body frame checking
    const minY = Math.min(leftShoulder.y, rightShoulder.y);
    const maxY = Math.max(leftAnkle.y, rightAnkle.y);
    const minX = Math.min(leftShoulder.x, rightShoulder.x, leftHip.x, rightHip.x, leftKnee.x, rightKnee.x, leftAnkle.x, rightAnkle.x);
    const maxX = Math.max(leftShoulder.x, rightShoulder.x, leftHip.x, rightHip.x, leftKnee.x, rightKnee.x, leftAnkle.x, rightAnkle.x);

    if (minY < 0.05 || maxY > 0.95 || minX < 0.05 || maxX > 0.95) {
      this.validFrames = 0;
      this.isPositionValid = false;
      this.hasSpokenPositionGood = false;
      return { isValid: false, message: "Step back so your whole body is visible" };
    }

    // Tambahkan validasi tinggi badan
    const bodyHeight = maxY - minY;
    const minBodyHeight = 0.6;
    
    if (bodyHeight < minBodyHeight) {
      this.validFrames = 0;
      this.isPositionValid = false;
      this.hasSpokenPositionGood = false;
      return { isValid: false, message: "Step back so your whole body is visible" };
    }

    // Stricter body width checking
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    const hipWidth = Math.abs(leftHip.x - rightHip.x);
    const minBodyWidth = 0.08;
    
    if (shoulderWidth < minBodyWidth || hipWidth < minBodyWidth) {
      this.validFrames = 0;
      this.isPositionValid = false;
      this.hasSpokenPositionGood = false;
      return { isValid: false, message: "Face the camera and get into position" };
    }

    // Stricter body alignment
    const shoulderCenter = (leftShoulder.x + rightShoulder.x) / 2;
    const hipCenter = (leftHip.x + rightHip.x) / 2;
    const bodyAlignment = Math.abs(shoulderCenter - hipCenter);
    const maxBodyMisalignment = 0.08;
    
    if (bodyAlignment > maxBodyMisalignment) {
      this.validFrames = 0;
      this.isPositionValid = false;
      this.hasSpokenPositionGood = false;
      return { isValid: false, message: "Stand straight and face the camera" };
    }

    // Position looks good, increment valid frames
    this.validFrames++;
    
    // FIXED: Better audio control with stricter conditions
    const currentTime = Date.now();
    if (this.validFrames >= 10 && 
        !this.hasSpokenPositionGood && 
        (currentTime - this.lastSpeechTime) > this.speechCooldown) {
      
      console.log('Position validator: Speaking "Perfect position"');
      this.hasSpokenPositionGood = true;
      this.lastSpeechTime = currentTime;
      
      // // Use timeout and force flag to ensure audio plays
      // setTimeout(() => {
      //   playAnnouncement("Perfect position! Hold steady!", false);
      // }, 200);
    }
    
    if (this.validFrames >= this.requiredValidFrames) {
      this.isPositionValid = true;
      return { isValid: true, message: "Perfect position! Ready to start!" };
    } else {
      return { isValid: false, message: "Hold your position..." };
    }
  }

  reset(): void {
    console.log('PositionValidator: Resetting all flags');
    this.isPositionValid = false;
    this.validFrames = 0;
    this.hasSpokenPositionGood = false;
    this.lastSpeechTime = 0;
  }
}
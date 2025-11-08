// Interface for landmark data
interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility: number;
}

// Interface for squat counter result
interface SquatCounterResult {
  count: number;
  alert?: string;
  isSquatDown?: boolean;
  newCount?: boolean;
  debug?: string;
}

// Improved Squat Counter Class with Better Validation
export class SquatCounter {
  private count: number = 0;
  private isDown: boolean = false;
  private stateFrames: number = 0;
  private readonly minFrames: number = 3; // Increased from 2 for stability
  
  // PERBAIKAN 1: Threshold yang lebih toleran
  private readonly downKneeAngleThreshold: number = 130; // Turun dari 150
  private readonly upKneeAngleThreshold: number = 155;   // Turun dari 165
  
  private readonly maxKneeAngleDifference: number = 40; // Naikkan dari 30
  private readonly minKneeBend: number = 10; // Turun dari 15
  
  private standingKneeAngle: number | null = null;
  private userMaxSquatDepth: number | null = null;
  private readonly adaptiveMode: boolean = true;
  
  // PERBAIKAN 2: Track confidence untuk smooth transitions
  private downConfidence: number = 0;
  private upConfidence: number = 0;

  private calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return angle;
  }

  private getAdaptiveThreshold(): number {
    if (!this.adaptiveMode || !this.standingKneeAngle || !this.userMaxSquatDepth) {
      return this.downKneeAngleThreshold;
    }
    
    // PERBAIKAN 3: Kalkulasi threshold lebih fleksibel
    const userRange = this.standingKneeAngle - this.userMaxSquatDepth;
    const adaptiveThreshold = this.standingKneeAngle - (userRange * 0.65); // Turun dari 0.7
    
    return Math.min(adaptiveThreshold, this.standingKneeAngle - 15); // Turun dari 20
  }

  private isValidSquatPosition(
    leftKneeAngle: number,
    rightKneeAngle: number,
    avgKneeAngle: number,
    landmarks: Landmark[]
  ): boolean {
    const kneeDifference = Math.abs(leftKneeAngle - rightKneeAngle);
    
    // PERBAIKAN 4: Visibility check lebih lenient
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    if (leftKnee.visibility < 0.25 || rightKnee.visibility < 0.25) {
      return false;
    }

    // Initialize standing position dengan threshold lebih lenient
    if (this.standingKneeAngle === null) {
      if (avgKneeAngle >= 155) { // Turun dari 160
        this.standingKneeAngle = avgKneeAngle;
        console.log(`[SquatCounter] Standing position initialized: ${avgKneeAngle.toFixed(1)}°`);
      }
      return false;
    }

    // Track user's maximum squat depth
    if (this.userMaxSquatDepth === null || avgKneeAngle < this.userMaxSquatDepth) {
      this.userMaxSquatDepth = avgKneeAngle;
    }

    // PERBAIKAN 5: Minimum knee bend check lebih relaxed
    const kneeBend = this.standingKneeAngle - avgKneeAngle;
    if (kneeBend < this.minKneeBend) {
      return false;
    }

    // PERBAIKAN 6: Knee difference tolerance lebih tinggi
    if (kneeDifference > this.maxKneeAngleDifference) {
      return false;
    }

    // Check if knees are below hips
    if (leftKnee.y <= leftHip.y || rightKnee.y <= rightHip.y) {
      return false;
    }

    // PERBAIKAN 7: Horizontal distance check lebih lenient
    const leftHorizontalDistance = Math.abs(leftKnee.x - leftHip.x);
    const rightHorizontalDistance = Math.abs(rightKnee.x - rightHip.x);
    const minHorizontalDistance = 0.02; // Turun dari 0.03

    if (
      leftHorizontalDistance < minHorizontalDistance &&
      rightHorizontalDistance < minHorizontalDistance
    ) {
      return false;
    }

    // Body width check
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    const hipWidth = Math.abs(leftHip.x - rightHip.x);

    const minBodyWidth = 0.04; // Turun dari 0.05
    if (shoulderWidth < minBodyWidth || hipWidth < minBodyWidth) {
      return false;
    }

    // Body alignment check
    const shoulderCenter = (leftShoulder.x + rightShoulder.x) / 2;
    const hipCenter = (leftHip.x + rightHip.x) / 2;
    const bodyAlignment = Math.abs(shoulderCenter - hipCenter);

    const maxBodyMisalignment = 0.2; // Naikkan dari 0.15
    if (bodyAlignment > maxBodyMisalignment) {
      return false;
    }

    // Knee height difference check
    const kneeHeightDifference = Math.abs(leftKnee.y - rightKnee.y);
    const maxKneeHeightDiff = 0.1; // Naikkan dari 0.08
    if (kneeHeightDifference > maxKneeHeightDiff) {
      return false;
    }

    return true;
  }

  processPose(landmarks: Landmark[]): SquatCounterResult {
    if (!landmarks || landmarks.length < 33) {
      return { count: this.count, alert: "No landmarks detected" };
    }

    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];
    const rightHip = landmarks[24];
    const rightKnee = landmarks[26];
    const rightAnkle = landmarks[28];

    if (!leftHip || !leftKnee || !leftAnkle || !rightHip || !rightKnee || !rightAnkle) {
      return { count: this.count, alert: "Key landmarks missing" };
    }

    // PERBAIKAN 8: Visibility requirement lebih rendah
    const minVisibility = 0.1; // Turun dari 0.15
    if (
      leftHip.visibility < minVisibility ||
      leftKnee.visibility < minVisibility ||
      leftAnkle.visibility < minVisibility ||
      rightHip.visibility < minVisibility ||
      rightKnee.visibility < minVisibility ||
      rightAnkle.visibility < minVisibility
    ) {
      return { count: this.count, alert: "Low landmark visibility" };
    }

    const leftKneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle);
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
    const kneeDifference = Math.abs(leftKneeAngle - rightKneeAngle);

    // Update standing position
    if (avgKneeAngle >= 155 && kneeDifference < 25) { // Turun dari 160 dan 20
      this.standingKneeAngle = avgKneeAngle;
    }

    const currentDownThreshold = this.getAdaptiveThreshold();

    // PERBAIKAN 9: State transition dengan confidence system
    if (!this.isDown && avgKneeAngle <= currentDownThreshold) {
      if (this.isValidSquatPosition(leftKneeAngle, rightKneeAngle, avgKneeAngle, landmarks)) {
        this.downConfidence++;
        this.upConfidence = 0; // Reset up confidence
        
        if (this.downConfidence >= this.minFrames) {
          this.isDown = true;
          this.downConfidence = 0;
          return {
            count: this.count,
            isSquatDown: true,
            debug: `Down detected at ${avgKneeAngle.toFixed(1)}°`
          };
        }
      } else {
        this.downConfidence = Math.max(0, this.downConfidence - 1);
      }
    } else if (this.isDown && avgKneeAngle >= this.upKneeAngleThreshold) {
      if (kneeDifference <= this.maxKneeAngleDifference) {
        this.upConfidence++;
        this.downConfidence = 0; // Reset down confidence
        
        if (this.upConfidence >= this.minFrames) {
          this.isDown = false;
          this.count++;
          this.upConfidence = 0;
          return {
            count: this.count,
            newCount: true,
            debug: `Squat counted! Total: ${this.count} at ${avgKneeAngle.toFixed(1)}°`
          };
        }
      } else {
        this.upConfidence = Math.max(0, this.upConfidence - 1);
      }
    } else {
      // Decay confidence scores
      this.downConfidence = Math.max(0, this.downConfidence - 0.5);
      this.upConfidence = Math.max(0, this.upConfidence - 0.5);
    }

    return { count: this.count, newCount: false, isSquatDown: this.isDown };
  }

  resetCount(): void {
    this.count = 0;
    this.isDown = false;
    this.stateFrames = 0;
    this.downConfidence = 0;
    this.upConfidence = 0;
    this.standingKneeAngle = null;
    this.userMaxSquatDepth = null;
  }

  // Debug helper
  getDebugInfo(): object {
    return {
      count: this.count,
      isDown: this.isDown,
      standingKneeAngle: this.standingKneeAngle?.toFixed(1),
      userMaxSquatDepth: this.userMaxSquatDepth?.toFixed(1),
      downConfidence: this.downConfidence,
      upConfidence: this.upConfidence
    };
  }
}
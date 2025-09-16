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
}

// Simplified Squat Counter Class with Better Validation
export class SquatCounter {
  private count: number = 0;
  private isDown: boolean = false;
  private stateFrames: number = 0;
  private readonly minFrames: number = 2;
  
  // More tolerant thresholds
  private readonly downKneeAngleThreshold: number = 150; // Increased from 135
  private readonly upKneeAngleThreshold: number = 165;   // Increased from 160
  
  private readonly maxKneeAngleDifference: number = 30; // Increased from 25
  private readonly minKneeBend: number = 15; // Decreased from 30
  
  private standingKneeAngle: number | null = null;
  
  // Dynamic threshold based on user's range of motion
  private userMaxSquatDepth: number | null = null;
  private readonly adaptiveMode: boolean = true;

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
    
    // Use 70% of user's maximum squat depth as threshold
    const userRange = this.standingKneeAngle - this.userMaxSquatDepth;
    const adaptiveThreshold = this.standingKneeAngle - (userRange * 0.7);
    
    // Ensure it's not too lenient (minimum 20-degree bend)
    return Math.min(adaptiveThreshold, this.standingKneeAngle - 20);
  }

  private isValidSquatPosition(leftKneeAngle: number, rightKneeAngle: number, avgKneeAngle: number, landmarks: Landmark[]): boolean {
    const kneeDifference = Math.abs(leftKneeAngle - rightKneeAngle);
    if (kneeDifference > this.maxKneeAngleDifference) {
      return false;
    }

    // Initialize standing position
    if (this.standingKneeAngle === null) {
      if (avgKneeAngle >= 160) { // Slightly lower threshold
        this.standingKneeAngle = avgKneeAngle;
      }
      return false;
    }

    // Track user's maximum squat depth for adaptive threshold
    if (this.userMaxSquatDepth === null || avgKneeAngle < this.userMaxSquatDepth) {
      this.userMaxSquatDepth = avgKneeAngle;
    }

    const kneeBend = this.standingKneeAngle - avgKneeAngle;
    if (kneeBend < this.minKneeBend) {
      return false;
    }

    // Relaxed landmark visibility check
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    
    // Lower visibility requirement
    if (leftKnee.visibility < 0.3 || rightKnee.visibility < 0.3) {
      return false;
    }
    
    // Check if knees are positioned below hips
    if (leftKnee.y <= leftHip.y || rightKnee.y <= rightHip.y) {
      return false;
    }
    
    // More lenient horizontal distance check
    const leftHorizontalDistance = Math.abs(leftKnee.x - leftHip.x);
    const rightHorizontalDistance = Math.abs(rightKnee.x - rightHip.x);
    const minHorizontalDistance = 0.03; // Reduced from 0.05
    
    if (leftHorizontalDistance < minHorizontalDistance || rightHorizontalDistance < minHorizontalDistance) {
      return false;
    }

    // More lenient body width check
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    const hipWidth = Math.abs(leftHip.x - rightHip.x);
    
    const minBodyWidth = 0.05; // Reduced from 0.08
    if (shoulderWidth < minBodyWidth || hipWidth < minBodyWidth) {
      return false;
    }
    
    // More lenient body alignment check
    const shoulderCenter = (leftShoulder.x + rightShoulder.x) / 2;
    const hipCenter = (leftHip.x + rightHip.x) / 2;
    const bodyAlignment = Math.abs(shoulderCenter - hipCenter);
    
    const maxBodyMisalignment = 0.15; // Increased from 0.1
    if (bodyAlignment > maxBodyMisalignment) {
      return false;
    }
    
    // More lenient knee height difference
    const kneeHeightDifference = Math.abs(leftKnee.y - rightKnee.y);
    const maxKneeHeightDiff = 0.08; // Increased from 0.05
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

    // Lower visibility requirement
    const minVisibility = 0.15; // Reduced from 0.2
    if (leftHip.visibility < minVisibility || leftKnee.visibility < minVisibility || 
        leftAnkle.visibility < minVisibility || rightHip.visibility < minVisibility || 
        rightKnee.visibility < minVisibility || rightAnkle.visibility < minVisibility) {
      return { count: this.count, alert: "Low landmark visibility" };
    }

    const leftKneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle);
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
    const kneeDifference = Math.abs(leftKneeAngle - rightKneeAngle);

    // Update standing position with more lenient threshold
    if (avgKneeAngle >= 160 && kneeDifference < 20) {
      this.standingKneeAngle = avgKneeAngle;
    }

    // Use adaptive threshold
    const currentDownThreshold = this.getAdaptiveThreshold();

    if (!this.isDown && avgKneeAngle <= currentDownThreshold) {
      if (this.isValidSquatPosition(leftKneeAngle, rightKneeAngle, avgKneeAngle, landmarks)) {
        this.stateFrames++;
        if (this.stateFrames >= this.minFrames) {
          this.isDown = true;
          this.stateFrames = 0;
          return { count: this.count, isSquatDown: true };
        }
      } else {
        this.stateFrames = 0;
      }
    } 
    else if (this.isDown && avgKneeAngle >= this.upKneeAngleThreshold) {
      if (kneeDifference <= this.maxKneeAngleDifference) {
        this.stateFrames++;
        if (this.stateFrames >= this.minFrames) {
          this.isDown = false;
          this.count++;
          this.stateFrames = 0;
          return { count: this.count, newCount: true };
        }
      } else {
        this.stateFrames = 0;
      }
    } else {
      this.stateFrames = 0;
    }

    return { count: this.count, newCount: false, isSquatDown: this.isDown };
  }

  resetCount(): void {
    this.count = 0;
    this.isDown = false;
    this.stateFrames = 0;
    this.standingKneeAngle = null;
    this.userMaxSquatDepth = null;
  }
}
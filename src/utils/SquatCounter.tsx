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

// Complete Fixed Squat Counter for Fast & Slow Squat Detection
export class SquatCounter {
  private count: number = 0;
  private isDown: boolean = false;
  
  // ✅ FIX 1: minFrames back to 2 for better stability
  private readonly minFrames: number = 2;
  
  private readonly downKneeAngleThreshold: number = 130;
  private readonly upKneeAngleThreshold: number = 155;
  
  private readonly maxKneeAngleDifference: number = 40;
  private readonly minKneeBend: number = 10;
  
  private standingKneeAngle: number | null = null;
  private userMaxSquatDepth: number | null = null;
  private readonly adaptiveMode: boolean = true;
  
  // Hysteresis margins
  private readonly downAngleMargin: number = 5;
  private readonly upAngleMargin: number = 3;
  
  // Confidence tracking
  private downConfidence: number = 0;
  private upConfidence: number = 0;
  
  // ✅ FIX 2: Track state transitions untuk debug
  private lastStateChange: string = 'init';

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
    
    const userRange = this.standingKneeAngle - this.userMaxSquatDepth;
    const adaptiveThreshold = this.standingKneeAngle - (userRange * 0.65);
    
    return Math.min(adaptiveThreshold, this.standingKneeAngle - 15);
  }

  // ✅ FIX 3: Separate standing position initialization
  private initializeStandingPosition(avgKneeAngle: number, landmarks: Landmark[]): boolean {
    if (this.standingKneeAngle !== null) return false;
    
    if (avgKneeAngle >= 155) {
      // Check body is stable and properly formed
      const shoulderWidth = Math.abs(landmarks[11].x - landmarks[12].x);
      const hipWidth = Math.abs(landmarks[23].x - landmarks[24].x);
      const leftKnee = landmarks[25];
      const rightKnee = landmarks[26];
      
      if (shoulderWidth > 0.08 && hipWidth > 0.08 && 
          leftKnee.visibility > 0.3 && rightKnee.visibility > 0.3) {
        this.standingKneeAngle = avgKneeAngle;
        console.log(`[SquatCounter] Standing position initialized: ${avgKneeAngle.toFixed(1)}°`);
        this.lastStateChange = 'standing_init';
        return true;
      }
    }
    return false;
  }

  private isValidSquatPosition(
    leftKneeAngle: number,
    rightKneeAngle: number,
    avgKneeAngle: number,
    landmarks: Landmark[]
  ): boolean {
    const kneeDifference = Math.abs(leftKneeAngle - rightKneeAngle);
    
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];

    // Basic visibility check
    if (leftKnee.visibility < 0.2 || rightKnee.visibility < 0.2) {
      return false;
    }

    if (this.standingKneeAngle === null) {
      return false;
    }

    // Track maximum squat depth
    if (this.userMaxSquatDepth === null || avgKneeAngle < this.userMaxSquatDepth) {
      this.userMaxSquatDepth = avgKneeAngle;
    }

    // ✅ FIX 4: Adaptive tolerance based on confidence
    let minBodyWidth = 0.04;
    let maxBodyMisalignment = 0.2;
    let maxKneeHeightDiff = 0.1;
    
    // RELAX checks saat downConfidence sudah naik (squat sudah confirmed)
    if (this.downConfidence >= 1) {
      minBodyWidth = 0.02;
      maxBodyMisalignment = 0.3;
      maxKneeHeightDiff = 0.15;
    }

    const kneeBend = this.standingKneeAngle - avgKneeAngle;
    if (kneeBend < this.minKneeBend) {
      return false;
    }

    if (kneeDifference > this.maxKneeAngleDifference) {
      return false;
    }

    // Knees below hips
    if (leftKnee.y <= leftHip.y || rightKnee.y <= rightHip.y) {
      return false;
    }

    // Horizontal distance check
    const leftHorizontalDistance = Math.abs(leftKnee.x - leftHip.x);
    const rightHorizontalDistance = Math.abs(rightKnee.x - rightHip.x);
    const minHorizontalDistance = 0.02;

    if (leftHorizontalDistance < minHorizontalDistance && rightHorizontalDistance < minHorizontalDistance) {
      return false;
    }

    // Body width check
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    const hipWidth = Math.abs(leftHip.x - rightHip.x);

    if (shoulderWidth < minBodyWidth || hipWidth < minBodyWidth) {
      return false;
    }

    // Body alignment
    const shoulderCenter = (leftShoulder.x + rightShoulder.x) / 2;
    const hipCenter = (leftHip.x + rightHip.x) / 2;
    const bodyAlignment = Math.abs(shoulderCenter - hipCenter);

    if (bodyAlignment > maxBodyMisalignment) {
      return false;
    }

    // Knee height difference
    const kneeHeightDifference = Math.abs(leftKnee.y - rightKnee.y);
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

    const minVisibility = 0.1;
    if (leftHip.visibility < minVisibility || leftKnee.visibility < minVisibility || 
        leftAnkle.visibility < minVisibility || rightHip.visibility < minVisibility || 
        rightKnee.visibility < minVisibility || rightAnkle.visibility < minVisibility) {
      return { count: this.count, alert: "Low landmark visibility" };
    }

    const leftKneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle);
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
    const kneeDifference = Math.abs(leftKneeAngle - rightKneeAngle);

    // ✅ FIX 5: Try to initialize standing position
    if (this.standingKneeAngle === null) {
      this.initializeStandingPosition(avgKneeAngle, landmarks);
    }

    // Update standing position if we're clearly standing
    if (avgKneeAngle >= 155 && kneeDifference < 25 && this.standingKneeAngle !== null) {
      this.standingKneeAngle = Math.max(this.standingKneeAngle, avgKneeAngle);
    }

    const currentDownThreshold = this.getAdaptiveThreshold();

    // ✅ STATE MACHINE: Down Detection
    if (!this.isDown && avgKneeAngle <= (currentDownThreshold + this.downAngleMargin)) {
      const isValid = this.isValidSquatPosition(leftKneeAngle, rightKneeAngle, avgKneeAngle, landmarks);
      
      if (isValid) {
        this.downConfidence++;
        this.upConfidence = 0;
        
        console.log(`[Down] Conf: ${this.downConfidence}/${this.minFrames}, Angle: ${avgKneeAngle.toFixed(1)}°, Threshold: ${currentDownThreshold.toFixed(1)}°`);
        
        if (this.downConfidence >= this.minFrames) {
          this.isDown = true;
          this.downConfidence = 0;
          this.lastStateChange = 'down_detected';
          return {
            count: this.count,
            isSquatDown: true,
            debug: `Down detected at ${avgKneeAngle.toFixed(1)}°`
          };
        }
      } else {
        // ✅ INTELLIGENT RESET: tidak langsung 0, tapi graduated
        if (avgKneeAngle > currentDownThreshold + this.downAngleMargin + 20) {
          // Sudah sangat tinggi, hard reset
          this.downConfidence = 0;
        } else {
          // Masih dalam range, decay perlahan
          this.downConfidence = Math.max(0, this.downConfidence - 0.3);
        }
      }
    } 
    // ✅ STATE MACHINE: Up Detection
    else if (this.isDown && avgKneeAngle >= (this.upKneeAngleThreshold - this.upAngleMargin)) {
      if (kneeDifference <= this.maxKneeAngleDifference) {
        this.upConfidence++;
        this.downConfidence = 0;
        
        console.log(`[Up] Conf: ${this.upConfidence}/${this.minFrames}, Angle: ${avgKneeAngle.toFixed(1)}°`);
        
        if (this.upConfidence >= this.minFrames) {
          this.isDown = false;
          this.count++;
          this.upConfidence = 0;
          this.lastStateChange = 'squat_counted';
          return {
            count: this.count,
            newCount: true,
            debug: `✓ Squat counted! Total: ${this.count} at ${avgKneeAngle.toFixed(1)}°`
          };
        }
      } else {
        // Knee difference invalid
        if (kneeDifference > this.maxKneeAngleDifference + 5) {
          this.upConfidence = 0;
        } else {
          this.upConfidence = Math.max(0, this.upConfidence - 0.2);
        }
      }
    } 
    else {
      // Decay confidence gradually
      this.downConfidence = Math.max(0, this.downConfidence - 0.2);
      this.upConfidence = Math.max(0, this.upConfidence - 0.2);
    }

    return { count: this.count, newCount: false, isSquatDown: this.isDown };
  }

  resetCount(): void {
    console.log(`[SquatCounter] Reset called. Previous count: ${this.count}, Last state: ${this.lastStateChange}`);
    this.count = 0;
    this.isDown = false;
    this.downConfidence = 0;
    this.upConfidence = 0;
    this.standingKneeAngle = null;
    this.userMaxSquatDepth = null;
    this.lastStateChange = 'reset';
  }

  getDebugInfo(): object {
    return {
      count: this.count,
      isDown: this.isDown,
      standingKneeAngle: this.standingKneeAngle?.toFixed(1),
      userMaxSquatDepth: this.userMaxSquatDepth?.toFixed(1),
      downConfidence: this.downConfidence.toFixed(2),
      upConfidence: this.upConfidence.toFixed(2),
      minFrames: this.minFrames,
      lastStateChange: this.lastStateChange
    };
  }
}
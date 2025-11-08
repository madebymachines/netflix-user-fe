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

// Improved Squat Counter - Fixed for Fast Squat Detection
export class SquatCounter {
  private count: number = 0;
  private isDown: boolean = false;
  private stateFrames: number = 0;
  
  // ✅ FIX 1: Turunkan minFrames dari 3 ke 2 untuk menangkap squat cepat
  private readonly minFrames: number = 1;
  
  private readonly downKneeAngleThreshold: number = 130;
  private readonly upKneeAngleThreshold: number = 155;
  
  private readonly maxKneeAngleDifference: number = 40;
  private readonly minKneeBend: number = 10;
  
  private standingKneeAngle: number | null = null;
  private userMaxSquatDepth: number | null = null;
  private readonly adaptiveMode: boolean = true;
  
  // ✅ FIX 4: Tambah hysteresis margin untuk smooth transitions
  private readonly downAngleMargin: number = 5;
  private readonly upAngleMargin: number = 3;
  private lastSquatDownFrame: boolean = false;
  
  // Confidence tracking
  private downConfidence: number = 0;
  private upConfidence: number = 0;
  
  // ✅ FIX 2: Track confidence history untuk prevent jitter
  private confidenceHistory: number[] = [];
  private readonly confidenceHistoryLength: number = 5;

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

    if (leftKnee.visibility < 0.25 || rightKnee.visibility < 0.25) {
      return false;
    }

    // Initialize standing position
    if (this.standingKneeAngle === null) {
      if (avgKneeAngle >= 155) {
        this.standingKneeAngle = avgKneeAngle;
        console.log(`[SquatCounter] Standing position initialized: ${avgKneeAngle.toFixed(1)}°`);
      }
      return false;
    }

    // Track user's maximum squat depth
    if (this.userMaxSquatDepth === null || avgKneeAngle < this.userMaxSquatDepth) {
      this.userMaxSquatDepth = avgKneeAngle;
    }

    // ✅ FIX 5: Relax validasi saat downConfidence sudah naik (squat sudah dimulai)
    let minBodyWidth = 0.04;
    let maxBodyMisalignment = 0.2;
    
    if (this.downConfidence >= 1) {
      // Relax tolerance untuk squat cepat yang sudah terkonfirmasi
      minBodyWidth = 0.03;
      maxBodyMisalignment = 0.25;
    }

    const kneeBend = this.standingKneeAngle - avgKneeAngle;
    if (kneeBend < this.minKneeBend) {
      return false;
    }

    if (kneeDifference > this.maxKneeAngleDifference) {
      return false;
    }

    if (leftKnee.y <= leftHip.y || rightKnee.y <= rightHip.y) {
      return false;
    }

    const leftHorizontalDistance = Math.abs(leftKnee.x - leftHip.x);
    const rightHorizontalDistance = Math.abs(rightKnee.x - rightHip.x);
    const minHorizontalDistance = 0.02;

    if (
      leftHorizontalDistance < minHorizontalDistance &&
      rightHorizontalDistance < minHorizontalDistance
    ) {
      return false;
    }

    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    const hipWidth = Math.abs(leftHip.x - rightHip.x);

    if (shoulderWidth < minBodyWidth || hipWidth < minBodyWidth) {
      return false;
    }

    const shoulderCenter = (leftShoulder.x + rightShoulder.x) / 2;
    const hipCenter = (leftHip.x + rightHip.x) / 2;
    const bodyAlignment = Math.abs(shoulderCenter - hipCenter);

    if (bodyAlignment > maxBodyMisalignment) {
      return false;
    }

    const kneeHeightDifference = Math.abs(leftKnee.y - rightKnee.y);
    const maxKneeHeightDiff = 0.1;
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
    if (avgKneeAngle >= 155 && kneeDifference < 25) {
      this.standingKneeAngle = avgKneeAngle;
    }

    const currentDownThreshold = this.getAdaptiveThreshold();

    // ✅ FIX 3: State transition dengan proper reset dan margin
    if (!this.isDown && avgKneeAngle <= (currentDownThreshold + this.downAngleMargin)) {
      if (this.isValidSquatPosition(leftKneeAngle, rightKneeAngle, avgKneeAngle, landmarks)) {
        this.downConfidence++;
        this.upConfidence = 0; // Hard reset up confidence
        
        if (this.downConfidence >= this.minFrames) {
          this.isDown = true;
          this.downConfidence = 0;
          this.lastSquatDownFrame = true;
          return {
            count: this.count,
            isSquatDown: true,
            debug: `Down detected at ${avgKneeAngle.toFixed(1)}°`
          };
        }
      } else {
        // ✅ FIX 3a: Hard reset jika posisi invalid, bukan decay
        if (avgKneeAngle > currentDownThreshold + this.downAngleMargin) {
          this.downConfidence = 0;
        } else {
          // Decay slowly jika masih dalam range tapi invalid pose
          this.downConfidence = Math.max(0, this.downConfidence - 0.2);
        }
      }
    } 
    else if (this.isDown && avgKneeAngle >= (this.upKneeAngleThreshold - this.upAngleMargin)) {
      if (kneeDifference <= this.maxKneeAngleDifference) {
        this.upConfidence++;
        this.downConfidence = 0; // Hard reset down confidence
        
        if (this.upConfidence >= this.minFrames) {
          this.isDown = false;
          this.count++;
          this.upConfidence = 0;
          this.lastSquatDownFrame = false;
          return {
            count: this.count,
            newCount: true,
            debug: `Squat counted! Total: ${this.count} at ${avgKneeAngle.toFixed(1)}°`
          };
        }
      } else {
        // ✅ FIX 3b: Hard reset jika knee difference invalid
        if (kneeDifference > this.maxKneeAngleDifference + 5) {
          this.upConfidence = 0;
        } else {
          // Decay slowly
          this.upConfidence = Math.max(0, this.upConfidence - 0.2);
        }
      }
    } 
    else {
      // ✅ FIX 2: Slower decay rate (turun dari 0.5 ke 0.2)
      this.downConfidence = Math.max(0, this.downConfidence - 0.2);
      this.upConfidence = Math.max(0, this.upConfidence - 0.2);
    }

    return { count: this.count, newCount: false, isSquatDown: this.isDown };
  }

  resetCount(): void {
    this.count = 0;
    this.isDown = false;
    this.stateFrames = 0;
    this.downConfidence = 0;
    this.upConfidence = 0;
    this.lastSquatDownFrame = false;
    this.standingKneeAngle = null;
    this.userMaxSquatDepth = null;
    this.confidenceHistory = [];
  }

  // Debug helper
  getDebugInfo(): object {
    return {
      count: this.count,
      isDown: this.isDown,
      standingKneeAngle: this.standingKneeAngle?.toFixed(1),
      userMaxSquatDepth: this.userMaxSquatDepth?.toFixed(1),
      downConfidence: this.downConfidence.toFixed(2),
      upConfidence: this.upConfidence.toFixed(2),
      minFrames: this.minFrames
    };
  }
}
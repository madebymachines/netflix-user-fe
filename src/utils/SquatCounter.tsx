interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility: number;
}

interface SquatCounterResult {
  count: number;
  alert?: string;
  isSquatDown?: boolean;
  newCount?: boolean;
}

export class SquatCounter {
  private count: number = 0;
  private isDown: boolean = false;
  private stateFrames: number = 0;
  private readonly minFrames: number = 2;
  
  // Adjusted thresholds
  private readonly downKneeAngleThreshold: number = 135;
  private readonly upKneeAngleThreshold: number = 160;
  
  private readonly maxKneeAngleDifference: number = 45;  // ✅ INCREASED: Lebih toleran
  private readonly minKneeBend: number = 20;
  
  private standingKneeAngle: number | null = null;
  private userMaxSquatDepth: number | null = null;
  
  // ✅ NEW: Track min depth per session untuk stabilitas
  private minDepthThisSession: number = 180;

  private calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return angle;
  }

  // ✅ SIMPLIFIED: Hapus adaptive threshold yang bermasalah
  private getCurrentDownThreshold(): number {
    if (this.standingKneeAngle === null) {
      return this.downKneeAngleThreshold;
    }
    
    // Static threshold dari standing position
    return this.standingKneeAngle - 35; // Cukup untuk squat yang jelas
  }

  private isValidSquatPosition(
    leftKneeAngle: number,
    rightKneeAngle: number,
    avgKneeAngle: number,
    landmarks: Landmark[]
  ): boolean {
    const kneeDifference = Math.abs(leftKneeAngle - rightKneeAngle);
    
    // ✅ RELAXED: Knee alignment tidak perlu sempurna untuk DOWN state
    // (akan ditcheck ketat saat UP state saja)
    if (kneeDifference > this.maxKneeAngleDifference) {
      return false;
    }

    // Initialize standing position
    if (this.standingKneeAngle === null) {
      if (avgKneeAngle >= 160) {
        this.standingKneeAngle = avgKneeAngle;
        console.log(`[SquatCounter] Standing position initialized: ${avgKneeAngle.toFixed(1)}°`);
      }
      return false;
    }

    // Track depth
    if (avgKneeAngle < this.minDepthThisSession) {
      this.minDepthThisSession = avgKneeAngle;
    }

    const kneeBend = this.standingKneeAngle - avgKneeAngle;
    if (kneeBend < this.minKneeBend) {
      return false;
    }

    // ✅ SIMPLIFIED: Hanya check critical landmarks
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    
    if (!leftKnee || !rightKnee || !leftHip || !rightHip) {
      return false;
    }

    // Critical check: visibility minimal
    if (leftKnee.visibility < 0.2 || rightKnee.visibility < 0.2) {
      return false;
    }
    
    // Critical check: knees di bawah hips
    if (leftKnee.y <= leftHip.y || rightKnee.y <= rightHip.y) {
      return false;
    }

    return true;
  }

  processPose(landmarks: Landmark[]): SquatCounterResult {
    if (!landmarks || landmarks.length < 33) {
      return { count: this.count };
    }

    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];
    const rightHip = landmarks[24];
    const rightKnee = landmarks[26];
    const rightAnkle = landmarks[28];

    if (!leftHip || !leftKnee || !leftAnkle || !rightHip || !rightKnee || !rightAnkle) {
      return { count: this.count };
    }

    const minVisibility = 0.15;
    if (
      leftHip.visibility < minVisibility ||
      leftKnee.visibility < minVisibility ||
      leftAnkle.visibility < minVisibility ||
      rightHip.visibility < minVisibility ||
      rightKnee.visibility < minVisibility ||
      rightAnkle.visibility < minVisibility
    ) {
      return { count: this.count };
    }

    const leftKneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
    const rightKneeAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle);
    const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
    const kneeDifference = Math.abs(leftKneeAngle - rightKneeAngle);

    // Update standing position
    if (avgKneeAngle >= 160 && kneeDifference < 25) {
      this.standingKneeAngle = avgKneeAngle;
    }

    const currentDownThreshold = this.getCurrentDownThreshold();

    // ✅ DOWN STATE: Check valid squat position
    if (!this.isDown && avgKneeAngle <= currentDownThreshold) {
      if (this.isValidSquatPosition(leftKneeAngle, rightKneeAngle, avgKneeAngle, landmarks)) {
        this.stateFrames++;
        if (this.stateFrames >= this.minFrames) {
          this.isDown = true;
          this.stateFrames = 0;
          console.log(
            `[SquatCounter] DOWN: angle=${avgKneeAngle.toFixed(1)}°, ` +
            `diff=${kneeDifference.toFixed(1)}°, standing=${this.standingKneeAngle?.toFixed(1)}`
          );
          return { count: this.count, isSquatDown: true };
        }
      } else {
        this.stateFrames = 0;
      }
    }
    // ✅ UP STATE: SIMPLIFIED - hanya check angle, tidak perlu perfect alignment
    else if (this.isDown && avgKneeAngle >= this.upKneeAngleThreshold) {
      // ✅ CRITICAL FIX: Jangan reset stateFrames jika alignment sedikit off
      // Fokus hanya pada knee angle yang naik
      this.stateFrames++;
      
      if (this.stateFrames >= this.minFrames) {
        this.isDown = false;
        this.count++;
        this.stateFrames = 0;
        
        console.log(
          `[SquatCounter] ✓ COUNT #${this.count}: angle=${avgKneeAngle.toFixed(1)}°, ` +
          `diff=${kneeDifference.toFixed(1)}°, depth_reached=${this.minDepthThisSession.toFixed(1)}°`
        );
        
        return { count: this.count, newCount: true };
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
    this.minDepthThisSession = 180;
  }
}
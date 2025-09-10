// Interface for FPS Monitor update result
interface FPSUpdateResult {
  fps: number;
  avgFps: number;
  isLowPerformance: boolean;
  showWarning: boolean;
  frameCount: number;
}

// FPS Monitor Class
export class FPSMonitor {
  private frameCount: number = 0;
  private startTime: number;
  private lastTime: number;
  private fps: number = 0;
  private avgFps: number = 0;
  private fpsHistory: number[] = [];
  private readonly maxHistorySize: number = 30;
  private readonly minAcceptableFps: number = 15;
  private readonly warningFps: number = 20;

  constructor() {
    this.startTime = performance.now();
    this.lastTime = this.startTime;
  }

  update(): FPSUpdateResult {
    this.frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    this.fps = 1000 / deltaTime;
    
    this.fpsHistory.push(this.fps);
    if (this.fpsHistory.length > this.maxHistorySize) {
      this.fpsHistory.shift();
    }
    
    this.avgFps = this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
    
    this.lastTime = currentTime;
    
    return {
      fps: Math.round(this.fps),
      avgFps: Math.round(this.avgFps),
      isLowPerformance: this.avgFps < this.minAcceptableFps,
      showWarning: this.avgFps < this.warningFps,
      frameCount: this.frameCount
    };
  }

  reset(): void {
    this.frameCount = 0;
    this.startTime = performance.now();
    this.lastTime = this.startTime;
    this.fps = 0;
    this.avgFps = 0;
    this.fpsHistory = [];
  }
}
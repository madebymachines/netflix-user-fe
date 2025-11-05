import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { prepareActivitySubmission } from '@/utils/ActivityUtils';

interface GridPhotoPageProps {
  photo?: string;
  totalSquats: number;
  round1Count: number;
  round2Count: number;
  onBack: () => void;
  onShare: () => void;
  currentRound?: number;
  squatCount?: number;
  progressPercent?: number;
  hydrateProgress?: number;
  recoverProgress?: number;
}

const GridPhotoPage: React.FC<GridPhotoPageProps> = ({ 
  photo, 
  totalSquats, 
  round1Count, 
  round2Count, 
  onBack, 
  onShare
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gridImage, setGridImage] = useState<string | null>(null);
  const [isSubmissionComplete, setIsSubmissionComplete] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  
  const { submitActivity, isSubmittingActivity, stats } = useAuthStore();

  useEffect(() => {
    generateGridImage();
  }, [photo]);

  const handleSubmitActivity = async (): Promise<void> => {
    if (!gridImage) return;

    try {
      const activityData = await prepareActivitySubmission(
        gridImage,
        round1Count,
        round2Count,
        'INDIVIDUAL'
      );

      await submitActivity(activityData);
      setIsSubmissionComplete(true);
      
      console.log('Activity submitted successfully');
    } catch (error) {
      console.error('Failed to submit activity:', error);
      setSubmissionError('Failed to submit challenge results. You can still share your results.');
    }
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const loadFonts = async (): Promise<void> => {
    try {
      await Promise.all([
        document.fonts.load('700 16px Gravtrac'),
        document.fonts.load('400 16px "URW Geometric"'),
        document.fonts.load('700 16px "URW Geometric"'),
        document.fonts.load('800 16px "URW Geometric"'),
        document.fonts.load('900 16px "URW Geometric"'),
        document.fonts.load('400 16px Vancouver'),
        document.fonts.load('400 16px "Vancouver Gothic"'),
      ]);
      
      console.log('All fonts loaded successfully');
    } catch (error) {
      console.error('Error loading fonts:', error);
    }
  };

  const generateGridImage = async (): Promise<void> => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    await loadFonts();
    
    canvas.width = 400;
    canvas.height = 800;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    try {
      // Draw logo at top
      try {
        const logoImg = await loadImage('./images/logo2.png');
        const logoDisplayWidth = 205;
        const logoDisplayHeight = 73;
        const logoX = (canvas.width - logoDisplayWidth) / 2;
        const logoYPos = 10;
        ctx.drawImage(logoImg, logoX, logoYPos, logoDisplayWidth, logoDisplayHeight);
      } catch (logoError) {
        console.error('Error loading logo:', logoError);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('UNLOCK YOUR 100', canvas.width / 2, 50);
      }

      // Draw large photo in center
      const photoX = 20;
      const photoY = 100;
      const photoWidth = canvas.width - 40;
      const photoHeight = (photoWidth * 4) / 3;

      if (photo && photo.trim() !== '') {
        try {
          const img = await loadImage(photo);
          ctx.drawImage(img, photoX, photoY, photoWidth, photoHeight);
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(photoX, photoY + photoHeight - 100, photoWidth, 100);
        } catch (imageError) {
          console.error('Error loading photo:', imageError);
          ctx.fillStyle = '#333333';
          ctx.fillRect(photoX, photoY, photoWidth, photoHeight);
          ctx.strokeStyle = '#666666';
          ctx.lineWidth = 2;
          ctx.strokeRect(photoX, photoY, photoWidth, photoHeight);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Photo not available', canvas.width / 2, photoY + photoHeight / 2);
        }
      } else {
        ctx.fillStyle = '#333333';
        ctx.fillRect(photoX, photoY, photoWidth, photoHeight);
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        ctx.strokeRect(photoX, photoY, photoWidth, photoHeight);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Photo not available', canvas.width / 2, photoY + photoHeight / 2);
      }

      // Draw stats section at bottom
      const statsStartY = photoY + photoHeight + 20;
      const statsCenterY = statsStartY + 80;
      
      // Adjusted font sizes untuk single image layout
      const squat_font_size = 80;
      const slash_font_size = 70;
      const hundred_font_size = 80;
      const label_font_size = 16;

      ctx.fillStyle = '#FF0000';
      ctx.font = `bold ${squat_font_size}px "URW Geometric"`;
      ctx.textAlign = 'right';
      ctx.fillText(totalSquats.toString(), canvas.width / 2 - 60, statsCenterY);

      ctx.save();
      ctx.fillStyle = '#FF0000';
      ctx.font = `bold ${label_font_size}px "URW Geometric"`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.translate(canvas.width / 2 + 10, statsCenterY + 25);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('SQUATS', 0, 0);
      ctx.restore();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${slash_font_size}px "URW Geometric"`;
      ctx.textAlign = 'center';
      ctx.fillText('/', canvas.width / 2 + 40, statsCenterY);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${hundred_font_size}px "URW Geometric"`;
      ctx.textAlign = 'left';
      ctx.fillText('100', canvas.width / 2 + 80, statsCenterY);

      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${label_font_size}px "URW Geometric"`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.translate(canvas.width - 30, statsCenterY + 25);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('SECONDS', 0, 0);
      ctx.restore();
      
      const dataURL = canvas.toDataURL('image/png');
      setGridImage(dataURL);
      
    } catch (error) {
      console.error('Error generating grid image:', error);
    }
  };

  useEffect(() => {
    const autoSubmitActivity = async () => {
      if (gridImage && !isSubmissionComplete && !isSubmittingActivity) {
        await handleSubmitActivity();
      }
    };

    autoSubmitActivity();
  }, [gridImage]);

  const handleShare = async (): Promise<void> => {
    if (!gridImage) {
      console.log('No grid image available for sharing');
      return;
    }

    try {
      const response = await fetch(gridImage);
      const blob = await response.blob();
      
      const fileName = `squat_challenge_${Date.now()}.png`;
      const filesArray = [new File([blob], fileName, { type: 'image/png' })];
      
      if (navigator.canShare && navigator.canShare({ files: filesArray })) {
        await navigator.share({
          files: filesArray,
        });
        console.log("Image shared successfully");
      } else {
        console.log("Web Share API not supported, falling back to download");
        const link = document.createElement('a');
        link.href = gridImage;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing the image:', error);
        const fileName = `squat_challenge_${Date.now()}.png`;
        const link = document.createElement('a');
        link.href = gridImage || '';
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  return (
    <div 
      className="w-full min-h-screen bg-black text-white flex flex-col" 
      style={{ 
        width: '100%',
        margin: "0 auto" 
      }}
    >
      <div className="w-full px-4 pt-4 pb-2 flex justify-end">
        <button
          onClick={onBack}
          className="text-white hover:text-gray-300 transition-colors flex items-center gap-2"
          aria-label="Back to dashboard"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span className="text-sm font-medium">BACK</span>
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-start pt-2">
        <div className="w-full max-w-sm px-5">
          <canvas 
            ref={canvasRef} 
            className="max-w-full h-auto border border-gray-600 rounded-lg"
            style={{ display: 'none' }}
          />
          {gridImage && (
            <img 
              src={gridImage} 
              alt="Squat Challenge Grid" 
              className="w-full h-auto rounded-lg shadow-lg mb-4" 
            />
          )}
        </div>

        {/* Share Button */}
        <div className='w-full max-w-sm px-4 pb-6'>
          <button
            onClick={handleShare}
            disabled={!gridImage}
            className={`w-full text-white py-2 px-4 rounded-md transition-colors font-bold text-lg ${
              gridImage 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            SHARE TO COLLECT POINTS
          </button>
        </div>
      </div>
    </div>
  );
};

export default GridPhotoPage;
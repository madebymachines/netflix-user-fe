import React, { useState, useRef, useEffect } from 'react';

// Define interfaces for props
interface GridPhotoPageProps {
  photos: (string | undefined)[]; // Updated to allow undefined values
  totalSquats: number;
  round1Count: number;
  round2Count: number;
  onBack: () => void;
  onShare: () => void;
  currentRound?: number; // Made optional
  squatCount?: number; // Made optional
  progressPercent?: number; // Made optional
}

// Grid Photo Component
const GridPhotoPage: React.FC<GridPhotoPageProps> = ({ 
  photos, 
  totalSquats, 
  round1Count, 
  round2Count, 
  onBack, 
  onShare
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gridImage, setGridImage] = useState<string | null>(null);

  useEffect(() => {
    generateGridImage();
  }, [photos]);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Helper function to draw placeholder for missing/failed images
  const drawPlaceholder = (
    ctx: CanvasRenderingContext2D, 
    index: number, 
    photoWidth: number, 
    photoHeight: number, 
    gridStartY: number
  ): void => {
    const x = (index % 2) * photoWidth;
    const y = gridStartY + Math.floor(index / 2) * photoHeight;
    
    // Draw dark background
    ctx.fillStyle = '#333333';
    ctx.fillRect(x, y, photoWidth, photoHeight);
    
    // Draw border
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, photoWidth - 2, photoHeight - 2);
    
    // Add placeholder text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      'Photo not available', 
      x + photoWidth / 2, 
      y + photoHeight / 2 - 10
    );
    
    // Add phase label
    const phaseLabels = ['Hydrate', 'Round 1', 'Recovery', 'Round 2'];
    ctx.font = '12px Arial';
    ctx.fillStyle = '#CCCCCC';
    ctx.fillText(
      phaseLabels[index] || `Phase ${index + 1}`, 
      x + photoWidth / 2, 
      y + photoHeight / 2 + 10
    );
  };

  const generateGridImage = async (): Promise<void> => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 400;
    canvas.height = 780;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const logoHeight = 80;
    const logoY = 10;
    
    const gridStartY = logoHeight + 20;
    const gridHeight = (canvas.height - gridStartY) * 0.75;
    const photoWidth = canvas.width / 2;
    const photoHeight = gridHeight / 2;
    
    try {
      // Load and draw logo
      try {
        const logoImg = await loadImage('./assets/LOGO2 1.png');
        
        const logoAspectRatio = logoImg.width / logoImg.height;
        let logoDisplayWidth = canvas.width * 0.6;
        let logoDisplayHeight = logoDisplayWidth / logoAspectRatio;
        
        if (logoDisplayHeight > logoHeight - 20) {
          logoDisplayHeight = logoHeight - 20;
          logoDisplayWidth = logoDisplayHeight * logoAspectRatio;
        }
        
        const logoX = (canvas.width - logoDisplayWidth) / 2;
        const logoYPos = logoY + (logoHeight - logoDisplayHeight) / 2;
        
        ctx.drawImage(logoImg, logoX, logoYPos, logoDisplayWidth, logoDisplayHeight);
      } catch (logoError) {
        console.error('Error loading logo:', logoError);
        // Fallback text logo
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('UNLOCK YOUR 100', canvas.width / 2, logoY + logoHeight / 2);
      }

      // Draw photos in grid with improved error handling
      for (let i = 0; i < 4; i++) {
        const photoSrc = photos[i];
        
        if (photoSrc && photoSrc.trim() !== '') {
          try {
            const img = await loadImage(photoSrc);
            const x = (i % 2) * photoWidth;
            const y = gridStartY + Math.floor(i / 2) * photoHeight;
            
            // Draw the image
            ctx.drawImage(img, x, y, photoWidth, photoHeight);

            // Add overlay effects for specific photos (commented out in original)
            /*
            if (i === 0) {
              // Hydrate overlay
              ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
              ctx.fillRect(x, y, photoWidth, photoHeight);
              
              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 16px Arial';
              ctx.textAlign = 'center';
              ctx.fillText('HYDRATE', x + photoWidth / 2, y + photoHeight - 20);
            } else if (i === 1) {
              // Round 1 squat overlay
              ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
              ctx.fillRect(x, y, photoWidth, photoHeight);
              
              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 16px Arial';
              ctx.textAlign = 'center';
              ctx.fillText('ROUND 1', x + photoWidth / 2, y + photoHeight - 20);
            } else if (i === 2) {
              // Recovery overlay
              ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
              ctx.fillRect(x, y, photoWidth, photoHeight);
              
              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 16px Arial';
              ctx.textAlign = 'center';
              ctx.fillText('RECOVERY', x + photoWidth / 2, y + photoHeight - 20);
            } else if (i === 3) {
              // Round 2 squat overlay
              ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
              ctx.fillRect(x, y, photoWidth, photoHeight);
              
              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 16px Arial';
              ctx.textAlign = 'center';
              ctx.fillText('ROUND 2', x + photoWidth / 2, y + photoHeight - 20);
            }
            */

          } catch (imageError) {
            console.error(`Error loading photo ${i}:`, imageError);
            drawPlaceholder(ctx, i, photoWidth, photoHeight, gridStartY);
          }
        } else {
          // Draw placeholder for missing photo
          drawPlaceholder(ctx, i, photoWidth, photoHeight, gridStartY);
        }
      }
      
      // Draw stats section
      const statsStartY = gridStartY + gridHeight;
      const statsHeight = canvas.height - statsStartY;
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, statsStartY, canvas.width, statsHeight);
      
      const statsCenterX = canvas.width / 2;
      const statsCenterY = statsStartY + statsHeight / 2;
      
      // Draw squat count
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 100px Arial';
      ctx.textAlign = 'right';
      const countText = totalSquats.toString();
      ctx.fillText(countText, statsCenterX - 80, statsCenterY);

      // Draw "SQUATS" label
      ctx.save();
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 15px Arial';
      ctx.textAlign = 'left';
      ctx.translate(statsCenterX - 60, statsCenterY + 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('SQUATS', 0, 0);
      ctx.restore();

      // Draw separator "/"
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 80px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('/', statsCenterX - 10, statsCenterY);

      // Draw "100"
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 100px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('100', statsCenterX + 20, statsCenterY);

      // Draw "SECONDS" label
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px Arial';
      ctx.textAlign = 'left';
      ctx.translate(statsCenterX + 200, statsCenterY + 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('SECONDS', 0, 0);
      ctx.restore();
      
      const dataURL = canvas.toDataURL('image/png');
      setGridImage(dataURL);
      
    } catch (error) {
      console.error('Error generating grid image:', error);
    }
  };

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
          title: 'My Squat Challenge Results',
          text: `I completed ${totalSquats} squats in the challenge!`
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
        // Fallback to download
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
      style={{ maxWidth: 430, margin: "0 auto" }}
    >
      {/* Header */}
      <div className="flex items-center justify-center py-2 relative flex-shrink-0">
        <img 
          src="./assets/LOGO2 1.png" 
          alt="Unlock Your 100 Logo" 
          className="h-12 object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 mx-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm">
          <canvas 
            ref={canvasRef} 
            className="max-w-full h-auto border border-gray-600 rounded-lg"
            style={{ display: 'none' }}
          />
          {gridImage && (
            <img 
              src={gridImage} 
              alt="Squat Challenge Grid" 
              className="max-w-full h-auto rounded-lg shadow-lg"
            />
          )}
          
          {!gridImage && (
            <div className="w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Generating challenge summary...</p>
            </div>
          )}
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          disabled={!gridImage}
          className={`mt-6 w-full max-w-sm text-white py-3 px-8 rounded-md font-bold transition-colors flex items-center justify-center ${
            gridImage 
              ? 'bg-[#FF0000] hover:bg-[#CC0000]' 
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          <span className="text-white text-[24px] font-vancouver font-regular">
            SHARE TO COLLECT POINTS
          </span>
        </button>

        {/* Stats Summary */}
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            Round 1: {round1Count} squats | Round 2: {round2Count} squats
          </p>
          <p className="text-white text-lg font-bold mt-1">
            Total: {totalSquats} squats completed!
          </p>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="mt-4 text-gray-400 hover:text-white transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default GridPhotoPage;
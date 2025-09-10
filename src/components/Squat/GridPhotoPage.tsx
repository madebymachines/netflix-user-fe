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
  hydrateProgress?: number; // 0-1
  recoverProgress?: number; // 0-1
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

  const loadFonts = async (): Promise<void> => {
    try {
      // Load all the fonts that are defined in your CSS
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
    canvas.height = 780;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const logoHeight = 80;
    const logoY = 10;
    
    const gridStartY = logoHeight + 20;
    const photoWidth = canvas.width / 2; // 200px width
    const photoHeight = photoWidth * 1.4; // 280px height (portrait ratio 5:7)
    const gridHeight = photoHeight * 2; // Total grid height for 2 rows
    
    try {
      // Load and draw logo with fixed size
      try {
        const logoImg = await loadImage('./images/logo2.png');
        
        // Fixed logo dimensions to match the Image component (205x73)
        const logoDisplayWidth = 205;
        const logoDisplayHeight = 73;
        
        // Center the logo horizontally
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

      // Draw photos in grid with improved error handling and overlays
      for (let i = 0; i < 4; i++) {
        const photoSrc = photos[i];
        const x = (i % 2) * photoWidth;
        const y = gridStartY + Math.floor(i / 2) * photoHeight;
        
        if (photoSrc && photoSrc.trim() !== '') {
          try {
            const img = await loadImage(photoSrc);
            
            // Draw the image
            ctx.drawImage(img, x, y, photoWidth, photoHeight);

            // Add overlays based on photo index
            if (i === 0) {
              const bannerWidth = photoWidth * 0.85;
              const bannerX = x + (photoWidth - bannerWidth) / 2;
              const bannerHeight = 25;
              const bannerY = y + photoHeight * 0.55;
              
              // Progress percentage (you can make this dynamic based on your app state)
              const progressPercent = 0.90;
              const progressWidth = bannerWidth * progressPercent;
              
              // Draw background (black instead of transparent)
              ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
              ctx.beginPath();
              ctx.roundRect(bannerX, bannerY, bannerWidth, bannerHeight, 5);
              ctx.fill();
              
              // Draw progress bar (red part)
              ctx.fillStyle = '#FF0000';
              ctx.beginPath();
              ctx.roundRect(bannerX, bannerY, progressWidth, bannerHeight, [5, 0, 0, 5]);
              ctx.fill();
              
              // Draw text
              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 16px "URW Geometric"';
              ctx.textAlign = 'center';
              ctx.fillText('HYDRATE AND ENERGIZE', x + photoWidth/2, bannerY + 20);
              
              // Draw bottle icon at the end of progress bar
              try {
                const bottleImg = await loadImage('./images/bottle.png');
                const bottleSize = 30;
    
                // Posisi X: tepat di ujung kanan progress bar
                const bottleX = bannerX + progressWidth - bottleSize/2;
                
                // Posisi Y: DI ATAS progress bar dengan jarak yang cukup
                const bottleY = bannerY - bottleSize - 1; // 5px gap di atas bar
                
                ctx.drawImage(bottleImg, bottleX, bottleY, bottleSize, bottleSize);
              } catch (bottleError) {
                console.error('Error loading bottle image:', bottleError);
                // Fallback: draw a simple circle as bottle placeholder
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                // FIXED: Position fallback circle at progress end
                ctx.arc(bannerX + progressWidth, bannerY + bannerHeight/2, 8, 0, 2 * Math.PI);
                ctx.fill();
              }
              
              // Black subtitle banner (unchanged)
              const gap = 5;
              const blackBannerY = bannerY + bannerHeight + gap;
              const blackBannerHeight = 18;
              const blackBannerWidth = photoWidth * 0.75;
              const blackBannerX = x + (photoWidth - blackBannerWidth) / 2;
              
              ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
              ctx.beginPath();
              ctx.roundRect(blackBannerX, blackBannerY, blackBannerWidth, blackBannerHeight, 5);
              ctx.fill();
              
              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 12px "URW Geometric"';
              ctx.textAlign = 'center';
              ctx.fillText('BEFORE UNLOCK YOUR 100', x + photoWidth/2, blackBannerY + 15);
            }
            else if (i === 1) {
              const counterAreaY = y + photoHeight * 0.55;
              const counterAreaHeight = photoHeight * 0.40;
              
              const actualCount = round1Count;
              
              const centerY = counterAreaY + counterAreaHeight/2;
              
              ctx.save();
              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 14px "URW Geometric"';
              ctx.textAlign = 'center';
              ctx.translate(x + 45, centerY - 20);
              ctx.rotate(-Math.PI / 2);
              ctx.fillText('ROUND 1', 0, 0);
              ctx.restore();
              
              ctx.fillStyle = '#FF0000';
              ctx.font = 'bold 60px "URW Geometric"';
              ctx.textAlign = 'center';
              ctx.fillText(actualCount.toString(), x + photoWidth/2 - 10, centerY - 8);
              
              ctx.fillStyle = '#FF0000';
              ctx.font = 'bold 24px "URW Geometric"';
              ctx.textAlign = 'left';
              ctx.fillText('REP', x + photoWidth/2 + 25, centerY - 15);
            }
            else if (i === 2) {
              const bannerWidth = photoWidth * 0.85;
              const bannerX = x + (photoWidth - bannerWidth) / 2;
              const bannerHeight = 28;
              const bannerY = y + photoHeight * 0.55;
              
              // Progress percentage (you can make this dynamic based on your app state)
              const progressPercent = 0.90;
              const progressWidth = bannerWidth * progressPercent;
              
              // Draw background (black)
              ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
              ctx.beginPath();
              ctx.roundRect(bannerX, bannerY, bannerWidth, bannerHeight, 5);
              ctx.fill();
              
              // Draw progress bar (red part)
              ctx.fillStyle = '#FF0000';
              ctx.beginPath();
              ctx.roundRect(bannerX, bannerY, progressWidth, bannerHeight, [5, 0, 0, 5]);
              ctx.fill();
              
              // Draw text
              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 16px "URW Geometric"';
              ctx.textAlign = 'center';
              ctx.fillText('RECOVER & REPEAT STRONGER', x + photoWidth/2, bannerY + 20);
              
              // Draw bottle icon at the END of the progress bar (not banner width)
              try {
                const bottleImg = await loadImage('./images/bottle.png');
                const bottleSize = 30;
    
                // Posisi X: TEPAT di tepi kanan progress bar (bukan masuk ke dalam)
                const bottleX = bannerX + progressWidth - bottleSize/2;
                
                // Posisi Y: DI ATAS progress bar dengan jarak yang cukup
                const bottleY = bannerY - bottleSize - 1; // 8px gap di atas bar
                ctx.drawImage(bottleImg, bottleX, bottleY, bottleSize, bottleSize);
              } catch (bottleError) {
                console.error('Error loading bottle image:', bottleError);
                // Fallback: draw a simple circle as bottle placeholder
                ctx.fillStyle = '#FFFFFF';
                ctx.beginPath();
                // FIXED: Position fallback circle at progress end too
                ctx.arc(bannerX + progressWidth, bannerY - 10, 10, 0, 2 * Math.PI);
                ctx.fill();
              }
              
              // Black subtitle banner - adjust width to fit text
              const gap = 5;
              const blackBannerY = bannerY + bannerHeight + gap;
              const blackBannerHeight = 18;
              
              // Measure text width and add padding
              ctx.font = 'bold 12px "URW Geometric"';
              const textMetrics = ctx.measureText("IT'S TIME TO");
              const blackBannerWidth = textMetrics.width + 20; // Add 20px padding
              const blackBannerX = x + (photoWidth - blackBannerWidth) / 2;
              
              ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
              ctx.beginPath();
              ctx.roundRect(blackBannerX, blackBannerY, blackBannerWidth, blackBannerHeight, 5);
              ctx.fill();
              
              ctx.fillStyle = '#FFFFFF';
              ctx.textAlign = 'center';
              ctx.fillText("IT'S TIME TO", x + photoWidth/2, blackBannerY + 15);
            }
            else if (i === 3) {
              const counterAreaY = y + photoHeight * 0.55;
              const counterAreaHeight = photoHeight * 0.40;
              
              const actualCount = round2Count;
              
              const centerY = counterAreaY + counterAreaHeight/2;
              
              ctx.save();
              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 14px "URW Geometric"';
              ctx.textAlign = 'center';
              ctx.translate(x + 45, centerY - 20);
              ctx.rotate(-Math.PI / 2);
              ctx.fillText('ROUND 2', 0, 0);
              ctx.restore();
              
              ctx.fillStyle = '#FF0000';
              ctx.font = 'bold 60px "URW Geometric"';
              ctx.textAlign = 'center';
              ctx.fillText(actualCount.toString(), x + photoWidth/2 - 10, centerY - 8);
              
              ctx.fillStyle = '#FF0000';
              ctx.font = 'bold 24px "URW Geometric"';
              ctx.textAlign = 'left';
              ctx.fillText('REP', x + photoWidth/2 + 25, centerY - 15);
            }

          } catch (imageError) {
            console.error(`Error loading photo ${i}:`, imageError);
            drawPlaceholder(ctx, i, photoWidth, photoHeight, gridStartY);
          }
        } else {
          // Draw placeholder for missing photo
          drawPlaceholder(ctx, i, photoWidth, photoHeight, gridStartY);
        }
      }
      
      // Draw stats section with proper spacing
      const statsStartY = gridStartY + gridHeight + 30; // Added 30px gap between grid and stats
      const statsHeight = 120;
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, statsStartY, canvas.width, statsHeight);
      
      const statsCenterX = canvas.width / 2;
      const statsCenterY = statsStartY + 60;
      
      // Draw squat count
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 100px "URW Geometric"';
      ctx.textAlign = 'right';
      const countText = totalSquats.toString();
      ctx.fillText(countText, statsCenterX - 80, statsCenterY);

      // Draw "SQUATS" label
      ctx.save();
      ctx.fillStyle = '#ff0000';
      ctx.font = 'bold 18px "URW Geometric"';
      ctx.textAlign = 'left';
      ctx.translate(statsCenterX - 60, statsCenterY + 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('SQUATS', 0, 0);
      ctx.restore();

      // Draw separator "/"
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 80px "URW Geometric"';
      ctx.textAlign = 'center';
      ctx.fillText('/', statsCenterX - 10, statsCenterY);

      // Draw "100"
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 100px "URW Geometric"';
      ctx.textAlign = 'left';
      ctx.fillText('100', statsCenterX + 20, statsCenterY);

      // Draw "SECONDS" label
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px "URW Geometric"';
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
      style={{ 
        width: '100%',
        maxWidth: 'min(90vw, 60vh * 0.75)', 
        margin: "0 auto" 
      }}
    >
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-start pt-2">
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
              className="max-w-full h-auto rounded-lg shadow-lg mb-4" // Added mb-4 for bottom margin
            />
          )}
          
          {!gridImage && (
            <div className="w-full h-96 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
              <p className="text-gray-400">Generating challenge summary...</p>
            </div>
          )}
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          disabled={!gridImage}
          className={`w-full max-w-sm text-white py-1 px-8 rounded-md transition-colors flex items-center justify-center ${
            gridImage 
              ? 'bg-[#FF0000] hover:bg-[#CC0000]' 
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          <span className="text-white text-[24px] font-vancouver font-regular">
            SHARE TO COLLECT POINTS
          </span>
        </button>
      </div>
    </div>
  );
};

export default GridPhotoPage;
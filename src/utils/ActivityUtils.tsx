/**
 * Calculate points based on squat performance
 * 1 point per squat completed
 */
export const calculateChallengePoints = (
  round1Count: number, 
  round2Count: number,
): number => {
  const totalSquats = round1Count + round2Count;
  
  // Base points calculation: 1 point per squat
  let basePoints = totalSquats; // 1 point per squat
  
  // Log untuk debugging
  console.log('Points calculation:', {
    round1Count,
    round2Count, 
    totalSquats,
    basePoints
  });
  
  return Math.max(basePoints, 0); // Minimum 0 points if no squats
};

/**
 * Convert canvas image to File object for form submission
 */
export const canvasToFile = async (
  canvasDataUrl: string, 
  fileName: string = `squat_challenge_${Date.now()}.png`
): Promise<File> => {
  const response = await fetch(canvasDataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: 'image/png' });
};

/**
 * Prepare activity submission data
 */
export const prepareActivitySubmission = async (
  gridImageDataUrl: string,
  round1Count: number,
  round2Count: number,
  eventType: string = 'INDIVIDUAL'
) => {
  const pointsEarned = calculateChallengePoints(round1Count, round2Count);
  const imageFile = await canvasToFile(gridImageDataUrl);
  
  return {
    eventType,
    pointsEarn: pointsEarned,
    submissionImage: imageFile
  };
};
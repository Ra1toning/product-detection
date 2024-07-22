export const calculateRotationAngle = (keypoints: number[]): number => {
    const x1 = keypoints[0];
    const y1 = keypoints[1];
    const x2 = keypoints[3];
    const y2 = keypoints[4];
    const angle = Math.atan2(y2 - y1, x2 - x1);
    return angle * (180 / Math.PI);
  };
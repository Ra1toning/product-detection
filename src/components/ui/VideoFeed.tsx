import { RefObject, useEffect, useState, useCallback } from "react";

interface VideoFeedProps {
  loading: boolean;
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  detectedProduct: { 
    name: string; 
    score: number; 
    box: number[]; 
    keypoints: number[] 
  } | null;
}

export default function VideoFeed({ loading, videoRef, canvasRef, detectedProduct }: VideoFeedProps) {
  const [showReelVideo, setShowReelVideo] = useState(false);
  const [reelStyle, setReelStyle] = useState({});

  const calculateRotationAngle = (keypoints: number[]): number => {
    const x1 = keypoints[0];
    const y1 = keypoints[1];
    const x2 = keypoints[3];
    const y2 = keypoints[4];
    const angle = Math.atan2(y2 - y1, x2 - x1);
    return angle * (180 / Math.PI);
  };

  const updateReelStyle = useCallback(() => {
    if (detectedProduct && detectedProduct.score > 0.50 && detectedProduct.keypoints.length > 0) {
      const videoElement = videoRef.current;
      const canvasElement = canvasRef.current;

      if (!videoElement || !canvasElement) {
        return;
      }

      const videoRect = videoElement.getBoundingClientRect();

      const scaleX = videoRect.width / canvasElement.width;
      const scaleY = videoRect.height / canvasElement.height;

      const processedKeypoints = [];
      for (let i = 0; i < detectedProduct.keypoints.length; i += 3) {
        processedKeypoints.push([
          detectedProduct.keypoints[i] * scaleX,
          detectedProduct.keypoints[i + 1] * scaleY
        ]);
      }

      const xCoords = processedKeypoints.map(point => point[0]);
      const yCoords = processedKeypoints.map(point => point[1]);
      const minX = Math.min(...xCoords);
      const maxX = Math.max(...xCoords);
      const minY = Math.min(...yCoords);
      const maxY = Math.max(...yCoords);

      const width = maxX - minX;
      const height = maxY - minY;
      const centerX = minX + width / 2;
      const centerY = minY + height / 2;

      const rotationAngle = calculateRotationAngle(detectedProduct.keypoints);

      const newReelStyle = {
        position: 'absolute' as const,
        left: `${(centerX / videoRect.width) * 100}%`,
        top: `${(centerY / videoRect.height) * 100}%`,
        width: `${(width / videoRect.width) * 100}%`,
        height: `${(height / videoRect.height) * 100}%`,
        zIndex: 1000000,
        objectFit: 'cover' as const,
        clipPath: `polygon(${processedKeypoints.map(([x, y]) => 
          `${((x - minX) / width) * 100}% ${((y - minY) / height) * 100}%`
        ).join(', ')})`,
        transform: `translate(-50%, -50%) rotate(${rotationAngle}deg)`,
        transformOrigin: 'center'
      };

      setReelStyle(newReelStyle);
      setShowReelVideo(true);
    } else {
      setShowReelVideo(false);
    }
  }, [detectedProduct, videoRef, canvasRef]);

  useEffect(() => {
    const handleResize = () => {
      requestAnimationFrame(updateReelStyle);
    };

    updateReelStyle();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateReelStyle]);

  useEffect(() => {
    updateReelStyle();
  }, [detectedProduct, updateReelStyle]);

  return (
    <div className="relative mb-6 rounded-2xl overflow-hidden border-2 border-cyan-500 shadow-inner">
      {loading && (
        <div className="loader-container absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="loader"></div>
          <span className="loader-text text-white">Loading...</span>
        </div>
      )}
      <video 
        autoPlay 
        playsInline 
        muted 
        ref={videoRef} 
        className="relative w-full h-full rounded-md object-cover" 
        id="frame" 
        onLoadedMetadata={updateReelStyle}
      />
      <canvas 
        className="absolute top-0 left-0 w-full h-full z-10" 
        ref={canvasRef}
      />
      {showReelVideo && (
        <video
          autoPlay
          loop
          playsInline
          muted
          src="/assets/reels1.mp4"
          style={reelStyle}
          onError={(e) => console.log(`Video error: ${e}`)}
          onLoadedData={() => console.log("Reel video loaded successfully")}
        />
      )}      
    </div>
  );
}

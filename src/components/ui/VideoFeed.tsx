import { RefObject, useEffect, useState } from "react";

interface VideoFeedProps {
  loading: boolean;
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  detectedProduct: { 
    name: string; 
    score: number; 
    box: number[]; 
    keypoints: [number, number][] 
  } | null;
}

export default function VideoFeed({ loading, videoRef, canvasRef, detectedProduct }: VideoFeedProps) {
  const [showReelVideo, setShowReelVideo] = useState(false);
  const [reelStyle, setReelStyle] = useState({});

  useEffect(() => {
    console.log("DetectedProduct:", detectedProduct);
    
    if (detectedProduct && detectedProduct.score > 0.50) {
      console.log("DetectedProduct score:", detectedProduct.score);
      console.log("Keypoints:", detectedProduct.keypoints);
      console.log("Box:", detectedProduct.box);
      
      setShowReelVideo(true);

      const canvasWidth = canvasRef.current?.width || 640;
      const canvasHeight = canvasRef.current?.height || 640;
      
      let newReelStyle: any = {};

      if (detectedProduct.keypoints && detectedProduct.keypoints.length >= 4) {
        const [topLeft, topRight, bottomRight, bottomLeft] = detectedProduct.keypoints;

        const left = Math.min(topLeft[0], bottomLeft[0]);
        const top = Math.min(topLeft[1], topRight[1]);
        const right = Math.max(topRight[0], bottomRight[0]);
        const bottom = Math.max(bottomLeft[1], bottomRight[1]);

        const width = right - left;
        const height = bottom - top;

        newReelStyle = {
          position: 'absolute' as const,
          left: `${(left / canvasWidth) * 100}%`,
          top: `${(top / canvasHeight) * 100}%`,
          width: `${(width / canvasWidth) * 100}%`,
          height: `${(height / canvasHeight) * 100}%`,
          zIndex: 1000000,
          objectFit: 'cover' as const,
        };
      } else {
        const [x, y, width, height] = detectedProduct.box;
        
        newReelStyle = {
          position: 'absolute' as const,
          left: `${(x / canvasWidth) * 100}%`,
          top: `${(y / canvasHeight) * 100}%`,
          width: `${(width / canvasWidth) * 100}%`,
          height: `${(height / canvasHeight) * 100}%`,
          zIndex: 1000000,
          objectFit: 'cover' as const,
        };
      }
      
      // Temporary fixed size for debugging
      newReelStyle = {
        ...newReelStyle,
        width: '100px',
        height: '100px',
      };

      setReelStyle(newReelStyle);
      console.log("New ReelStyle:", newReelStyle);
    } else {
      setShowReelVideo(false);
    }

    console.log("ShowReelVideo:", showReelVideo);
  }, [detectedProduct, canvasRef]);

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
        className="relative w-full h-full rounded-md object-cover max-w-[640px] max-h-[640px]" 
        id="frame" 
      />
      <canvas 
        className="absolute top-0 left-0 w-full h-full z-99999 max-w-[640px] max-h-[640px]" 
        ref={canvasRef}
      />
      {showReelVideo && (
        <video
          autoPlay
          loop
          muted
          src="/assets/reels1.mp4"
          style={reelStyle}
          onError={(e) => console.error("Video error:", e)}
        />
      )}
    </div>
  );
}
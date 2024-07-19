<<<<<<< HEAD
import { RefObject, useEffect, useState, useCallback } from "react";
=======
import { RefObject, useEffect, useState } from "react";
>>>>>>> a803f28de3fb320f0e348888daf6d2125101fc22

interface VideoFeedProps {
  loading: boolean;
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  detectedProduct: { 
    name: string; 
    score: number; 
    box: number[]; 
<<<<<<< HEAD
    keypoints: number[] 
=======
    keypoints: [number, number][] 
>>>>>>> a803f28de3fb320f0e348888daf6d2125101fc22
  } | null;
}

export default function VideoFeed({ loading, videoRef, canvasRef, detectedProduct }: VideoFeedProps) {
  const [showReelVideo, setShowReelVideo] = useState(false);
  const [reelStyle, setReelStyle] = useState({});

<<<<<<< HEAD
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
=======
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
>>>>>>> a803f28de3fb320f0e348888daf6d2125101fc22

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
<<<<<<< HEAD
        className="relative w-full h-full rounded-md object-cover" 
        id="frame" 
        onLoadedMetadata={updateReelStyle}
      />
      <canvas 
        className="absolute top-0 left-0 w-full h-full z-10" 
=======
        className="relative w-full h-full rounded-md object-cover max-w-[640px] max-h-[640px]" 
        id="frame" 
      />
      <canvas 
        className="absolute top-0 left-0 w-full h-full z-99999 max-w-[640px] max-h-[640px]" 
>>>>>>> a803f28de3fb320f0e348888daf6d2125101fc22
        ref={canvasRef}
      />
      {showReelVideo && (
        <video
          autoPlay
          loop
<<<<<<< HEAD
          playsInline
          muted
          src="/assets/reels1.mp4"
          style={reelStyle}
          onError={(e) => console.log(`Video error: ${e}`)}
          onLoadedData={() => console.log("Reel video loaded successfully")}
        />
      )}      
=======
          muted
          src="/assets/reels1.mp4"
          style={reelStyle}
          onError={(e) => console.error("Video error:", e)}
        />
      )}
>>>>>>> a803f28de3fb320f0e348888daf6d2125101fc22
    </div>
  );
}

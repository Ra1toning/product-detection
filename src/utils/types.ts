import { RefObject } from "react";

export interface VideoFeedProps {
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
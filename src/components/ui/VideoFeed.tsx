import { RefObject } from "react";

interface VideoFeedProps {
  loading: boolean;
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  isRecording: boolean;
}

export default function VideoFeed({ loading, videoRef, canvasRef, isRecording }: VideoFeedProps) {
  return (
    <div className="relative mb-6 rounded-2xl overflow-hidden border-2 border-cyan-500 shadow-inner">
      {loading && (
        <div className="loader-container absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="loader"></div>
          <span className="loader-text text-white">Loading...</span>
        </div>
      )}
      <video autoPlay playsInline muted ref={videoRef} className="relative w-full h-full rounded-md object-cover max-w-[640px] max-h-[640px]" id="frame" />
      <canvas className="absolute top-0 left-0 w-full h-full z-99999 max-w-[640px] max-h-[640px]" ref={canvasRef}></canvas>

      {isRecording && (
        <div className="absolute top-3 right-3 flex items-center space-x-2 bg-black bg-opacity-50 px-3 py-1 rounded-full">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-white">REC</span>
        </div>
      )}
    </div>
  );
}
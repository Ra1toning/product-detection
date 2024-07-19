"use client"
import { useEffect, useRef, useState } from "react";
import { Webcam } from "@/utils/webcam";
import { detectFrame } from "@/utils/detectFrame";
import { Bebas_Neue } from 'next/font/google';
import StatusBar from "@/components/ui/StatusBar";
import VideoFeed from "@/components/ui/VideoFeed";
import ControlButtons from "@/components/ui/ControlButtons";
import ProductDetails from "@/components/ui/ProductDetails";
import SettingsModal from "@/components/ui/SettingsModal";
import { getProductName } from '@/utils/productMapping';

const poppins = Bebas_Neue({ weight: '400', subsets: ['latin'] });

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threshold = 0.70;
  const [ort, setOrt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const webcam = new Webcam();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [detectedProduct, setDetectedProduct] = useState<null | { 
    name: string; 
    score: number; 
    box: number[]; 
    keypoints: number[] 
  }>(null);
  const [lotteryNumbers, setLotteryNumbers] = useState<string[]>([]);
  const [currentLotteryNumber, setCurrentLotteryNumber] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;

    const setCanvasDimensions = () => {
      if (videoElement && canvasElement) {
        const safeWidth = Math.min(window.innerWidth, 640);
        const safeHeight = Math.min(window.innerHeight, 640);
        canvasElement.width = safeWidth;
        canvasElement.height = safeHeight;
      }
    };

    const handleVideoLoadedMetadata = () => {
      setCanvasDimensions();
      setLoading(false);
    };

    if (videoElement && canvasElement) {
      videoElement.addEventListener("loadedmetadata", handleVideoLoadedMetadata);
    }

    window.addEventListener("resize", setCanvasDimensions);

    setCanvasDimensions();

    return () => {
      window.removeEventListener("resize", setCanvasDimensions);
      if (videoElement) {
        videoElement.removeEventListener("loadedmetadata", handleVideoLoadedMetadata);
      }
    };
  }, []);

  useEffect(() => {
    const loadOrt = async () => {
      if (typeof window !== 'undefined') {
        const ortModule = await import('onnxruntime-web');
        ortModule.env.wasm.wasmPaths = {
          'ort-wasm.wasm': '/static/ort-wasm.wasm',
          'ort-wasm-simd.wasm': '/static/ort-wasm-simd.wasm',
          'ort-wasm-threaded.wasm': '/static/ort-wasm-threaded.wasm',
          'ort-wasm-simd-threaded.wasm': '/static/ort-wasm-simd-threaded.wasm',
          'ort-training-wasm-simd.wasm': '/static/ort-training-wasm-simd.wasm'
        };
        setOrt(ortModule);
      }
    };

    loadOrt();
  }, []);

  useEffect(() => {
    if (!ort) return;

    const loadModel = async () => {
      try {
        const session = await ort.InferenceSession.create('/models/new-best.onnx');

        const detectFrameWrapper = async () => {
          const result = await detectFrame(session, videoRef, canvasRef, threshold);
          if (result && result.score > threshold) {
            setDetectedProduct({ 
              name: result.class, 
              score: result.score, 
              box: result.box, 
              keypoints: result.keypoints.flat() 
            });
          } else {
            setDetectedProduct(null);
          }
          requestAnimationFrame(detectFrameWrapper);
        };

        webcam.open(videoRef, detectFrameWrapper);

        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;

        if (videoElement && canvasElement) {
          const safeWidth = Math.min(videoElement.videoWidth, window.innerWidth, 640);
          const safeHeight = Math.min(videoElement.videoHeight, window.innerHeight, 640);
          canvasElement.width = safeWidth;
          canvasElement.height = safeHeight;
        }
      } catch (error) {
        console.error("Error loading ONNX model:", error);
      }
    };

    loadModel();
  }, [ort]);

  useEffect(() => {
    const timer = setInterval(() => {
      const date = new Date();
      setCurrentTime(date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleCameraClick = () => {
    if (detectedProduct && detectedProduct.score > threshold) {
      const newLotteryNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
      setCurrentLotteryNumber(newLotteryNumber);
      setLotteryNumbers(prev => [...prev, newLotteryNumber]);
      setShowProductDetails(true);
    }
  };

  const handleCloseProductDetails = () => {
    setShowProductDetails(false);
    setCurrentLotteryNumber(null);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleDeleteLotteryNumber = (numberToDelete: string) => {
    setLotteryNumbers(prevNumbers => prevNumbers.filter(number => number !== numberToDelete));
  };

  return (
    <main className={`${poppins.className} flex min-h-screen flex-col items-center justify-center p-4 ${isDarkMode ? 'bg-gradient-to-br from-gray-600 to-black text-white' : ' bg-gradient-to-tl from-cyan-500 to-white'}`}>
      <div className={`w-full max-w-fit flex flex-col items-center p-6 rounded-3xl shadow-lg overflow-hidden
                      ${isDarkMode ? 'bg-gradient-to-b from-gray-800 to-gray-700' : 'bg-gradient-to-b from-white to-gray-200'}`}>
        <StatusBar currentTime={currentTime} />
        
        <div className="mb-6 flex items-center">
          <span className="ml-2 text-3xl text-cyan-500 font-semibold">Milk Detection</span>
        </div>
        
        <VideoFeed
          loading={loading}
          videoRef={videoRef}
          canvasRef={canvasRef}
          detectedProduct={detectedProduct}
        />
        
        <ControlButtons
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onCameraClick={handleCameraClick}
          onSettingsClick={handleSettingsClick}
        />

        {showProductDetails && detectedProduct && currentLotteryNumber && (
          <ProductDetails
            product={{
              name: getProductName(detectedProduct.name),
              score: detectedProduct.score,
              details: getProductName(detectedProduct.name)
            }}
            lotteryNumber={currentLotteryNumber}
            onClose={handleCloseProductDetails}
          />
        )}

        {showSettings && (
          <SettingsModal
            lotteryNumbers={lotteryNumbers}
            onClose={handleCloseSettings}
            onDelete={handleDeleteLotteryNumber}
          />
        )}
      </div>
    </main>
  );
}

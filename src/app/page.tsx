"use client"
import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { Webcam } from "@/utils/webcam";
import { non_max_suppression } from "@/utils/nonMaxSuppression";
import { renderBoxes } from "@/utils/renderBox";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Battery, Wifi, Settings, Camera  } from "lucide-react";
import BannerSection from "@/components/ui/BannerSection";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threshold = 0.80;
  const [ort, setOrt] = useState<any>(null);
  const webcam = new Webcam();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00");

  const preprocessImage = () => {
    const model_dim: [number, number] = [640, 640];

    const input = tf.tidy(() => {
      const img = tf.image
        .resizeBilinear(tf.browser.fromPixels(videoRef.current!), model_dim)
        .div(255.0)
        .transpose([2, 0, 1])
        .expandDims(0);
      return img;
    });

    return input;
  };

  const detectFrame = async (session: any) => {
    const modelDim = [640, 640];
    const videoElement = videoRef.current!;
    const canvasElement = canvasRef.current!;
    const ctx = canvasElement.getContext('2d')!;
    ctx.drawImage(videoElement, 0, 0, modelDim[0], modelDim[1]);

    const input = preprocessImage();

    const tensor = new ort.Tensor('float32', input.dataSync(), [1, 3, modelDim[0], modelDim[1]]);
    const feeds = { 'images': tensor };
    const outputMap = await session.run(feeds);
    const output = outputMap[session.outputNames[0]];

    const res = [];
    const dims = output.dims;
    const data = output.data;
    for (let i = 0; i < dims[0]; i++) {
      const item = [];
      for (let j = 0; j < dims[1]; j++) {
        item.push(data[i * dims[1] + j]);
      }
      res.push(item);
    }

    const detections = non_max_suppression(res);

    const boxes = detections.map(det => det.box);
    const scores = detections.map(det => det.score);
    const classDetect = detections.map(det => det.klass);
    const keypoints = detections.map(det => det.keypoints);

    renderBoxes(canvasRef, threshold, boxes, scores, classDetect, keypoints, modelDim[0], modelDim[1], videoElement.videoWidth, videoElement.videoHeight);

    requestAnimationFrame(() => detectFrame(session));
  };

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
        const session = await ort.InferenceSession.create('/models/best.onnx');

        webcam.open(videoRef, () => detectFrame(session));

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
  const toggleRecording = () => setIsRecording(!isRecording);

  console.warn = () => {};

  return (
    <main className={`flex min-h-screen flex-col items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className={`w-full max-w-fit flex flex-col items-center p-6 rounded-3xl shadow-lg overflow-hidden
                      ${isDarkMode ? 'bg-gradient-to-b from-gray-800 to-gray-700' : 'bg-gradient-to-b from-white to-gray-200'}`}>
        {/* Status Bar */}
        <div className="w-full flex justify-between items-center mb-4 text-sm font-medium">
          <span className="bg-opacity-50 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">{currentTime}</span>
          <div className="flex items-center space-x-3">
            <Wifi size={18} className="text-blue-500" />
            <Battery size={18} className="text-green-500" />
          </div>
        </div>

        {/* Logo */}
        <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">FU24</h1>
        <BannerSection />
        {/* Video Feed */}
        <div className="relative  mb-6 rounded-2xl overflow-hidden
                        border-4 border-opacity-50 border-white shadow-inner">

          <video autoPlay playsInline muted ref={videoRef} className="relative w-full h-full rounded-md object-cover max-w-[640px] max-h-[640px]" id="frame" />
          <canvas className="absolute top-0 left-0 w-full h-full z-99999 max-w-[640px] max-h-[640px]" ref={canvasRef}></canvas>

          {/* Recording Indicator */}
          {isRecording && (
            <div className="absolute top-3 right-3 flex items-center space-x-2 bg-black bg-opacity-50 px-3 py-1 rounded-full">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-white">REC</span>
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center space-x-6">
          <Button 
            className={`w-16 h-16 rounded-full transition-all duration-300 shadow-lg transform hover:scale-105
                        ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
            onClick={toggleRecording}
          >
            <Camera size={24} className="text-white" />
          </Button>

          <Button 
            className={`p-3 rounded-full transition-colors duration-300 shadow-md
                        ${isDarkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-white'}`}
            onClick={toggleTheme}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          <Button 
            className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 shadow-md transition-all duration-300 hover:rotate-90"
          >
            <Settings size={20} className="text-gray-600 dark:text-gray-300" />
          </Button>
        </div>
      </div>
    </main>
  );
}
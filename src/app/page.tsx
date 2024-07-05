"use client";
import { useEffect, useRef, useState } from "react";
import { Webcam } from "@/utils/webcam";
import { non_max_suppression } from "@/utils/nonMaxSuppression";
import { Moon, Sun, Battery, Wifi, Settings, Camera  } from "lucide-react";
import { Button } from "@/components/ui/button";
import { renderBoxes } from "@/utils/renderBox";
import * as tf from "@tensorflow/tfjs";
import Image from "next/image";
import "@/components/ui/loader.css";
import BannerSection from "@/components/ui/BannerSection";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threshold = 0.80;
  const [ort, setOrt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
    <main className={`flex min-h-screen flex-col items-center justify-center p-4 ${
      isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-100 to-indigo-200'
    }`}>
      <div className={`w-full max-w-max flex flex-col items-center p-8 rounded-3xl shadow-2xl overflow-hidden
                      ${isDarkMode ? 'bg-gradient-to-b from-gray-800 to-gray-700' : 'bg-gradient-to-b from-white to-gray-100'}`}>
        {/* Status Bar */}
        <div className="w-full flex justify-between items-center mb-6 text-sm font-medium">
          <span className={`px-3 py-1.5 rounded-full ${
            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-indigo-100 text-indigo-800'
          }`}>
            {currentTime}
          </span>
          <div className="flex items-center space-x-3">
            <Wifi size={18} className={isDarkMode ? "text-indigo-400" : "text-indigo-600"} />
            <Battery size={18} className={isDarkMode ? "text-green-400" : "text-green-600"} />
          </div>
        </div>
    
        {/* Logo */}
        <div className="content-center">
          <Image src="/logo.svg" alt="Logo" width={360} height={100} className="filter drop-shadow-md" />
        </div>
        <BannerSection />
    
        {/* Video Feed */}
        <div className="relative mb-8 rounded-2xl overflow-hidden border-4 border-opacity-50 shadow-xl
                        ${isDarkMode ? 'border-gray-600' : 'border-indigo-200'}">
        {loading && (
          <div className="loader-container">
            <div className="loader"></div>
            <span className="loader-text">Loading...</span>
          </div>
        )}
        
          <video autoPlay playsInline muted ref={videoRef} className="relative w-full h-full rounded-xl object-cover max-w-[480px] max-h-[480px]" id="frame" />
          <canvas className="absolute top-0 left-0 w-full h-full z-10 max-w-[480px] max-h-[480px]" ref={canvasRef}></canvas>
    
          {/* Recording Indicator */}
          {isRecording && (
            <div className="absolute top-3 right-3 flex items-center space-x-2 bg-black bg-opacity-70 px-3 py-1.5 rounded-full">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-white">REC</span>
            </div>
          )}
        </div>
    
        {/* Control Buttons */}
        <div className="flex items-center space-x-8">
          <Button
            className={`w-20 h-20 rounded-full transition-all duration-300 shadow-lg transform hover:scale-110 focus:outline-none focus:ring-4 ${
              isRecording 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-red-300' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:ring-blue-300'
            }`}
            onClick={toggleRecording}
          >
            <Camera size={32} className="text-white" />
          </Button>
    
          <Button
            className={`p-4 rounded-full transition-all duration-300 shadow-md transform hover:scale-110 focus:outline-none focus:ring-4 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 focus:ring-yellow-300 text-gray-900' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:ring-indigo-300 text-white'
            }`}
            onClick={toggleTheme}
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </Button>
        </div>
      </div>
    </main>
  );
}
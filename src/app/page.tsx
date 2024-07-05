"use client"
import { useEffect, useRef, useState } from "react";
import TitleSection from "@/components/ui/TitleSection";
import BannerSection from "@/components/ui/BannerSection";
import { Webcam } from "@/utils/webcam";
import { non_max_suppression } from "@/utils/nonMaxSuppression";
import { renderBoxes } from "@/utils/renderBox";
import * as tf from "@tensorflow/tfjs";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threshold = 0.80;
  const [ort, setOrt] = useState<any>(null);
  const webcam = new Webcam();

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

  console.warn = () => {};

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-gray-900">
      <div className="w-full max-w-fit flex flex-col items-start p-4 bg-gray-200 dark:bg-zinc-800 rounded-lg shadow-lg mb-4">
        <TitleSection />
        <BannerSection />
        <div className="content relative">
          <video autoPlay playsInline muted ref={videoRef} className="relative w-full h-full rounded-md object-cover max-w-[640px] max-h-[640px]" id="frame" />
          <canvas className="absolute top-0 left-0 w-full h-full z-99999 max-w-[640px] max-h-[640px]" ref={canvasRef}></canvas>
        </div>
      </div>
    </main>
  );
}
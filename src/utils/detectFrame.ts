import { preprocessImage } from './preprocessImage';
import { non_max_suppression } from './nonMaxSuppression';
import { renderBoxes } from './renderBox';
import * as ort from 'onnxruntime-web';
<<<<<<< HEAD
=======
import labels from "./labels.json";
>>>>>>> a803f28de3fb320f0e348888daf6d2125101fc22
import { getProductName } from '@/utils/productMapping';

export const detectFrame = async (session: any, videoRef: React.RefObject<HTMLVideoElement>, canvasRef: React.RefObject<HTMLCanvasElement>, threshold: number) => {
  const modelDim = [640, 640];
  const videoElement = videoRef.current!;
  const canvasElement = canvasRef.current!;
  const ctx = canvasElement.getContext('2d')!;
  ctx.drawImage(videoElement, 0, 0, modelDim[0], modelDim[1]);

  const input = preprocessImage(videoRef);

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

  if (detections.length > 0) {
    const bestDetection = detections[0]; 
    return {
      class: getProductName(bestDetection.klass.toString()),
      score: bestDetection.score,
      box: bestDetection.box,
      keypoints: bestDetection.keypoints
    };
  }

  return null;
};
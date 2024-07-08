import * as tf from "@tensorflow/tfjs";

export const preprocessImage = (videoRef: React.RefObject<HTMLVideoElement>) => {
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

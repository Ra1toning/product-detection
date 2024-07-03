export class Webcam {
  async getCameraAccess(videoRef: React.RefObject<HTMLVideoElement>, setError: React.Dispatch<React.SetStateAction<string | null>>): Promise<void> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Media devices or getUserMedia not supported.");
      }

      let constraints: MediaStreamConstraints = { video: true };

      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        constraints = { video: { facingMode: { exact: "environment" } } };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: unknown) {
      let message: string;

      if (err instanceof Error) {
        message = err.message;
      } else {
        message = String(err);
      }

      console.error("Error accessing the camera:", message);
      setError("Error accessing the camera: " + message);
    }
  }
}

export class Webcam {
  open(videoRef, onLoaded, width, height) {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            facingMode: "environment",
            width: { ideal: width },
            height: { ideal: height }
          },
        })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) {
                videoRef.current.play();
                onLoaded();
              }
            };
          }
        });
    } else alert("Can't open Webcam!");
  }

  close(videoRef) {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
      videoRef.current.srcObject = null;
    } else alert("Please open Webcam first!");
  }
}
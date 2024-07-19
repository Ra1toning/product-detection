import labels from "./labels.json";

function normalizeCoordinates(box, canvasWidth, canvasHeight) {
  if (Math.max(...box) <= 1) {
    return [
      box[0] * canvasWidth,
      box[1] * canvasHeight,
      box[2] * canvasWidth,
      box[3] * canvasHeight
    ];
  }
  return box;
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
export function renderBoxes(canvasRef, threshold, boxes_data, scores_data, classes_data, keypoints_data, modelWidth, modelHeight, videoWidth, videoHeight) {
  if (!canvasRef || !canvasRef.current) {
    return;
  }

  const ctx = canvasRef.current.getContext("2d");
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const font = "16px 'Segoe UI', Roboto, Arial, sans-serif";
  ctx.font = font;
  ctx.textBaseline = "top";

  const scaleX = canvasWidth / modelWidth;
  const scaleY = canvasHeight / modelHeight;
  const scale = Math.min(scaleX, scaleY);

  const padX = (canvasWidth - modelWidth * scale) / 2;
  const padY = (canvasHeight - modelHeight) / 2;

  for (let i = 0; i < scores_data.length; ++i) {
    if (scores_data[i] > threshold) {
      const classIndex = classes_data[i];
      const klass = labels[classIndex] || "Unknown";
      let score = scores_data[i];
      if (score > 1) {
        score = score / 100;
      }

      let [x1, y1, x2, y2] = normalizeCoordinates(boxes_data[i], modelWidth, modelHeight);

      // Convert coordinates to canvas dimensions
      x1 = x1 * scale + padX;
      y1 = y1 + padY;
      x2 = x2 * scale + padX;
      y2 = y2 + padY;

      const width = x2 - x1;
      const height = y2 - y1;

      // Create gradient for the bounding box
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, "rgba(0, 255, 255, 0.8)");
      gradient.addColorStop(1, "rgba(255, 0, 255, 0.8)");

      // Draw bounding box with rounded corners
      ctx.lineWidth = 3;
      ctx.strokeStyle = gradient;
      drawRoundedRect(ctx, x1, y1, width, height, 10);
      ctx.stroke();

      // Add a subtle glow effect
      ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
      ctx.shadowBlur = 10;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw label with score
      const labelText = `${klass} - ${(score * 100).toFixed(1)}%`;
      const textWidth = ctx.measureText(labelText).width;
      const textHeight = parseInt(font, 10);
      const labelPadding = 5;

      // Create gradient for label background
      const labelGradient = ctx.createLinearGradient(x1, y1 - textHeight - labelPadding * 2, x1 + textWidth + labelPadding * 2, y1);
      labelGradient.addColorStop(0, "rgba(0, 0, 0, 0.7)");
      labelGradient.addColorStop(1, "rgba(50, 50, 50, 0.7)");

      // Draw label background
      ctx.fillStyle = labelGradient;
      drawRoundedRect(ctx, x1 - labelPadding, y1 - (textHeight + labelPadding * 2), textWidth + labelPadding * 2, textHeight + labelPadding * 2, 5);
      ctx.fill();

      // Draw label text
      ctx.fillStyle = "#ffffff";
      ctx.fillText(labelText, x1, y1 - (textHeight + labelPadding));

      // Render keypoints
      if (keypoints_data && keypoints_data[i]) {
        const keypoints = keypoints_data[i];
        for (let j = 0; j < keypoints.length; j += 3) {
          const x = keypoints[j] * scale + padX;
          const y = keypoints[j + 1] + padY;
          const score = keypoints[j + 2];

          if (score) {
            // Draw keypoint
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
            ctx.fill();

            // Draw keypoint label
            ctx.fillStyle = 'white';
            ctx.fillText(`${j / 3}`, x + 5, y - 5);
          }
        }
      }
    }
  }
}

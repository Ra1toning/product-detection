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

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, rotation) {
  let rot = Math.PI / 2 * 3 + rotation;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();

  // Create gradient
  const gradient = ctx.createRadialGradient(cx, cy, innerRadius, cx, cy, outerRadius);
  gradient.addColorStop(0, 'yellow');
  gradient.addColorStop(1, 'orange');
  ctx.fillStyle = gradient;
  ctx.fill();

  // Add glow effect
  ctx.shadowColor = 'rgba(255, 165, 0, 0.5)';
  ctx.shadowBlur = 20;
  ctx.strokeStyle = 'orange';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.shadowBlur = 0; // Reset shadow blur to default
}

function drawSparkles(ctx, cx, cy, count, radius) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;
    const x = cx + distance * Math.cos(angle);
    const y = cy + distance * Math.sin(angle);

    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI);

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 2);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

export function renderBoxes(canvasRef, threshold, boxes_data, scores_data, classes_data, keypoints_data, modelWidth, modelHeight, videoWidth, videoHeight) {
  if (!canvasRef || !canvasRef.current) {
    return;
  }
  const ctx = canvasRef.current.getContext("2d");
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const font = "18px sans-serif";
  ctx.font = font;
  ctx.textBaseline = "top";

  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  // Calculate scale factors
  const scaleX = canvasWidth / modelWidth;
  const scaleY = canvasHeight / modelHeight;
  const scale = Math.min(scaleX, scaleY);

  // Calculate padding
  const padX = (canvasWidth - modelWidth * scale) / 2;
  const padY = (canvasHeight - modelHeight) / 2;

  const starOuterRadius = 10;
  const starInnerRadius = 5;
  const sparkleCount = 10;
  const sparkleRadius = 20;
  let rotation = 0;

  function animate() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let i = 0; i < scores_data.length; ++i) {
      if (scores_data[i] > threshold) {
        const classIndex = classes_data[i];
        const klass = labels[classIndex] || "Unknown";
        let score = scores_data[i];
        if (score > 1) {
          score = score / 100;
        }

        let [x1, y1, x2, y2] = normalizeCoordinates(boxes_data[i], modelWidth, modelHeight);

        // Scale and adjust for padding
        x1 = x1 * scale + padX;
        y1 = y1 + padY;
        x2 = x2 * scale + padX;
        y2 = y2 + padY;

        const width = x2 - x1;
        const height = y2 - y1;

        // Draw bounding box
        ctx.strokeStyle = "#B033FF";
        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, width, height);

        // Draw stars at all four corners with rotation and sparkles
        drawStar(ctx, x1, y1, 5, starOuterRadius, starInnerRadius, rotation);
        drawStar(ctx, x2, y1, 5, starOuterRadius, starInnerRadius, rotation);
        drawStar(ctx, x1, y2, 5, starOuterRadius, starInnerRadius, rotation);
        drawStar(ctx, x2, y2, 5, starOuterRadius, starInnerRadius, rotation);
        drawSparkles(ctx, x1, y1, sparkleCount, sparkleRadius);
        drawSparkles(ctx, x2, y1, sparkleCount, sparkleRadius);
        drawSparkles(ctx, x1, y2, sparkleCount, sparkleRadius);
        drawSparkles(ctx, x2, y2, sparkleCount, sparkleRadius);

        // Draw label with score
        const labelText = `${klass} - ${(score * 100).toFixed(1)}%`;
        ctx.fillStyle = "#B033FF";
        const textWidth = ctx.measureText(labelText).width;
        const textHeight = parseInt(font, 10);
        ctx.fillRect(x1 - 1, y1 - (textHeight + 2), textWidth + 2, textHeight + 2);

        ctx.fillStyle = "#ffffff";
        ctx.fillText(labelText, x1 - 1, y1 - (textHeight + 2));
      }
    }

    rotation += 0.02;
    requestAnimationFrame(animate);
  }

  animate();
}

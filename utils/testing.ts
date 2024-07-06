// utils/testing.ts
import { MeshResult, Prediction, Keypoint } from "@/types/types"; // Adjust the path as necessary

function euclideanDistanceSum(x: Point, points: Point[]) {
  let sum = 0;

  for (let i = 0; i < points.length; i++) {
    let dx = x.x - points[i].x;
    let dy = x.y - points[i].y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    sum += distance;
  }

  return sum / points.length;
}

export const getMesh = (predictions: Prediction[]): MeshResult => {
  let namedKeypoints: { [key: string]: Keypoint[] } | null = null;
  let leftEyePoint: Keypoint | null = null;
  let rightEyePoint: Keypoint | null = null;
  let euclideanDistance: { value: number; time: Date } | null = null;

  if (predictions.length > 0) {
    const keypoints = predictions[0].keypoints;

    namedKeypoints = {};

    namedKeypoints["leftEye"] = keypoints.filter((obj) => obj.name === "leftEye");
    namedKeypoints["rightEye"] = keypoints.filter((obj) => obj.name === "rightEye");

    const faceOvalIndexes = [
      58, 172, 136, 150, 149, 176, 178, 148, 152, 377, 400, 378, 379, 365, 397,
      288, 381,
    ];
    namedKeypoints["faceOval"] = faceOvalIndexes.map((d) => keypoints[d]);

    leftEyePoint = namedKeypoints["leftEye"][0];
    rightEyePoint = namedKeypoints["rightEye"][0];

    euclideanDistance = {
      value: euclideanDistanceSum(leftEyePoint, namedKeypoints["faceOval"]),
      time: new Date(),
    };
  }

  return {
    euclideanDistance,
    leftEyePoint,
    rightEyePoint,
    namedKeypoints,
  };
};



export const drawOnCanvas = (
  ctx: CanvasRenderingContext2D | null,
  leftEyePoint: { x: number; y: number } | null,
  rightEyePoint: { x: number; y: number } | null,
  namedKeypoints: { [key: string]: { x: number; y: number }[] } | null
) => {
  if (ctx && namedKeypoints) {
    // Clear the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw the left eye point
    if (leftEyePoint) {
      ctx.beginPath();
      ctx.arc(leftEyePoint.x, leftEyePoint.y, 1 /* radius */, 0, 2 * Math.PI);
      ctx.fillStyle = "aqua";
      ctx.fill();
    }

    // Draw the right eye point
    if (rightEyePoint) {
      ctx.beginPath();
      ctx.arc(rightEyePoint.x, rightEyePoint.y, 1 /* radius */, 0, 2 * Math.PI);
      ctx.fillStyle = "red";  // Different color for the right eye marker
      ctx.fill();
    }

    // Draw the face oval keypoints
    if (namedKeypoints["faceOval"]) {
      namedKeypoints["faceOval"].forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1 /* radius */, 0, 2 * Math.PI);
        ctx.fillStyle = "aqua";
        ctx.fill();

        // Draw lines from the left eye to the face oval points
        if (leftEyePoint) {
          ctx.beginPath();
          ctx.moveTo(leftEyePoint.x, leftEyePoint.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }

        // Draw lines from the right eye to the face oval points
        if (rightEyePoint) {
          ctx.beginPath();
          ctx.moveTo(rightEyePoint.x, rightEyePoint.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }
      });
    }
  }
};

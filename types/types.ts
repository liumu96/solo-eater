// types.ts

export interface Keypoint {
    x: number;
    y: number;
    z?: number;
    name?: string;
  }
  
  export interface MeshResult {
    euclideanDistance: { value: number; time: Date } | null;
    leftEyePoint: Keypoint | null;
    rightEyePoint: Keypoint | null;
    namedKeypoints: { [key: string]: Keypoint[] } | null;
  }
  
  export interface Prediction {
    keypoints: Keypoint[];
  }
  
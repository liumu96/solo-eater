import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getMesh } from "@/utils/testing";
import * as facemesh from "@tensorflow-models/face-landmarks-detection";
import { MeshResult, Prediction, Keypoint } from "@/types/types"; 
import {calculateEAR, euclideanDistance, isLookingAtScreen} from "@/utils/eyeUtils"

export const useFaceMesh = (
  videoRef: React.RefObject<HTMLVideoElement> | null
) => {
  const effectRan = useRef(false);
  const [animate, setAnimate] = useState(false);
  const [lookingAtScreen, setLookingAtScreen] = useState(false);
  const meshDataRef = useRef<MeshResult>({
    euclideanDistance: null,
    leftEyePoint: null,
    rightEyePoint: null,
    namedKeypoints: null,
  });

  const UPDATE_MS = 20;
  const intervalRef = useRef<number | null>(null);

  const runFacemesh = useCallback(async () => {
    const detect = async (net: facemesh.FaceLandmarksDetector) => {
      if (videoRef && videoRef.current && videoRef.current.readyState === 4) {
        const video = videoRef.current;
        const face = await net.estimateFaces(video);

        if (face) {
          const { euclideanDistance, leftEyePoint, rightEyePoint, namedKeypoints } = getMesh(
            face as Prediction[]
          );

          meshDataRef.current = {
            euclideanDistance,
            leftEyePoint,
            rightEyePoint,
            namedKeypoints,
          };

          // Check if the user is looking at the screen
          if (namedKeypoints && namedKeypoints["leftEye"] && namedKeypoints["rightEye"]) {
            const isLooking = isLookingAtScreen(namedKeypoints["leftEye"], namedKeypoints["rightEye"]);
            setLookingAtScreen(isLooking);
          }

          setAnimate((prevCheck) => !prevCheck);
        }
      }
    };

    const detectorConfig: facemesh.MediaPipeFaceMeshMediaPipeModelConfig = {
      runtime: "mediapipe",
      solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
      refineLandmarks: true,
    };

    const detector = await facemesh.createDetector(
      facemesh.SupportedModels.MediaPipeFaceMesh,
      detectorConfig
    );

    intervalRef.current = window.setInterval(() => {
      detect(detector);
    }, UPDATE_MS);
  }, [videoRef]);

  useEffect(() => {
    if (!videoRef || !videoRef.current) return;

    if (effectRan.current === false) {
      runFacemesh();
      effectRan.current = true;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [runFacemesh, videoRef]);

  return useMemo(
    () => ({
      animate,
      euclideanDistance: meshDataRef.current.euclideanDistance,
      leftEyePoint: meshDataRef.current.leftEyePoint,
      rightEyePoint: meshDataRef.current.rightEyePoint,
      namedKeypoints: meshDataRef.current.namedKeypoints,
      lookingAtScreen,
    }),
    [animate, lookingAtScreen]
  );
};

"use client";
import React, { useEffect, useRef, useState } from "react";
import { useVideo } from "@/context/VideoContext";
import { useFaceMesh } from "@/hooks/useFaceMesh";
import { drawOnCanvas } from "@/utils/testing";
import useSignalProcessing from "@/hooks/useSignalProcessing";
import { avgFrequency } from "@/utils/avgFrequency";
import { useData } from "@/context/DataContext";

interface ChewingTestingProps {
  onFrequencyUpdate?: (frequency: number | null) => void; // Make this prop optional
}

const ChewingTesting: React.FC<ChewingTestingProps> = ({
  onFrequencyUpdate,
}) => {
  const [maximized, setMaximized] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // our canvas
  const { videoRef } = useVideo();
  const {
      leftEyePoint,
      rightEyePoint,
      noseTip,
      namedKeypoints,
      animate,
      euclideanDistance,
      isGazing,
    } = useFaceMesh(videoRef);

  // const [chewingFrequency, setChewingFrequency] = useState<number | null>(null);
  const { chewingFrequency, setChewingFrequency } = useData();
  const [cutOffFrequency, setCutOffFrequency] = useState(0.12);
  const [itemsNo, setItemsNo] = useState(240);
  const [gazingStartTime, setGazingStartTime] = useState<number | null>(null);
  const [reminder, setReminder] = useState<string | null>(null);
  const windowSize = 3.5;
  const signalProcessingData = useSignalProcessing(
    animate,
    noseTip,
    euclideanDistance,
    cutOffFrequency,
    itemsNo
  );

  // Define a default onFrequencyUpdate function if not provided

  //check of the signal proceesing data is empty
  if (!signalProcessingData) {
    console.log("Signal Processing Data is empty");
  }

  const filteredPeaks = signalProcessingData.peaks;
  if (!filteredPeaks) {
    console.log("Filtered Peaks is empty");
  }
  useEffect(() => {
    if (typeof window === "undefined") return;

    const calculateChewingFrequency = () => {
      console.log("Filtered Peaks:", filteredPeaks);
      // check if the filteredPeaks is empty
      if (filteredPeaks.length === 0) {
        setChewingFrequency(0.5555);
        return;
      }
      const timeNow = Date.now();
      const frequency = avgFrequency(signalProcessingData.filteredPeaks, timeNow, windowSize);
      console.log("Calculated Frequency:", frequency); // Debug log
      setChewingFrequency(frequency); // Use the provided function or the default one
    };

    // Calculate initially
    calculateChewingFrequency();

    // Set up interval to calculate every second
    const interval = setInterval(() => {
      calculateChewingFrequency();
    }, 800); // Every second

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [animate]);
  
  const [isEating, setIsEating] = useState(true);

  useEffect(() => {
    if (isGazing) {
      setGazingStartTime(Date.now());
      if (gazingStartTime) {
        const elapsedTime = (Date.now() - gazingStartTime) / 1000; // time in seconds
        if (
          elapsedTime > 3 &&
          (chewingFrequency === null || chewingFrequency < 10)
        ) {
          setIsEating(false);
          setReminder(
            "Please don't forget to chew your food while watching the video."
          );
        } else if (gazingStartTime) {
          setReminder(null);
          setIsEating(true);
        }
      }
    } else {

      setGazingStartTime(null);
    }
  }, [chewingFrequency, isGazing]);

  useEffect(() => {
    if (!videoRef.current || typeof window === "undefined") return;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const handleMetadataLoaded = () => {
      if (videoRef.current && canvasRef.current) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
      }
    };

    const drawCanvas = () => {
      if (
        canvasRef.current &&
        leftEyePoint &&
        rightEyePoint &&
        noseTip &&
        namedKeypoints &&
        ctx
      ) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawOnCanvas(ctx, leftEyePoint, rightEyePoint, namedKeypoints);

        // Display whether the user is looking at the screen
        ctx.font = "16px Arial";
        ctx.fillStyle = "red";
        ctx.fillText(
          isGazing ? "Looking at screen" : "Not looking at screen",
          10,
          30
        );

        // Display reminder
        if (reminder) {
          ctx.fillStyle = "yellow";
          ctx.fillText(reminder, 10, 50);
        }
      }
      requestAnimationFrame(drawCanvas);
    };

    videoRef.current.addEventListener("loadedmetadata", handleMetadataLoaded);

    const animationId = requestAnimationFrame(drawCanvas);

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener(
          "loadedmetadata",
          handleMetadataLoaded
        );
      }
      cancelAnimationFrame(animationId);
    };
  }, [
    leftEyePoint,
    rightEyePoint,
    noseTip,
    namedKeypoints,
    isGazing,
    animate,
    isEating,
    reminder,
    videoRef,
  ]);

  const toggleMaximize = () => {
    setMaximized(!maximized);
  };

  return (
    <div
      onClick={toggleMaximize}
      className="relative w-full h-full flex justify-center items-center"
    >
      <video
        ref={videoRef}
        id="video"
        autoPlay={true}
        className="absolute top-0 left-0 w-full h-full object-contain z-10"
      />

      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full object-contain z-20 pointer-events-none"
      />
      <p className="absolute right-0 text-red">
        Frequency is: {chewingFrequency !== null ? chewingFrequency : "N/A"}
      </p>
    </div>
  );
};

export default ChewingTesting;

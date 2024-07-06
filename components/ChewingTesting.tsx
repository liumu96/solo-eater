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
    namedKeypoints,
    animate,
    euclideanDistance,
    lookingAtScreen,
  } = useFaceMesh(videoRef);

  // const [chewingFrequency, setChewingFrequency] = useState<number | null>(null);
  const { chewingFrequency, setChewingFrequency } = useData();
  const [cutOffFrequency, setCutOffFrequency] = useState(0.12);
  const [itemsNo, setItemsNo] = useState(240);
  const [isGazing, setIsGazing] = useState(false);
  const [gazingStartTime, setGazingStartTime] = useState<number | null>(null);
  const [reminder, setReminder] = useState<string | null>(null);

  const signalProcessingData = useSignalProcessing(
    animate,
    leftEyePoint,
    rightEyePoint,
    euclideanDistance,
    cutOffFrequency,
    itemsNo
  );

  // Define a default onFrequencyUpdate function if not provided
  const defaultOnFrequencyUpdate = (frequency: number | null) => {
    console.log("Updated Frequency:", frequency);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const calculateChewingFrequency = () => {
      console.log("Filtered Peaks:", signalProcessingData.filteredPeaks);
      const frequency = avgFrequency(signalProcessingData.filteredPeaks, 5);
      console.log("Calculated Frequency:", frequency); // Debug log
      setChewingFrequency(frequency);
      (onFrequencyUpdate || defaultOnFrequencyUpdate)(frequency); // Use the provided function or the default one
    };

    calculateChewingFrequency();
  }, [animate, onFrequencyUpdate, signalProcessingData.filteredPeaks]); // Added signalProcessingData.filteredPeaks as dependency

  useEffect(() => {
    console.log("Chewing Frequency Updated:", chewingFrequency); // Debug log
  }, [chewingFrequency]);

  useEffect(() => {
    if (lookingAtScreen) {
      if (!isGazing) {
        setIsGazing(true);
        setGazingStartTime(Date.now());
      } else if (gazingStartTime) {
        const elapsedTime = (Date.now() - gazingStartTime) / 1000; // time in seconds
        if (
          elapsedTime > 10 &&
          (chewingFrequency === null || chewingFrequency < 10)
        ) {
          setReminder(
            "Please don't forget to chew your food while watching the video."
          );
        } else {
          setReminder(null);
        }
      }
    } else {
      setIsGazing(false);
      setGazingStartTime(null);
    }
  }, [lookingAtScreen, chewingFrequency]);

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
        namedKeypoints &&
        ctx
      ) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawOnCanvas(ctx, leftEyePoint, rightEyePoint, namedKeypoints);

        // Display whether the user is looking at the screen
        ctx.font = "16px Arial";
        ctx.fillStyle = "red";
        ctx.fillText(
          lookingAtScreen ? "Looking at screen" : "Not looking at screen",
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
    namedKeypoints,
    lookingAtScreen,
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
        Frequency is: {chewingFrequency}
      </p>
    </div>
  );
};

export default ChewingTesting;

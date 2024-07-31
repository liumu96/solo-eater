"use client";
import React, { useEffect, useRef, useState } from "react";
import { useVideo } from "@/context/VideoContext";
import { useFaceMesh } from "@/hooks/useFaceMesh";
import { drawOnCanvas } from "@/utils/testing";
import useSignalProcessing from "@/hooks/useSignalProcessing";
import { avgFrequency, avgFreq } from "@/utils/avgFrequency";
import { useData } from "@/context/DataContext";

interface ChewingTestingProps {
  onFrequencyUpdate?: (frequency: number | null) => void; // Make this prop optional
}

const ChewingTesting: React.FC<ChewingTestingProps> = ({
  onFrequencyUpdate,
}) => {
  const [maximized, setMaximized] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // our canvas

  const {
    videoRef,
    startRecording,
    stopRecording,
    downloadRecording,
    requestCameraPermission,
  } = useVideo();

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
  const { chewingFrequency, setChewingFrequency, isEating, setIsEating } =
    useData();
  const [cutOffFrequency, setCutOffFrequency] = useState(0.06);
  const [itemsNo, setItemsNo] = useState(240);
  const [gazingStartTime, setGazingStartTime] = useState<number | null>(null);
  const [reminder, setReminder] = useState<string | null>(null);
  const windowSize = 3;
  const signalProcessingData = useSignalProcessing(
    animate,
    noseTip,
    euclideanDistance,
    cutOffFrequency,
    itemsNo
  );

  // Define a default onFrequencyUpdate function if not provided
  const defaultOnFrequencyUpdate = (frequency: number | null) => {
    // console.log("Updated Frequency:", frequency);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const defaultOnFrequencyUpdate = (frequency: number | null) => {
      // console.log("Frequency:", frequency);
    };

    const calculateChewingFrequency = () => {
      // console.log("Filtered Peaks:", signalProcessingData.filteredPeaks);
      const timeNow = Date.now();
      const frequency = avgFrequency(
        signalProcessingData.filteredPeaks,
        timeNow,
        windowSize
      );
      const oneFrequency = avgFrequency(
        signalProcessingData.filteredPeaks,
        timeNow,
        1
      );
      const twoFrequency = avgFrequency(
        signalProcessingData.filteredPeaks,
        timeNow,
        2
      );
      const frequencies = [oneFrequency, twoFrequency, frequency]
      //console.log("signalProcessingData.filteredPeaks", signalProcessingData.filteredPeaks);
      //console.log("Calculated Frequency:", frequencies); // Debug log
      setChewingFrequency(frequencies);
      (onFrequencyUpdate || defaultOnFrequencyUpdate)(frequency); // Use the provided function or the default one
    };

    // Calculate initially
    calculateChewingFrequency();
    console.log("Calculated Frequency:", chewingFrequency);
    // Set up interval to calculate every second， 
    const interval = setInterval(() => {
      calculateChewingFrequency();
    }, 800); // Every second
    //TODO
    // 为什么随便设置一个时间就可以了， peaks的间距， 两秒内di yu 17， 张嘴持续几秒算吃饭
    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [animate]); // Only run when the animation changes

  //useEffect(() => {
    // console.log("Chewing Frequency Updated:", chewingFrequency); // Debug log
  //}, [chewingFrequency]);
  useEffect(() => {
    if (isGazing) {
      // this is not needed setGazingStartTime(Date.now());
      if (chewingFrequency[2] === null || chewingFrequency[2] < 20) {
        setIsEating(false);
        setReminder(
          "Please don't forget to chew your food while watching the video."
        );
      } else {
        setIsEating(true);
        setReminder(null);
      }
    } else {
      setIsEating(false);
      setReminder(null);
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
        noseTip &&
        namedKeypoints &&
        ctx
      ) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        drawOnCanvas(ctx, noseTip, namedKeypoints);

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

  useEffect(() => {
    if (videoRef.current && !videoRef.current.srcObject) {
      console.log(videoRef.current, "videoRef.current11");
      requestCameraPermission();
    }
  }, [videoRef.current]);

  const [startChewing, setStartChewing] = useState(false);

  useEffect(() => {
    if (chewingFrequency && !startChewing) {
      setStartChewing(true);
      startRecording();
    }
  }, [chewingFrequency]);

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
        <button onClick={stopRecording} className="cursor-pointer">
          Stop Recording
        </button>
        <button onClick={downloadRecording} className="cursor-pointer">
          Download
        </button>
      </p>
    </div>
  );
};

export default ChewingTesting;
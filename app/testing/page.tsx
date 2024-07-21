"use client";
import React, { useState } from "react";
import ChewingTesting from "@/components/ChewingTesting";
import { VideoProvider } from "@/context/VideoContext";
import EyeJawDistanceChart from "@/components/EyeJawDistanceChart";
import Resizer from "@/components/Resizer";

const TestingPage = () => {
  const [topHeight, setTopHeight] = useState((2 / 3) * window.innerHeight);
  const [bottomHeight, setBottomHeight] = useState(
    (1 / 3) * window.innerHeight
  );

  const handleResize = (clientY: number) => {
    const newTopHeight = clientY;
    const newBottomHeight = window.innerHeight - clientY;
    setTopHeight(newTopHeight);
    setBottomHeight(newBottomHeight);
  };

  return (
    // <VideoProvider>
    <div className="w-full min-h-screen flex flex-col">
      <div style={{ height: `${topHeight}px` }} className="relative">
        <ChewingTesting />
      </div>
      <Resizer onResize={handleResize} />
      <div style={{ height: `${bottomHeight}px` }} className="relative">
        <EyeJawDistanceChart />
      </div>
    </div>
    // </VideoProvider>
  );
};

export default TestingPage;

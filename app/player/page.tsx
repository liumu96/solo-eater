"use client";

import React, { useEffect, useRef, useState } from "react";
import YouTubePlayer from "@/components/YouTubePlayer";
import BackButton from "@/components/BackButton";
import DanmakuComp from "@/components/Danmaku";
import { useData } from "@/context/DataContext";
import { VideoProvider } from "@/context/VideoContext";
import dynamic from "next/dynamic";

// Dynamically import the ChewingTesting component with SSR disabled
const ChewingTestingNoSSR = dynamic(
  () => import("@/components/ChewingTesting"),
  {
    ssr: false, // This disables server-side rendering for the component
  }
);

const PlayerPage: React.FC = () => {
  const { videoLink, chewingFrequency } = useData();
  const [isEating, setIsEating] = useState(true);
  const threshold = 20; // Set your threshold value here

  // TODO: isEating
  useEffect(() => {
    if (chewingFrequency < threshold) {
      setIsEating(false);
    } else {
      setIsEating(true);
    }
  }, [chewingFrequency]);

  // 提取 YouTube 视频 ID https://www.youtube.com/watch?v=lAmXfsZvTFo&ab_channel=GhibliRelaxingSoul
  const getYouTubeVideoId = (url: string) => {
    if (videoLink) {
      const urlParams = new URLSearchParams(new URL(url).search);
      return urlParams.get("v");
    }
    return "";
  };

  // 提取 YouTube 视频 ID
  const videoId = getYouTubeVideoId(videoLink);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-black">
      <div className="absolute top-4 left-4 text-white z-50">
        <BackButton fontSize={48} />
      </div>

      <div className="w-full h-full flex flex-col items-center justify-center z-40">
        {videoId ? (
          <div className="w-full h-full flex items-center justify-center">
            <YouTubePlayer videoId={videoId} />
            {!isEating && <DanmakuComp />}
          </div>
        ) : (
          <div className="text-white">
            No video link provided or invalid video ID.
          </div>
        )}
      </div>
      <VideoProvider>
        <div className="absolute w-full min-h-screen">
          <ChewingTestingNoSSR />
        </div>
      </VideoProvider>
    </div>
  );
};

export default PlayerPage;

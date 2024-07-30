"use client";

import React, { useEffect, useRef, useState } from "react";
import YouTubePlayer from "@/components/YouTubePlayer";
import BackButton from "@/components/BackButton";
import DanmakuComp from "@/components/Danmaku";
import { useData } from "@/context/DataContext";
import { VideoProvider, useVideo } from "@/context/VideoContext";
import dynamic from "next/dynamic";

// Dynamically import the ChewingTesting component with SSR disabled
const ChewingTestingNoSSR = dynamic(
  () => import("@/components/ChewingTesting"),
  {
    ssr: false, // This disables server-side rendering for the component
  }
);

const PlayerPage: React.FC = () => {
  const {
    videoLink,
    chewingFrequency,
    isGazing,
    isEating,
    userBehaviorInfo,
    setUserBehaviorInfo,
  } = useData();

  const isFirstChange = useRef(true); // 使用 useRef 来跟踪第一次状态变化

  // const formatDate = (date: Date) => {
  //   return date.toLocaleString("en-GB", {
  //     year: "numeric",
  //     month: "short",
  //     day: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //   });
  // };

  useEffect(() => {
    const updateBehaviorInfo = () => {
      if (isFirstChange.current) {
        // 第一次状态变化，不记录时间
        isFirstChange.current = false;
        return;
      }

      if (!isEating) {
        setUserBehaviorInfo((prevInfo) => ({
          resumeChewingTimes: prevInfo?.resumeChewingTimes || [],
          stopChewingTimes: prevInfo?.stopChewingTimes
            ? [...prevInfo.stopChewingTimes, new Date()]
            : [new Date()],
        }));
        // console.log("StopEating: ", formatDate(new Date()));
      } else {
        setUserBehaviorInfo((prevInfo) => ({
          resumeChewingTimes: prevInfo?.resumeChewingTimes
            ? [...prevInfo.resumeChewingTimes, new Date()]
            : [new Date()],
          stopChewingTimes: prevInfo?.stopChewingTimes || [],
        }));
        // console.log("StartEating: ", formatDate(new Date()));
      }
    };

    updateBehaviorInfo();
  }, [isEating]);

  // Check if the user is gazing at the screen and whether it changes over time
  useEffect(() => {
    console.log("isGazing value:", isGazing);
  }, [isGazing]);

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
    <VideoProvider>
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black">
        {/* <div className="absolute top-4 left-4 text-white z-50">
        <BackButton fontSize={48} />
      </div> */}
        <div className="w-full h-full flex flex-col items-center justify-center z-40">
          {videoId ? (
            <div className="w-full h-full flex items-center justify-center">
              <YouTubePlayer videoId={videoId} />
              <DanmakuComp visible={!isEating} />
            </div>
          ) : (
            <div className="text-white">
              No video link provided or invalid video ID.
            </div>
          )}
        </div>

        <div className="absolute h-[50px] w-[50px] z-50 hidden">
          <ChewingTestingNoSSR />
        </div>
      </div>
    </VideoProvider>
  );
};

export default PlayerPage;

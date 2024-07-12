"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from 'next/dynamic';
import YouTubePlayer from "@/components/YouTubePlayer";
import BackButton from "@/components/BackButton";
import DanmakuComp from "@/components/Danmaku";
import { useData } from "@/context/DataContext";
import { VideoProvider } from "@/context/VideoContext";

const avatarList = [
  {
    name: "Eating Avatar",
    img: "/avatar-01.png",
  },
  {
    name: "Live Feed",
    img: "/avatar-02.png",
  },
  {
    name: "Food Hue",
    img: "/avatar-03.png",
  },
  {
    name: "Sound Amplifier",
    img: "/avatar-04.png",
  },
];

// Dynamically import the ChewingTesting component with SSR disabled
const ChewingTestingNoSSR = dynamic(() => import('@/components/ChewingTesting'), {
  ssr: false, // This disables server-side rendering for the component
});

const PlayerPage: React.FC = () => {
  const { videoLink, chewingFrequency } = useData();
  const [isEating, setIsEating] = useState(true);
  const threshold = 20; // Set your threshold value here

  useEffect(() => {
    console.log(chewingFrequency, "chewingFrequency");
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

  const [selectedAvatar, setSelectedAvatar] = useState<string>("");

  const handleAvatarClick = () => {
    const randomIndex = Math.floor(Math.random() * avatarList.length);
    setSelectedAvatar(avatarList[randomIndex].img);
  };

  // 在组件加载时，随机选择一个 avatar 图片链接作为默认展示
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * avatarList.length);
    setSelectedAvatar(avatarList[randomIndex].img);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-black">
      <div className="absolute top-4 left-4 text-white">
        <BackButton fontSize={48} />
      </div>
      {/* 展示用户选择的avatar 在左下角 默认随机展示 */}
      {!isEating && (
        <div className="absolute bottom-[50px] left-4">
          <img
            src={selectedAvatar}
            alt="Avatar"
            className="w-36 h-36 cursor-pointer"
            onClick={handleAvatarClick}
          />
        </div>
      )}

      <div className="w-full h-full flex flex-col items-center justify-center">
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

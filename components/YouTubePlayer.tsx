"use client";
import React, { useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";
import { useData } from "@/context/DataContext";

interface BorderColor {
  color: string;
  percentage: string;
}

interface YouTubePlayerProps {
  videoId: string;
  borderColors?: BorderColor[];
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId }) => {
  const playerRef = useRef<any>(null);
  const { dominantColors, userInfo } = useData();

  const targetPlaybackRateRef = useRef<number>(0.83);
  const [autoRateChange, setAutoRateChange] = useState(false);
  const [opacity, setOpacity] = useState(1);

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      fs: 0,
      rel: 0, // 禁用推荐视频
      modestbranding: 1, // 隐藏YouTube logo
      enablejsapi: 1,
    },
  };

  useEffect(() => {
    const totalTime = (userInfo.eatingTime || 0) * 60 * 1000; // 20分钟
    const intervalTime = 1000; // 每秒更新一次
    const steps = totalTime / intervalTime;
    const opacityStep = 1 / steps;

    const interval = setInterval(() => {
      setOpacity((prevOpacity) => {
        if (prevOpacity > 0) {
          return prevOpacity - opacityStep;
        } else {
          clearInterval(interval);
          return 0;
        }
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
    startReducingPlaybackRate();
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === 1) {
      startReducingPlaybackRate();
    } else if (event.data === 2) {
      handlePause();
    }
  };

  const handlePause = () => {
    // todo
  };

  const onPlaybackRateChange = () => {
    if (autoRateChange) return;
    const speed = playerRef.current.getPlaybackRate();
    targetPlaybackRateRef.current = speed * 0.83;
    startReducingPlaybackRate();
  };

  const startReducingPlaybackRate = () => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        const currentRate = playerRef.current.getPlaybackRate();
        if (currentRate > targetPlaybackRateRef.current) {
          if (!autoRateChange) {
            setAutoRateChange(true);
          }
          playerRef.current.setPlaybackRate(
            Math.max(targetPlaybackRateRef.current, currentRate - 0.01)
          );
        } else {
          clearInterval(interval);
          setAutoRateChange(false);
        }
      }
    }, 1000);
  };

  const borderColor = `linear-gradient(45deg, ${dominantColors
    .map((item) => `rgba(${item[0]}, ${item[1]}, ${item[2]}, ${opacity})`)
    .join(", ")})`;

  return (
    <div
      className="w-full h-full"
      // className="w-full h-full border-[16px] rounded"
      // style={{ borderImage: `${borderColor} 1`, borderImageSlice: 1 }}
    >
      <YouTube
        videoId={videoId}
        opts={opts}
        className="w-full h-full"
        onReady={onPlayerReady}
        onStateChange={onPlayerStateChange}
        onPlaybackRateChange={onPlaybackRateChange}
      />
    </div>
  );
};

export default YouTubePlayer;

"use client";
import React, { useEffect, useRef, useState } from "react";
import YouTube from "react-youtube";
import { useData } from "@/context/DataContext";
import { useVideo } from "@/context/VideoContext";
import ConfirmationDialog from "./ConfirmationDialog";
import ChewingTesting from "./ChewingTesting";

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

  const targetPlaybackRateRef = useRef<number>(0.83);
  const [autoRateChange, setAutoRateChange] = useState(false);

  // Video Recording
  const { startRecording, stopRecording } = useVideo();
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
    startReducingPlaybackRate();
  };

  const onPlayerStateChange = (event: any) => {
    if (event.data === 1) {
      startReducingPlaybackRate();

      startRecording();
    } else if (event.data === 2) {
      handlePause();
    }
  };

  const handlePause = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDialogConfirm = () => {
    stopRecording();
    setDialogOpen(false);
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

  return (
    <div className="w-full h-full">
      <YouTube
        videoId={videoId}
        opts={opts}
        className="w-full h-full"
        onReady={onPlayerReady}
        onStateChange={onPlayerStateChange}
        onPlaybackRateChange={onPlaybackRateChange}
      />
      <ConfirmationDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleDialogConfirm}
      />
    </div>
  );
};

export default YouTubePlayer;

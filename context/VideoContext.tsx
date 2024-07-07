// context/VideoContext.tsx
"use client";
import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useContext,
  ReactNode,
} from "react";

import useVideoRef from "@/hooks/useVideoRef";

interface VideoContextProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  requestCameraPermission: () => Promise<void>;
}

interface VideoProviderProps {
  children: ReactNode;
}

const VideoContext = createContext<VideoContextProps | undefined>(undefined);

export const VideoProvider: React.FC<VideoProviderProps> = ({ children }) => {
  const videoRef = useVideoRef();
  const [stream, setStream] = useState<MediaStream | null>(null);

  const requestCameraPermission = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(videoStream);

      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
      }
    } catch (error) {
      console.error("Error accessing camera", error);
    }
  };

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const videoValue = {
    videoRef,
    stream,
    requestCameraPermission,
  };

  return (
    <VideoContext.Provider value={videoValue}>{children}</VideoContext.Provider>
  );
};

export const useVideo = (): VideoContextProps => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
};

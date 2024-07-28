// StartPage.tsx

"use client";
import { Button } from "@mui/material";
import Link from "next/link";
import React, { useState } from "react";
import { isValidYouTubeUrl } from "@/utils/validation";
import BackButton from "@/components/BackButton"; // 导入返回按钮组件
import { useData } from "@/context/DataContext";

const StartPage: React.FC = () => {
  const { userInfo, setUserInfo, setVideoLink, videoLink } = useData();
  const [error, setError] = useState("");
  const handleContinue = () => {
    if (!isValidYouTubeUrl(videoLink)) {
      setError("Please enter a valid YouTube video link.");
    } else {
      window.localStorage.setItem("videoLink", videoLink);
    }
  };
  const updateUserInfo = (e: { target: { value: string | number } }) => {
    console.log(e.target.value);
    setUserInfo({
      ...userInfo,
    });
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
      <div className="h-full w-full grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-white shadow-lg rounded-lg animate-fade-in">
        <div className="flex flex-col justify-center pl-32">
          <div className="mb-16">
            <BackButton />
          </div>
          <p className="text-lg font-semibold mb-2 relative">Video Link</p>
          <input
            type="text"
            placeholder="Enter YouTube video link"
            className="p-2 border border-gray-300 rounded mb-4"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
          />
          {error && <p className="text-red-500 mb-2">{error}</p>}

          <Link href={isValidYouTubeUrl(videoLink) ? "/preference" : ""}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              className="bg-blue-500 hover:bg-blue-700 transition duration-300"
              onClick={handleContinue}
            >
              Continue
            </Button>
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center">
          <img
            src="https://via.placeholder.com/400x300"
            alt="Placeholder"
            className="max-w-full h-auto rounded"
          />
        </div>
      </div>
    </div>
  );
};

export default StartPage;

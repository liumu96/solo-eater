"use client";
import { Button, TextField } from "@mui/material";
import Link from "next/link";
import React, { ChangeEvent, useEffect, useState } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { useData } from "@/context/DataContext";
import { isValidYouTubeUrl } from "@/utils/validation";

const HomePage = () => {
  const webTitle = "Solo Eater";
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const { userInfo, setUserInfo, setVideoLink, videoLink } = useData();
  const [eatingTime, setEatingTime] = useState(userInfo.eatingTime || ""); // minute
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!isValidYouTubeUrl(videoLink)) {
      setError("Please enter a valid YouTube video link.");
    } else {
      localStorage.setItem("videoLink", videoLink);
    }
  };

  const updateUserInfo = (e: { target: { value: string | number } }) => {
    console.log(e.target.value);
    setEatingTime(+e.target.value);
    setUserInfo({
      ...userInfo,
      eatingTime: +e.target.value,
    });
  };

  useEffect(() => {
    const timerId = setInterval(() => {
      setTitle((prevTitle) => {
        const len = prevTitle.length;
        if (len < webTitle.length) {
          return webTitle.slice(0, len + 1);
        } else {
          clearInterval(timerId);
          return prevTitle;
        }
      });
    }, 300);
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    // 检查本地存储中是否有用户名
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem("username", username);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="p-8 border shadow-lg rounded-lg w-full max-w-lg bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 min-w-[800px]">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          <span role="img" aria-label="wave" className="mr-2">
            👋
          </span>{" "}
          Welcome to {title}
        </h1>
        {/* 输入你的ID */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-2">
            Enter Your Username
          </label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded mb-4 w-full"
            style={{ backgroundColor: "#ffffff", borderRadius: "8px" }}
          />
          <label className="block text-lg font-semibold mb-2">Video Link</label>
          <input
            type="text"
            placeholder="Enter YouTube video link"
            className="p-2 border border-gray-300 rounded mb-4 w-full"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
          />
          {error && <p className="text-red-500 mb-2">{error}</p>}

          <label className="block text-lg font-semibold mb-2">
            Eating Time / Minutes
          </label>
          <input
            type="text"
            placeholder="Input your eating time (minutes)"
            className="p-2 border border-gray-300 rounded mb-4 w-full"
            value={eatingTime}
            onChange={updateUserInfo}
          />
        </div>
        <Link
          href="/player"
          onClick={() => {
            handleLogin();
          }}
          passHref
        >
          <Button variant="contained" color="primary" size="large" fullWidth>
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;

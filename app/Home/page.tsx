"use client";
import { Button, TextField } from "@mui/material";
import Link from "next/link";
import React, { ChangeEvent, useEffect, useState } from "react";
import { sendGAEvent } from "@next/third-parties/google";

const HomePage = () => {
  const webTitle = "Video Chewing";
  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");

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
    // upload username
    sendGAEvent({ event: "new user", value: "username" });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen text-center bg-white">
      <div className="p-8 border shadow-lg rounded-lg animate-fade-in w-full max-w-lg bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          <span role="img" aria-label="wave" className="mr-2">
            👋
          </span>{" "}
          Welcome to {title}
        </h1>
        {/* 输入你的ID */}
        <div className="mb-4">
          <TextField
            label="Enter your username"
            variant="outlined"
            value={username}
            onChange={handleChange}
            fullWidth
            InputProps={{
              style: {
                backgroundColor: "#ffffff",
                borderRadius: "8px",
              },
            }}
            InputLabelProps={{
              style: {
                color: "#666666",
              },
            }}
          />
        </div>
        <Link
          href="/start"
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

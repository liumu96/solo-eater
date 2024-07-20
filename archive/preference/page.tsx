"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@mui/material";
import { usePreferences } from "@/context/PreferencesContext";
import BackButton from "@/components/BackButton";
import FoodTesting from "@/components/FoodTesting";
import { VideoProvider } from "@/context/VideoContext";
import { useData } from "@/context/DataContext";

const features = [
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

const PreferencesPage = () => {
  const { selectedFeatures, toggleFeature } = usePreferences();
  const { dominantColors } = useData();

  const [showFoodHuePrompt, setShowFoodHuePrompt] = useState(false);

  useEffect(() => {
    if (selectedFeatures.includes("Food Hue")) {
      setShowFoodHuePrompt(true);
    } else {
      setShowFoodHuePrompt(false);
    }
  }, [selectedFeatures]);

  useEffect(() => {
    localStorage.setItem("selectedFeatures", JSON.stringify(selectedFeatures));
  }, [selectedFeatures]);

  // todo 保存preferences

  return (
    <div className="w-full min-h-screen flex flex-col items-start border justify-center p-8 md:p-36 relative">
      <div className="mb-8">
        <BackButton />
      </div>

      <div className="text-left w-full mb-8 md:mb-16 font-extrabold text-3xl md:text-4xl">
        Select your preferred features to facilitate mindful eating
      </div>
      <div className="grid grid-cols-4 gap-4 w-full">
        {features.map((feature, index) => {
          return (
            <div
              key={index}
              className={`flex flex-col items-center cursor-pointer p-4 ${
                selectedFeatures.includes(feature.name)
                  ? "border-4 border-blue-500"
                  : "border-4 border-transparent"
              }`}
              onClick={() => toggleFeature(feature.name)}
            >
              <Image
                src={feature.img}
                alt={feature.name}
                width={200}
                height={200}
              />
              <p className="mt-2 text-center">{feature.name}</p>
            </div>
          );
        })}
      </div>
      <Link href="/player" className="mt-8 md:mt-16">
        <Button
          variant="contained"
          color="primary"
          size="large"
          className="bg-blue-500 hover:bg-blue-700 transition duration-300"
        >
          Let's get started
        </Button>
      </Link>
      {showFoodHuePrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative flex flex-col items-center w-full max-w-xl md:max-w-2xl h-2/3 bg-white rounded-lg shadow-lg p-6">
            <p className="text-lg font-semibold mb-4 text-center">
              Please show your food to the camera
            </p>
            <div className="w-full flex-1 animate-fade-in">
              <VideoProvider>
                <FoodTesting />
              </VideoProvider>
            </div>

            <div className="mt-4 z-30">
              {/* <h3>Detected Colors:</h3> */}
              <div style={{ display: "flex" }}>
                {dominantColors.map((color, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
                      width: "50px",
                      height: "50px",
                      marginRight: "5px",
                    }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowFoodHuePrompt(false)}
              disabled={!dominantColors.length}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreferencesPage;

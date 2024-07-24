// src/context/DominantColorsContext.tsx
"use client";
import React, { createContext, useContext, useState } from "react";

type DataContextType = {
  dominantColors: number[][];
  setDominantColors: React.Dispatch<React.SetStateAction<number[][]>>;
  videoLink: string;
  setVideoLink: React.Dispatch<React.SetStateAction<string>>;
  userInfo: UserInfo;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo>>;
  chewingFrequency: number;
  setChewingFrequency: React.Dispatch<React.SetStateAction<number>>;
  isGazing: boolean; // Add the 'isGazing' property
  setIsGazing: React.Dispatch<React.SetStateAction<boolean>>; // Add the 'setIsGazing' property
  UtensilDetected: boolean; // New state for food detection
  setUtensilDetected: React.Dispatch<React.SetStateAction<boolean>>; // Setter for food detection state
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [dominantColors, setDominantColors] = useState<number[][]>([]);
  const [videoLink, setVideoLink] = useState(
    typeof window !== "undefined" ? localStorage.getItem("videoLink") || "" : ""
  );
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: null,
    username: "",
  });
  const [chewingFrequency, setChewingFrequency] = useState<number>(0);
  const [isGazing, setIsGazing] = useState<boolean>(true); // Declare isGazing state variable and its setter function
  const [UtensilDetected, setUtensilDetected] = useState<boolean>(false); // Initialize the food detection state
  
  return (
    <DataContext.Provider
      value={{
        dominantColors,
        setDominantColors,
        videoLink,
        setVideoLink,
        userInfo,
        setUserInfo,
        chewingFrequency,
        setChewingFrequency,
        isGazing,
        setIsGazing,
        UtensilDetected,
        setUtensilDetected,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataContext");
  }
  return context;
};

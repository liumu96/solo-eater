"use client";

import { useData } from "@/context/DataContext";
import React, { useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Link from "next/link";
import { Button } from "@mui/material";

const UserDataPage = () => {
  const { userInfo } = useData();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const testUserInfo = {
    participantID: "user-01",
    videoLink: "youtubevideo",
    mealDuration: 30,
    videoWatchingDuration: {
      open: 5,
      close: 15,
      stopTimes: [2, 5, 7],
      resumeTimes: [3, 6, 8],
    },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "16px Arial";
        ctx.fillText(`Participant ID: ${testUserInfo.participantID}`, 10, 30);
        ctx.fillText(`Video Link: ${testUserInfo.videoLink}`, 10, 60);
        ctx.fillText(
          `Meal Duration: ${testUserInfo.mealDuration} mins`,
          10,
          90
        );
        ctx.fillText(`Video Watching Duration:`, 10, 120);
        ctx.fillText(
          `- Open: ${testUserInfo.videoWatchingDuration.open} mins`,
          20,
          150
        );
        ctx.fillText(
          `- Close: ${testUserInfo.videoWatchingDuration.close} mins`,
          20,
          180
        );
        ctx.fillText(
          `- Stop Times: ${testUserInfo.videoWatchingDuration.stopTimes.join(
            ", "
          )}`,
          20,
          210
        );
        ctx.fillText(
          `- Resume Times: ${testUserInfo.videoWatchingDuration.resumeTimes.join(
            ", "
          )}`,
          20,
          240
        );
      }
    }
  }, [testUserInfo]);

  const downloadCanvasAsImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      html2canvas(canvas).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF();
        const imgWidth = 210; // A4 size width in mm
        const pageHeight = 297; // A4 size height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save("user_info.pdf");
      });
    }
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <canvas
        ref={canvasRef}
        width={500}
        height={300}
        className="border border-gray-300"
      ></canvas>
      <button
        onClick={downloadCanvasAsImage}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Download as PDF
      </button>

      <Button
        onClick={() => {
          window.open("https://forms.gle/7U6NvdqY6ANL81su8", "_blank");
        }}
        variant="contained"
        color="secondary"
        size="large"
        className="mt-8"
      >
        Go to Survey
      </Button>
    </div>
  );
};

export default UserDataPage;

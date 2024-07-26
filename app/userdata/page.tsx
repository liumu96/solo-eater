"use client";

import { useData } from "@/context/DataContext";
import React, { useEffect, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@mui/material";

const UserDataPage = () => {
  const { userInfo, videoLink, videoPlayInfo, userBehaviorInfo } = useData();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  console.log(userInfo, userBehaviorInfo);

  const formatDate = (date: Date) => {
    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const testUserInfo = {
    participantID: userInfo.username,
    videoLink: videoLink,
    mealDuration: userInfo.eatingTime,
    videoWatchingDuration: {
      open: videoPlayInfo?.startTime || new Date(),
      close: videoPlayInfo?.stopTime || new Date(),
      stopTimes: (videoPlayInfo?.pauseTimes || []).map(
        (time) => new Date(time)
      ),
      resumeTimes: (videoPlayInfo?.resumeTimes || []).map(
        (time) => new Date(time)
      ),
    },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set font for text
        ctx.font = "16px Arial";

        // Calculate total duration and paused duration
        const totalDuration =
          (testUserInfo.videoWatchingDuration.close.getTime() -
            testUserInfo.videoWatchingDuration.open.getTime()) /
          1000; // in seconds
        let pausedDuration = 0;
        for (
          let i = 0;
          i < testUserInfo.videoWatchingDuration.stopTimes.length - 1;
          i++
        ) {
          pausedDuration +=
            (testUserInfo.videoWatchingDuration.resumeTimes[i].getTime() -
              testUserInfo.videoWatchingDuration.stopTimes[i].getTime()) /
            1000; // in seconds
        }
        const playingDuration = totalDuration - pausedDuration;

        // Draw text information
        let y = 30;
        ctx.fillText(`Participant ID: ${testUserInfo.participantID}`, 10, y);
        y += 24;
        ctx.fillText(`Video Link: ${testUserInfo.videoLink}`, 10, y);
        y += 24;
        ctx.fillText(`Meal Duration: ${testUserInfo.mealDuration} mins`, 10, y);
        y += 24;
        ctx.fillText(`Video Watching Duration:`, 10, y);
        y += 24;
        ctx.fillText(
          `- Open: ${formatDate(testUserInfo.videoWatchingDuration.open)}`,
          20,
          y
        );
        y += 24;
        ctx.fillText(
          `- Close: ${formatDate(testUserInfo.videoWatchingDuration.close)}`,
          20,
          y
        );
        y += 24;

        // Draw table
        const tableX = 10;
        const tableY = y;
        const rowHeight = 24;
        const colWidth = 300;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;

        // Table headers
        ctx.strokeRect(tableX, tableY, colWidth, rowHeight);
        ctx.strokeRect(tableX + colWidth, tableY, colWidth, rowHeight);
        ctx.fillText("Stop Times", tableX + 10, tableY + 16);
        ctx.fillText("Resume Times", tableX + colWidth + 10, tableY + 16);

        // Table data
        for (
          let i = 0;
          i < testUserInfo.videoWatchingDuration.stopTimes.length;
          i++
        ) {
          ctx.strokeRect(
            tableX,
            tableY + (i + 1) * rowHeight,
            colWidth,
            rowHeight
          );
          if (i < testUserInfo.videoWatchingDuration.resumeTimes.length) {
            ctx.strokeRect(
              tableX + colWidth,
              tableY + (i + 1) * rowHeight,
              colWidth,
              rowHeight
            );
          }
          ctx.fillText(
            formatDate(testUserInfo.videoWatchingDuration.stopTimes[i]),
            tableX + 10,
            tableY + (i + 1) * rowHeight + 16
          );
          if (i < testUserInfo.videoWatchingDuration.resumeTimes.length) {
            ctx.fillText(
              formatDate(testUserInfo.videoWatchingDuration.resumeTimes[i]),
              tableX + colWidth + 10,
              tableY + (i + 1) * rowHeight + 16
            );
          }
        }

        // Draw bar chart below the table
        const chartHeight = 40;
        const chartWidth = canvas.width - 40;
        const chartX = 20;
        const chartY =
          tableY +
          (testUserInfo.videoWatchingDuration.stopTimes.length + 2) *
            rowHeight +
          30;

        // Draw total duration bar
        ctx.fillStyle = "#d3d3d3";
        ctx.fillRect(chartX, chartY, chartWidth, chartHeight);

        // Draw playing duration bar
        ctx.fillStyle = "#4caf50";
        const playingBarWidth = (playingDuration / totalDuration) * chartWidth;
        ctx.fillRect(chartX, chartY, playingBarWidth, chartHeight);

        // Draw paused duration bars
        ctx.fillStyle = "#f44336";
        for (
          let i = 0;
          i < testUserInfo.videoWatchingDuration.stopTimes.length - 1;
          i++
        ) {
          const stopTime = testUserInfo.videoWatchingDuration.stopTimes[i];
          const resumeTime = testUserInfo.videoWatchingDuration.resumeTimes[i];
          const stopX =
            chartX +
            ((stopTime.getTime() -
              testUserInfo.videoWatchingDuration.open.getTime()) /
              (testUserInfo.videoWatchingDuration.close.getTime() -
                testUserInfo.videoWatchingDuration.open.getTime())) *
              chartWidth;
          const resumeX =
            chartX +
            ((resumeTime.getTime() -
              testUserInfo.videoWatchingDuration.open.getTime()) /
              (testUserInfo.videoWatchingDuration.close.getTime() -
                testUserInfo.videoWatchingDuration.open.getTime())) *
              chartWidth;
          ctx.fillRect(stopX, chartY, resumeX - stopX, chartHeight);
        }

        // Draw axis
        ctx.strokeStyle = "#000";
        ctx.beginPath();
        ctx.moveTo(chartX, chartY + chartHeight + 10);
        ctx.lineTo(chartX + chartWidth, chartY + chartHeight + 10);
        ctx.stroke();

        // Draw time labels
        ctx.fillStyle = "#000";
        ctx.fillText(
          formatDate(testUserInfo.videoWatchingDuration.open),
          chartX,
          chartY + chartHeight + 30
        );
        ctx.fillText(
          formatDate(testUserInfo.videoWatchingDuration.close),
          chartX +
            chartWidth -
            ctx.measureText(
              formatDate(testUserInfo.videoWatchingDuration.close)
            ).width,
          chartY + chartHeight + 30
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
        width={1000} // 增加宽度确保图表不被截断
        height={1000}
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

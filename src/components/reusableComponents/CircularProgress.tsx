"use client";
import React from "react";

type CircularProgressProps = {
  value: number; // 0 - 100
  size?: number;
};

const CircularProgress = ({ value, size = 26 }: CircularProgressProps) => {
  const borderWidth = 2;
  const strokeWidth = size / 2;

  // add padding so strokes are not clipped
  const padding = borderWidth;
  const center = size / 2 + padding;
  const radius = (size - strokeWidth) / 2;

  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size + padding * 2} ${size + padding * 2}`}
    >
      {/* Outer Border */}
      <circle
        cx={center}
        cy={center}
        r={size / 2}
        fill="none"
        stroke="#3B82F6"
        strokeWidth={borderWidth}
      />

      {/* White background */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="white"
        strokeWidth={strokeWidth}
      />

      {/* Blue progress */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#3B82F6"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${center} ${center})`}
      />
    </svg>
  );
};

export default CircularProgress;

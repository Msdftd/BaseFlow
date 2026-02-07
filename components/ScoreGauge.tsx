import React from 'react';

interface ScoreGaugeProps {
  score: number;
  max?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, max = 1000 }) => {
  const radius = 80;
  const stroke = 12;
  const normalizedScore = Math.min(Math.max(score, 0), max);
  const percentage = normalizedScore / max;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - percentage * circumference;
  
  // Color determination based on score tiers
  let color = "text-red-500";
  let statusText = "Sybil Risk";
  if (percentage > 0.4) { color = "text-yellow-500"; statusText = "Developing"; }
  if (percentage > 0.7) { color = "text-base-blue"; statusText = "Verified Human"; }
  if (percentage > 0.9) { color = "text-purple-500"; statusText = "Power User"; }

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Background Circle */}
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="text-gray-800"
          strokeWidth={stroke}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
        {/* Progress Circle */}
        <circle
          className={`${color} transition-all duration-1000 ease-out`}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50%"
          cy="50%"
        />
      </svg>
      
      {/* Center Text */}
      <div className="absolute flex flex-col items-center">
        <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">BaseFlow Score</span>
        <span className={`text-5xl font-bold mt-2 ${color}`}>{score}</span>
        <span className="text-gray-500 text-sm mt-1">{statusText}</span>
      </div>
    </div>
  );
};
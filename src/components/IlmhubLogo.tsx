import React from 'react';

interface IlmhubLogoProps {
  className?: string;
  size?: number | string;
  showBackground?: boolean;
}

export const IlmhubLogo: React.FC<IlmhubLogoProps> = ({
  className = '',
  size = 48,
  showBackground = true,
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm select-none"
      >
        {/* Background rounded squircle (Royal Blue as in official logo) */}
        {showBackground && (
          <rect width="100" height="100" rx="24" fill="#0057E7" />
        )}

        {/* Arch / Dome of Knowledge (White) */}
        <path
          d="M 27 63 V 44 C 27 31.3 37.3 21 50 21 C 62.7 21 73 31.3 73 44 V 63"
          stroke="#FFFFFF"
          strokeWidth="9.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Open Book Base (White) */}
        <path
          d="M 24 71 C 36 71 44 75.5 50 81 C 56 75.5 64 71 76 71 C 77.5 71 78 72 78 74 C 78 76.5 76 78.5 74 78.5 C 64 78.5 56 83 50 89 C 44 83 36 78.5 26 78.5 C 24 78.5 22 76.5 22 74 C 22 72 22.5 71 24 71 Z"
          fill="#FFFFFF"
        />

        {/* Golden Diamond Star of Knowledge (Amber Gold) */}
        <path
          d="M 50 36.5 L 57.5 45.5 L 50 54.5 L 42.5 45.5 Z"
          fill="#FFB800"
        />
      </svg>
    </div>
  );
};

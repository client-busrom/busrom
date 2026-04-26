import React from "react";

interface BackgroundDecorationsProps {
  vw: (px: number) => string;
}

export const BackgroundDecorations: React.FC<BackgroundDecorationsProps> = ({ vw }) => {
  return (
    <>
      {/* Background Dots Pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          className="absolute opacity-[0.03]"
          style={{
            left: vw(-100),
            top: vw(-100),
            width: vw(2120),
            height: vw(1200),
          }}
          viewBox="0 0 2120 1200"
          fill="none"
        >
          <defs>
            <pattern
              id="dotPattern"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotPattern)" />
        </svg>
      </div>

      {/* Background Glow */}
      <svg
        className="absolute pointer-events-none"
        style={{
          left: vw(-1018),
          top: vw(260),
          width: vw(2173),
          height: vw(2257),
        }}
        viewBox="0 0 2173 2257"
        fill="none"
      >
        <defs>
          <radialGradient
            id="contactGlow"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor="#CFBE38" stopOpacity="0.93" />
            <stop offset="100%" stopColor="#998D2D" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse
          cx="1086.5"
          cy="1128.5"
          rx="1086.5"
          ry="1128.26"
          fill="url(#contactGlow)"
        />
      </svg>
    </>
  );
};

export const MobileDecorations: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] bg-radial-gradient from-[#CFBE38]/20 to-transparent opacity-60 blur-3xl" />
    </div>
  );
};

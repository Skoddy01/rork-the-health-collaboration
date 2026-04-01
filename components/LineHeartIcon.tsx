import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface LineHeartIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function LineHeartIcon({ size = 24, color = '#FFFFFF', strokeWidth = 1.5 }: LineHeartIconProps) {
  const s = strokeWidth;
  const thin = s * 0.4;
  const mid = s * 0.7;

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <G>
        <Path
          d="M32 56 C32 56 6 40 6 22 C6 13 13 6 21 6 C26 6 30 9 32 13 C34 9 38 6 43 6 C51 6 58 13 58 22 C58 40 32 56 32 56Z"
          stroke={color}
          strokeWidth={s}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M32 52 C32 52 10 38 10 23 C10 15.5 15.5 10 22 10 C26.5 10 30 13 32 16"
          stroke={color}
          strokeWidth={thin}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.5}
        />
        <Path
          d="M32 16 C34 13 37.5 10 42 10 C48.5 10 54 15.5 54 23 C54 38 32 52 32 52"
          stroke={color}
          strokeWidth={thin}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.35}
        />
        <Path
          d="M18 18 C15 21 14 25 16 30"
          stroke={color}
          strokeWidth={mid}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.6}
        />
        <Path
          d="M22 14 C19 15 16.5 18 16 22"
          stroke={color}
          strokeWidth={thin}
          strokeLinecap="round"
          fill="none"
          opacity={0.4}
        />
        <Path
          d="M13 28 C15 34 22 42 32 50"
          stroke={color}
          strokeWidth={thin}
          strokeLinecap="round"
          fill="none"
          opacity={0.25}
        />
        <Path
          d="M51 28 C49 34 42 42 32 50"
          stroke={color}
          strokeWidth={thin}
          strokeLinecap="round"
          fill="none"
          opacity={0.15}
        />
        <Path
          d="M26 8 Q29 5 32 8"
          stroke={color}
          strokeWidth={thin}
          strokeLinecap="round"
          fill="none"
          opacity={0.3}
        />
        <Path
          d="M32 8 Q35 5 38 8"
          stroke={color}
          strokeWidth={thin}
          strokeLinecap="round"
          fill="none"
          opacity={0.3}
        />
      </G>
    </Svg>
  );
}

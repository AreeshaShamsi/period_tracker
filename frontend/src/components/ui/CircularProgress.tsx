import React from "react";
import { View, ViewStyle } from "react-native";
import Svg, { Circle } from "react-native-svg";

export interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0 to 1
  trackColor: string;
  progressColor: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size,
  strokeWidth,
  progress,
  trackColor,
  progressColor,
  children,
  style,
}) => {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const strokeDashoffset = circumference * (1 - clampedProgress);

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        {/* Track Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress Arc */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>

      {children && (
        <View
          style={{
            position: "absolute",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </View>
      )}
    </View>
  );
};

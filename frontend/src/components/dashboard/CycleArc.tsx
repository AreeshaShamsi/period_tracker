import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, {
  Defs,
  G,
  LinearGradient,
  Mask,
  Path,
  Polygon,
  Rect,
  Stop,
} from "react-native-svg";
import { colors } from "@/theme/colors";
import {
  computeDashSegments,
  computeMarkerGeometry,
} from "@/utils/arcMath";

export interface CycleArcProps {
  currentDay: number;
  cycleLength: number;
}

const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 165;
const CX = 160;
const CY = 150;
const RADIUS = 124;
const STROKE_WIDTH = 26;

export const CycleArc: React.FC<CycleArcProps> = ({
  currentDay,
  cycleLength,
}) => {
  const dashes = computeDashSegments(
    CX,
    CY,
    RADIUS,
    colors.cycleArc.segmentColors
  );

  const marker = computeMarkerGeometry(
    currentDay,
    cycleLength,
    CX,
    CY,
    RADIUS
  );

  return (
    <View style={styles.container}>
      <Svg width={VIEW_WIDTH} height={VIEW_HEIGHT} viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}>
        <Defs>
          <LinearGradient
            id="arcFadeGrad"
            x1="0"
            y1="13"
            x2="0"
            y2="150"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>

          <Mask id="arcFadeMask">
            <Rect
              x="0"
              y="0"
              width={VIEW_WIDTH}
              height={VIEW_HEIGHT}
              fill="url(#arcFadeGrad)"
            />
          </Mask>
        </Defs>

        {/* 8 Dashes masked by vertical linear fade */}
        <G mask="url(#arcFadeMask)">
          {dashes.map((seg) => (
            <Path
              key={`dash-${seg.slot}`}
              d={seg.path}
              stroke={seg.color}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              fill="none"
            />
          ))}
        </G>

        {/* Position marker: outside and after mask so never faded */}
        <Polygon points={marker.glowPoints} fill="rgba(255, 77, 126, 0.28)" />
        <Polygon
          points={marker.points}
          fill={colors.cycleArc.markerHotPink}
          stroke="#FFFFFF"
          strokeWidth={4}
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: VIEW_WIDTH,
    height: VIEW_HEIGHT,
    alignItems: "center",
    justifyContent: "flex-start",
  },
});

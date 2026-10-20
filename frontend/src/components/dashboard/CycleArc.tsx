import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, G, LinearGradient, Mask, Path, Rect, Stop } from "react-native-svg";
import { colors } from "@/theme/colors";
import { ARC_GEOMETRY, computeDashSegments, computeMarkerGeometry } from "@/utils/arcMath";

export interface CycleArcProps {
  currentDay: number;
  cycleLength: number;
}

export const CycleArc: React.FC<CycleArcProps> = ({ currentDay, cycleLength }) => {
  const {
    viewWidth,
    viewHeight,
    centerX,
    centerY,
    radius,
    dashStrokeWidth,
    markerOuterStroke,
    markerInnerStroke,
    markerShadowSpread,
    markerShadowOpacity,
  } = ARC_GEOMETRY;

  const dashes = computeDashSegments(centerX, centerY, radius, colors.cycleArc.segmentColors);
  const marker = computeMarkerGeometry(currentDay, cycleLength, centerX, centerY, radius);

  return (
    <View style={styles.container}>
      <Svg width={viewWidth} height={viewHeight} viewBox={`0 0 ${viewWidth} ${viewHeight}`}>
        <Defs>
          <LinearGradient id="arcFadeGrad" x1="0" y1="13" x2="0" y2={centerY} gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor={colors.white} stopOpacity="1" />
            <Stop offset="50%" stopColor={colors.white} stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.white} stopOpacity="0" />
          </LinearGradient>
          <Mask id="arcFadeMask">
            <Rect x="0" y="0" width={viewWidth} height={viewHeight} fill="url(#arcFadeGrad)" />
          </Mask>
        </Defs>

        {/* 8 Dashes masked by vertical linear fade */}
        <G mask="url(#arcFadeMask)">
          {dashes.map((seg) => (
            <Path
              key={`dash-${seg.slot}`}
              d={seg.path}
              stroke={seg.color}
              strokeWidth={dashStrokeWidth}
              strokeLinecap="round"
              fill="none"
            />
          ))}
        </G>

        {/* Position marker: outside and after mask so never faded */}
        <G transform={`translate(${marker.x}, ${marker.y}) rotate(${marker.rotation})`}>
          <Path
            d={marker.path}
            fill={colors.phase.menstruation}
            fillOpacity={markerShadowOpacity}
            stroke={colors.phase.menstruation}
            strokeOpacity={markerShadowOpacity}
            strokeWidth={markerOuterStroke + markerShadowSpread}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <Path
            d={marker.path}
            fill={colors.white}
            stroke={colors.white}
            strokeWidth={markerOuterStroke}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <Path
            d={marker.path}
            fill={colors.phase.menstruation}
            stroke={colors.phase.menstruation}
            strokeWidth={markerInnerStroke}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: ARC_GEOMETRY.viewWidth,
    height: ARC_GEOMETRY.viewHeight,
    alignItems: "center",
    justifyContent: "flex-start",
  },
});

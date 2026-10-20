import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path, Polygon, Circle } from "react-native-svg";
import { colors } from "@/theme/colors";
import { computeCycleArc, describeArc } from "@/utils/cycleArcMath";

export interface CycleArcProps {
  currentDay: number;
  cycleLength: number;
  periodLength: number;
  ovulationDay: number;
}

const ARC_SIZE = 250;
const ARC_STROKE_WIDTH = 14;
const CX = ARC_SIZE / 2;
const CY = ARC_SIZE / 2 + 10;
const RADIUS = (ARC_SIZE - ARC_STROKE_WIDTH) / 2 - 10;

const phaseColors = {
  menstruation: colors.phase.menstruation,
  follicular: colors.phase.follicular,
  ovulation: colors.phase.ovulation,
  luteal: colors.phase.luteal,
};

export const CycleArc: React.FC<CycleArcProps> = ({
  currentDay,
  cycleLength,
  periodLength,
  ovulationDay,
}) => {
  const { segments, markerPos, markerAngle } = computeCycleArc(
    currentDay,
    cycleLength,
    periodLength,
    ovulationDay,
    CX,
    CY,
    RADIUS,
    phaseColors
  );

  const pointerRad = (markerAngle * Math.PI) / 180;
  const tipX = markerPos.x;
  const tipY = markerPos.y;
  const baseDistance = 14;
  const baseWidth = 6;
  const normalX = -Math.sin(pointerRad);
  const normalY = -Math.cos(pointerRad);
  const baseX = tipX - baseDistance * Math.cos(pointerRad);
  const baseY = tipY + baseDistance * Math.sin(pointerRad);
  const p1X = baseX + baseWidth * normalX;
  const p1Y = baseY + baseWidth * normalY;
  const p2X = baseX - baseWidth * normalX;
  const p2Y = baseY - baseWidth * normalY;

  return (
    <View style={styles.container}>
      <Svg width={ARC_SIZE} height={CY + 10}>
        {segments.map((seg) => (
          <Path
            key={seg.name}
            d={describeArc(CX, CY, RADIUS, seg.startAngle, seg.startAngle - seg.sweepAngle)}
            stroke={seg.color}
            strokeWidth={ARC_STROKE_WIDTH}
            strokeLinecap="round"
            fill="none"
          />
        ))}

        <Circle
          cx={tipX}
          cy={tipY}
          r={5}
          fill={colors.white}
          stroke={colors.brand.primary}
          strokeWidth={2.5}
        />
        <Polygon
          points={`${tipX},${tipY} ${p1X},${p1Y} ${p2X},${p2Y}`}
          fill={colors.brand.primary}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: ARC_SIZE,
    height: CY + 10,
    alignItems: "center",
    justifyContent: "flex-start",
  },
});

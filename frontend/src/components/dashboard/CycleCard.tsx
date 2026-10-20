import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { shadows } from "@/theme/shadows";
import { AppText } from "@/components/ui";
import { getPhaseForDay } from "@/utils/arcMath";
import { CycleArc } from "./CycleArc";
import { PhaseLegend } from "./PhaseLegend";

export interface CycleCardProps {
  currentDay: number;
  cycleLength: number;
  periodLength: number;
  ovulationDay: number;
  currentPhaseName?: string;
}

export const CycleCard: React.FC<CycleCardProps> = ({
  currentDay,
  cycleLength,
  periodLength,
  ovulationDay,
  currentPhaseName,
}) => {
  const phaseName =
    currentPhaseName ||
    getPhaseForDay(currentDay, cycleLength, periodLength, ovulationDay);

  return (
    <View style={styles.card}>
      <View style={styles.arcWrapper}>
        <CycleArc currentDay={currentDay} cycleLength={cycleLength} />
        <View style={styles.centerTextWrapper}>
          <AppText variant="screenTitle" style={styles.dayNumberText}>
            Day {currentDay}
          </AppText>
          <AppText variant="small" style={styles.phaseNameText}>
            {phaseName}
          </AppText>
        </View>
      </View>

      <PhaseLegend />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    ...shadows.card,
  },
  arcWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  centerTextWrapper: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  dayNumberText: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700",
    color: colors.text.primary,
  },
  phaseNameText: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.text.secondary,
    marginTop: 4,
  },
});

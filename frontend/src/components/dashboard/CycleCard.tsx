import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { shadows } from "@/theme/shadows";
import { AppText } from "@/components/ui";
import { CycleArc } from "./CycleArc";

export interface CycleCardProps {
  currentDay: number;
  cycleLength: number;
  periodLength: number;
  ovulationDay: number;
  currentPhaseName: string;
}

type LegendPhaseKey = "menstruation" | "follicular" | "ovulation" | "luteal";

interface LegendEntry {
  key: LegendPhaseKey;
  label: string;
}

const LEGEND_ITEMS: LegendEntry[][] = [
  [
    { key: "menstruation", label: "Menstruation" },
    { key: "follicular", label: "Follicular phase" },
  ],
  [
    { key: "ovulation", label: "Ovulation" },
    { key: "luteal", label: "Luteal phase" },
  ],
];

export const CycleCard: React.FC<CycleCardProps> = ({
  currentDay,
  cycleLength,
  periodLength,
  ovulationDay,
  currentPhaseName,
}) => (
  <View style={styles.card}>
    <View style={styles.arcContainer}>
      <CycleArc
        currentDay={currentDay}
        cycleLength={cycleLength}
        periodLength={periodLength}
        ovulationDay={ovulationDay}
      />
      <View style={styles.centerTextContainer}>
        <AppText variant="screenTitle" style={styles.dayNumberText}>
          Day {currentDay}
        </AppText>
        <AppText variant="small" style={styles.phaseNameText}>
          {currentPhaseName}
        </AppText>
      </View>
    </View>

    <View style={styles.legendContainer}>
      {LEGEND_ITEMS.map((row, rowIdx) => (
        <View key={`row-${rowIdx}`} style={styles.legendRow}>
          {row.map((item) => (
            <View key={item.key} style={styles.legendItem}>
              <View style={[styles.legendDot, dotStyles[item.key]]} />
              <AppText variant="caption" style={styles.legendLabel}>
                {item.label}
              </AppText>
            </View>
          ))}
        </View>
      ))}
    </View>
  </View>
);

const dotStyles = StyleSheet.create({
  menstruation: { backgroundColor: colors.phase.menstruation },
  follicular: { backgroundColor: colors.phase.follicular },
  ovulation: { backgroundColor: colors.phase.ovulation },
  luteal: { backgroundColor: colors.phase.luteal },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    ...shadows.card,
  },
  arcContainer: { alignItems: "center", justifyContent: "center", position: "relative" },
  centerTextContainer: { position: "absolute", bottom: 22, alignItems: "center" },
  dayNumberText: { fontSize: 32, lineHeight: 38, fontWeight: "700", color: colors.text.primary },
  phaseNameText: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  legendContainer: { marginTop: spacing.md, gap: spacing.sm, paddingHorizontal: spacing.xs },
  legendRow: { flexDirection: "row", justifyContent: "space-between" },
  legendItem: { flexDirection: "row", alignItems: "center", flex: 1, gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 12, color: colors.text.secondary },
});

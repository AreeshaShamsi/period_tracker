import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { AppText } from "@/components/ui";

type PhaseKey = "menstruation" | "follicular" | "ovulation" | "luteal";

interface LegendItemData {
  key: PhaseKey;
  label: string;
}

const DOT_SIZE = 14;

const LEGEND_ITEMS: LegendItemData[] = [
  { key: "menstruation", label: "Menstruation" },
  { key: "follicular", label: "Follicular phase" },
  { key: "ovulation", label: "Ovulation" },
  { key: "luteal", label: "Luteal phase" },
];

export const PhaseLegend: React.FC = () => (
  <View style={styles.container}>
    {LEGEND_ITEMS.map((item) => (
      <View key={item.key} style={styles.item}>
        <View style={[styles.dot, dotStyles[item.key]]} />
        <AppText variant="caption" numberOfLines={1} style={styles.label}>
          {item.label}
        </AppText>
      </View>
    ))}
  </View>
);

const dotStyles = StyleSheet.create({
  menstruation: { backgroundColor: colors.phase.menstruation },
  follicular: { backgroundColor: colors.phase.follicular },
  ovulation: { backgroundColor: colors.phase.ovulation },
  luteal: { backgroundColor: colors.phase.luteal },
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.lg,
    rowGap: spacing.md,
  },
  item: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    paddingRight: spacing.sm,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    flexShrink: 0,
    marginRight: spacing.sm,
  },
  label: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "500",
    color: colors.text.primary,
    opacity: 0.8,
  },
});

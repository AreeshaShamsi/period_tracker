import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/ui";

type PhaseKey = "menstruation" | "follicular" | "ovulation" | "luteal";

interface LegendItemData {
  key: PhaseKey;
  label: string;
}

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
        <AppText variant="caption" style={styles.label}>
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
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    gap: 12,
    columnGap: 20,
    alignItems: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
    opacity: 0.8,
  },
});

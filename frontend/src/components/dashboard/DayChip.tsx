import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { AppText } from "@/components/ui";

export type DayChipState = "done" | "today" | "upcoming";

export interface DayChipProps {
  dayName: string;
  dayNumber: number;
  state: DayChipState;
  onPress?: () => void;
}

const ChipStatusIcon: React.FC<{ state: DayChipState }> = ({ state }) => {
  if (state === "done") {
    return (
      <Svg width={18} height={18} viewBox="0 0 18 18">
        <Circle cx={9} cy={9} r={8} fill={colors.brand.soft} />
        <Path d="M5.5 9.5L7.5 11.5L12.5 6.5" stroke={colors.brand.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  if (state === "today") {
    return (
      <Svg width={18} height={18} viewBox="0 0 18 18">
        <Circle cx={9} cy={9} r={7} stroke={colors.white} strokeWidth={1.5} strokeDasharray="2,2" fill="none" />
        <Circle cx={9} cy={9} r={3} fill={colors.white} />
      </Svg>
    );
  }
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Circle cx={9} cy={9} r={8} stroke={colors.text.tertiary} strokeWidth={1.2} fill="none" />
      <Path d="M5.5 9.5L7.5 11.5L12.5 6.5" stroke={colors.text.tertiary} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
};

export const DayChip: React.FC<DayChipProps> = ({ dayName, dayNumber, state, onPress }) => {
  const isToday = state === "today";
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${dayName} ${dayNumber}, ${state}`}
      style={[styles.chip, isToday ? styles.todayChip : styles.defaultChip]}
    >
      <AppText variant="caption" style={[styles.dayName, isToday && styles.todayText]}>
        {isToday ? "Today" : dayName}
      </AppText>
      <AppText variant="label" style={[styles.dayNumber, isToday && styles.todayNumber]}>
        {dayNumber}
      </AppText>
      <View style={styles.iconContainer}>
        <ChipStatusIcon state={state} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    width: 62,
    height: 94,
    borderRadius: radius.card,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "space-between",
  },
  defaultChip: {
    backgroundColor: colors.white,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  todayChip: {
    backgroundColor: colors.brand.primary,
    shadowColor: colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  dayName: { fontSize: 12, fontWeight: "500", color: colors.text.secondary },
  todayText: { color: colors.white, fontWeight: "600" },
  dayNumber: { fontSize: 17, fontWeight: "700", color: colors.text.primary },
  todayNumber: { color: colors.white },
  iconContainer: { height: 20, alignItems: "center", justifyContent: "center" },
});

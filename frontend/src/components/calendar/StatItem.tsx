import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/ui/AppText";

export interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  unit: string;
  label: string;
  style?: ViewStyle;
}

/**
 * StatItem: CircleItem-style circle with a colored icon,
 * then a bold value with a small muted unit, then a muted label.
 */
export const StatItem: React.FC<StatItemProps> = ({
  icon,
  value,
  unit,
  label,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* 64px white circle with thin light-gray border */}
      <View style={styles.circle}>
        {icon}
      </View>

      {/* Bold value with small muted unit */}
      <View style={styles.valueRow}>
        <AppText style={styles.valueText}>{value}</AppText>
        <AppText style={styles.unitText}>{unit}</AppText>
      </View>

      {/* Muted label */}
      <AppText style={styles.labelText}>{label}</AppText>
    </View>
  );
};

export interface StatsRowProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * StatsRow: container rendering StatItems evenly spaced in a row.
 */
export const StatsRow: React.FC<StatsRowProps> = ({ children, style }) => {
  return <View style={[styles.statsRowContainer, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#E5E5EA", // thin light-gray border
    alignItems: "center",
    justifyContent: "center",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
  },
  valueText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.calendar.textMain, // #202124
  },
  unitText: {
    fontSize: 11,
    fontWeight: "400",
    color: colors.calendar.textSecondary, // #777777 (muted gray)
    marginLeft: 3,
  },
  labelText: {
    fontSize: 11,
    fontWeight: "400",
    color: colors.calendar.textSecondary, // #777777 (muted gray)
    marginTop: 2,
    textAlign: "center",
  },
  statsRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 18,
    marginBottom: 8,
  },
});

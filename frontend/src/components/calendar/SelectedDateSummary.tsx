import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/ui/AppText";
import {
  DateCycleInfo,
  formatSelectedCompactDate,
} from "@/utils/calendarHelpers";

export interface SelectedDateSummaryProps {
  dateInfo: DateCycleInfo;
  onEditPress: () => void;
}

export const SelectedDateSummary: React.FC<SelectedDateSummaryProps> = ({
  dateInfo,
  onEditPress,
}) => {
  const {
    iso,
    cycleSummary,
    fertilityChance,
  } = dateInfo;

  const formattedDate = formatSelectedCompactDate(iso);

  // Badge colors
  let badgeBg = colors.fertility.lowBg; // #EEEEEE
  let badgeTextColor = colors.fertility.lowText; // #777777

  if (fertilityChance === "High") {
    badgeBg = colors.fertility.highBg; // #F45B91
    badgeTextColor = colors.fertility.highText; // #FFFFFF
  } else if (fertilityChance === "Medium") {
    badgeBg = colors.fertility.mediumBg; // #FFA62B
    badgeTextColor = colors.fertility.mediumText; // #FFFFFF
  }

  return (
    <View style={styles.summaryContainer}>
      {/* First Row: Selected date in bold (Left) + Edit button (Right) */}
      <View style={styles.firstRow}>
        <AppText style={styles.dateText}>
          {formattedDate}
        </AppText>

        <Pressable
          onPress={onEditPress}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`Edit log for ${formattedDate}`}
          style={({ pressed }) => [styles.editButton, pressed && styles.buttonPressed]}
        >
          {/* Small pink droplet icon */}
          <Svg width={10} height={11} viewBox="0 0 10 12" fill="none">
            <Path
              d="M5 1C5 1 1 5.5 1 8C1 10.2 2.8 11.5 5 11.5C7.2 11.5 9 10.2 9 8C9 5.5 5 1 5 1Z"
              fill={colors.calendar.primaryPink} // #F45B91
            />
          </Svg>

          <AppText style={styles.editText}>
            Edit
          </AppText>
        </Pressable>
      </View>

      {/* Second Row: Cycle information in small gray text */}
      <View style={styles.secondRow}>
        <AppText style={styles.cycleInfoText}>
          {cycleSummary}
        </AppText>
      </View>

      {/* Divider: Very thin, light-gray horizontal line with ~10-12px vertical spacing */}
      <View style={styles.divider} />

      {/* Fertility Information: Compact badge + description */}
      <View style={styles.fertilityRow}>
        <View style={[styles.fertilityBadge, { backgroundColor: badgeBg }]}>
          <AppText style={[styles.badgeText, { color: badgeTextColor }]}>
            {fertilityChance}
          </AppText>
        </View>

        <AppText style={styles.fertilityDescText}>
          - Chance of getting pregnant
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryContainer: {
    width: "100%",
    marginTop: 10,
    backgroundColor: "transparent",
  },
  firstRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 27,
  },
  dateText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: colors.calendar.textMain, // #202124
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 25,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.calendar.separator, // #EEEEEE
  },
  buttonPressed: {
    opacity: 0.65,
  },
  editText: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.calendar.textMain, // #202124
  },
  secondRow: {
    marginTop: 2,
  },
  cycleInfoText: {
    fontSize: 8.5,
    lineHeight: 11,
    color: colors.calendar.textSecondary, // #777777
    fontWeight: "400",
  },
  divider: {
    height: 1,
    backgroundColor: colors.calendar.separator, // #EEEEEE
    marginVertical: 11,
    width: "100%",
  },
  fertilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  fertilityBadge: {
    borderRadius: 2,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 8.5,
    lineHeight: 10,
    fontWeight: "700",
  },
  fertilityDescText: {
    fontSize: 10.5,
    color: colors.calendar.textMain, // #202124
    fontWeight: "400",
  },
});

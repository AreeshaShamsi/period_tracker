import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { calendarTokens } from "@/theme/sizes";
import { POPPINS_FONTS } from "@/theme/typography";
import { AppText } from "@/components/ui/AppText";
import { CloverIcon, DropIcon, OvulationIcon } from "./icons";

export type DayCellState =
  | "default"
  | "period"
  | "ovulation-icon"
  | "medium-chance"
  | "high-chance"
  | "prev-month";

export interface DayCellProps {
  dateNumber: number;
  cycleDay?: number | string;
  state: DayCellState;
  isSelected?: boolean;
  onPress?: () => void;
  cellWidth?: number;
  cellHeight?: number;
  dateFont?: number;
  cycleFont?: number;
  iconSize?: number;
}

export const DayCell: React.FC<DayCellProps> = ({
  dateNumber,
  cycleDay,
  state = "default",
  isSelected = false,
  onPress,
  cellWidth,
  cellHeight,
  dateFont = calendarTokens.clamp.dateFont.max,
  cycleFont = calendarTokens.clamp.cycleFont.max,
  iconSize = calendarTokens.clamp.iconSize.max,
}) => {
  // Background color mapping based on state
  let backgroundColor = colors.white;
  let dateNumberColor = colors.calendar.textMain; // #202124
  let cycleDayColor = colors.calendar.textSecondary; // #777777

  switch (state) {
    case "period":
      backgroundColor = colors.calendar.primaryPink; // #F45B91
      dateNumberColor = colors.white;
      cycleDayColor = "#FFE3EC";
      break;

    case "medium-chance":
    case "high-chance":
      backgroundColor = colors.calendar.fertileAccent; // #FFA62B (orange fill for both)
      dateNumberColor = colors.white;
      cycleDayColor = "#FFFFFF";
      break;

    case "prev-month":
      backgroundColor = colors.white;
      dateNumberColor = colors.calendar.outsideMonthText; // #B8B8B8 (muted number)
      cycleDayColor = colors.calendar.outsideMonthText;
      break;

    case "ovulation-icon":
    case "default":
    default:
      backgroundColor = colors.white;
      dateNumberColor = colors.calendar.textMain;
      cycleDayColor = colors.calendar.textSecondary;
      break;
  }

  // Consistent icon rendering by state
  const renderBottomIcon = () => {
    switch (state) {
      case "period":
        // Period days (pink fill): white drop icon
        return <DropIcon size={iconSize} color={colors.white} />;

      case "medium-chance":
      case "high-chance":
        // Medium or high chance days (orange fill, Aug 27 & Aug 30): inverted ovulation icon
        // White filled circle with face mark in orange token
        return (
          <OvulationIcon
            size={iconSize}
            circleColor={colors.white}
            faceColor={colors.calendar.fertileAccent}
          />
        );

      case "ovulation-icon":
        // Ovulation marker on Aug 2 (white cell): orange filled circle with white face mark
        return (
          <OvulationIcon
            size={iconSize}
            circleColor={colors.calendar.fertileAccent}
            faceColor={colors.white}
          />
        );

      case "prev-month":
        // Previous-month dates: muted clover icon
        return <CloverIcon size={iconSize} color={colors.circleBorder} />;

      case "default":
      default:
        // Safe / default days: green clover icon
        return <CloverIcon size={iconSize} color={colors.calendar.symptomIndicator} />;
    }
  };

  const dynamicCellSize = cellWidth && cellHeight ? { width: cellWidth, height: cellHeight } : null;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Day ${dateNumber}, ${state}${isSelected ? ", selected" : ""}`}
      style={[
        styles.cellContainer,
        dynamicCellSize,
        { backgroundColor },
        isSelected && styles.cellSelected,
      ]}
    >
      {/* Top Header Row: Date number (semibold token) & Cycle-day number (muted, top-right) */}
      <View style={styles.topHeaderRow}>
        <AppText
          style={[
            styles.dateNumberText,
            { fontSize: dateFont, color: dateNumberColor },
            state === "prev-month" && styles.prevMonthDateText,
          ]}
        >
          {dateNumber}
        </AppText>

        {cycleDay !== undefined && cycleDay !== "" ? (
          <AppText
            style={[
              styles.cycleDayText,
              { fontSize: cycleFont, color: cycleDayColor },
            ]}
          >
            {cycleDay}
          </AppText>
        ) : null}
      </View>

      {/* Bottom Center: Shared icon size token, centered at the same distance from bottom */}
      <View style={styles.bottomIconContainer}>
        {renderBottomIcon()}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cellContainer: {
    flex: 1,
    minWidth: 0,
    borderWidth: calendarTokens.gridBorderWidth, // Lightest existing border token
    borderColor: calendarTokens.gridBorderColor, // #EEEEEE
    padding: calendarTokens.cellInnerPadding, // 4px inner padding
    justifyContent: "space-between",
  },
  cellSelected: {
    borderWidth: calendarTokens.selectedBorderWidth, // 2px border overlay
    borderColor: calendarTokens.selectedBorderColor, // #2F80ED
    borderRadius: calendarTokens.cellRadius, // Existing radius token
    zIndex: 10,
    elevation: 2,
  },
  topHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    width: "100%",
  },
  dateNumberText: {
    fontFamily: POPPINS_FONTS.semibold, // Semibold token
    fontWeight: "600",
    lineHeight: 16,
  },
  prevMonthDateText: {
    fontFamily: POPPINS_FONTS.medium,
    fontWeight: "500",
  },
  cycleDayText: {
    fontFamily: POPPINS_FONTS.regular,
    fontWeight: "400", // Muted small top-right
    lineHeight: 12,
  },
  bottomIconContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
});

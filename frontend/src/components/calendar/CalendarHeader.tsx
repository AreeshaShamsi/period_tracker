import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { calendarTokens } from "@/theme/sizes";
import { POPPINS_FONTS } from "@/theme/typography";
import { AppText } from "@/components/ui/AppText";
import { CalendarIcon, CycleIcon } from "./icons";

export interface CalendarHeaderProps {
  monthTitle?: string;
  onCyclePress?: () => void;
  onCalendarPress?: () => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}

const TAP_OFFSET = (calendarTokens.touchTarget - calendarTokens.iconButtonSize) / 2; // (44 - 36) / 2 = 4

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  monthTitle = "August",
  onCyclePress,
  onCalendarPress,
}) => {
  return (
    <View style={styles.headerContainer}>
      {/* Left: circular pink cycle/refresh icon button (36px with 44px tap area) */}
      <Pressable
        onPress={onCyclePress}
        hitSlop={TAP_OFFSET}
        accessibilityRole="button"
        accessibilityLabel="Refresh cycle"
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      >
        <CycleIcon size={22} color={colors.calendar.primaryPink} />
      </Pressable>

      {/* Center: "August" centered in title token */}
      <View style={styles.centerTitleWrapper}>
        <AppText style={styles.monthTitleText}>
          {monthTitle}
        </AppText>
      </View>

      {/* Right: outlined calendar icon button (36px with 44px tap area) */}
      <Pressable
        onPress={onCalendarPress}
        hitSlop={TAP_OFFSET}
        accessibilityRole="button"
        accessibilityLabel="Select month and year"
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      >
        <CalendarIcon size={20} color={colors.calendar.textMain} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: calendarTokens.headerHeight, // height 48px
    width: "100%",
  },
  iconButton: {
    width: calendarTokens.iconButtonSize, // 36px
    height: calendarTokens.iconButtonSize, // 36px
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.65,
  },
  centerTitleWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  monthTitleText: {
    fontFamily: POPPINS_FONTS.bold,
    fontSize: calendarTokens.typography.monthTitle, // 18-20px bold
    fontWeight: "700",
    color: colors.calendar.textMain, // #202124
    textAlign: "center",
  },
});

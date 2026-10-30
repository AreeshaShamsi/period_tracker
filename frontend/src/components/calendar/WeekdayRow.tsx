import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "@/theme/colors";
import { calendarTokens } from "@/theme/sizes";
import { AppText } from "@/components/ui/AppText";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface WeekdayRowProps {
  cellWidth?: number;
  totalWidth?: number;
}

export const WeekdayRow: React.FC<WeekdayRowProps> = ({ cellWidth, totalWidth }) => {
  return (
    <View style={[styles.rowContainer, totalWidth ? { width: totalWidth, alignSelf: "center" } : null]}>
      {WEEKDAYS.map((day) => (
        <View
          key={day}
          style={[
            styles.columnCell,
            cellWidth ? { width: cellWidth } : styles.flexCell,
          ]}
        >
          <AppText style={styles.dayText}>{day}</AppText>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: calendarTokens.weekdayRowHeight, // height 28px
    width: "100%",
  },
  columnCell: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
  },
  flexCell: {
    flex: 1,
    minWidth: 0,
  },
  dayText: {
    fontSize: calendarTokens.typography.weekday, // 11-12px muted
    fontWeight: "500",
    color: colors.calendar.textSecondary, // #777777 (muted gray)
    textAlign: "center",
  },
});

import React from "react";
import { Pressable, View } from "react-native";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { CheckIcon } from "@/components/icons";
import { MONTH_NAMES, WEEKDAY_SHORT, daysInMonth, toISO } from "@/utils/date";
import { AppText } from "./AppText";

export interface CalendarMonthProps {
  year: number;
  month: number; // 1-indexed (1-12)
  selectedDays: Set<string>;
  onToggle: (isoStr: string) => void;
  maxDate: Date;
}

export const CalendarMonth: React.FC<CalendarMonthProps> = ({
  year,
  month,
  selectedDays,
  onToggle,
  maxDate,
}) => {
  const totalDays = daysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 = Sun, 6 = Sat
  const maxISO = toISO(maxDate);

  // Generate grid cells
  const cells: { day: number | null; iso: string | null; disabled: boolean }[] = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push({ day: null, iso: null, disabled: true });
  }

  for (let day = 1; day <= totalDays; day++) {
    const dateObj = new Date(year, month - 1, day);
    const iso = toISO(dateObj);
    const disabled = iso > maxISO;
    cells.push({ day, iso, disabled });
  }

  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderRadius: radius.calendarCard,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.separator,
      }}
    >
      {/* Month Name Header */}
      <AppText variant="calendarMonth">
        {MONTH_NAMES[month - 1]} {year}
      </AppText>
      <View style={{ height: spacing.md }} />

      {/* Weekday Row */}
      <View style={{ flexDirection: "row", marginBottom: spacing.xs }}>
        {WEEKDAY_SHORT.map((wd) => (
          <View key={wd} style={{ flex: 1, alignItems: "center" }}>
            <AppText variant="calendarWeek">{wd}</AppText>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {cells.map((cell, idx) => {
          if (cell.day === null || !cell.iso) {
            return <View key={`empty-${idx}`} style={{ width: "14.28%", height: 52 }} />;
          }

          const isSelected = selectedDays.has(cell.iso);

          return (
            <Pressable
              key={cell.iso}
              disabled={cell.disabled}
              onPress={() => onToggle(cell.iso!)}
              style={{
                width: "14.28%",
                height: 52,
                alignItems: "center",
                justifyContent: "center",
                opacity: cell.disabled ? 0.35 : 1,
              }}
            >
              <AppText variant="calendarDay">{cell.day}</AppText>
              <View style={{ height: 6 }} />
              <View
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  borderWidth: isSelected ? 0 : 1.5,
                  borderColor: isSelected ? "transparent" : colors.circleBorder,
                  backgroundColor: isSelected ? colors.primary : colors.white,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckIcon
                  size={10}
                  color={isSelected ? colors.white : colors.circleCheck}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

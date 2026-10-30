import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/ui/AppText";

export interface CalendarDayCellProps {
  day: number;
  iso: string;
  colIndex: number;
  isCurrentMonth: boolean;
  isPeriod: boolean;
  isPeriodPrev: boolean;
  isPeriodNext: boolean;
  isOvulation: boolean;
  isFertile: boolean;
  isSelected: boolean;
  hasSymptoms: boolean;
  onPress: () => void;
}

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  day,
  iso,
  colIndex,
  isCurrentMonth,
  isPeriod,
  isPeriodPrev,
  isPeriodNext,
  isOvulation,
  isFertile,
  isSelected,
  hasSymptoms,
  onPress,
}) => {
  // Determine date number color
  let textColor = isCurrentMonth
    ? colors.calendar.textMain // #202124
    : colors.calendar.outsideMonthText; // #B8B8B8

  if (isCurrentMonth) {
    if (isPeriod) {
      textColor = colors.calendar.periodText; // #FFFFFF
    } else if (isOvulation) {
      textColor = colors.white; // #FFFFFF
    }
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Date ${iso}${isPeriod ? ", Period" : ""}${isOvulation ? ", Ovulation" : ""}${isSelected ? ", Selected" : ""}`}
      style={styles.cellContainer}
    >
      {/* 1. Background band / highlight */}
      {isPeriod && (
        <View
          style={[
            styles.periodBand,
            !isPeriodPrev && styles.periodBandStart,
            !isPeriodNext && styles.periodBandEnd,
          ]}
        />
      )}

      {isOvulation && !isPeriod && (
        <View style={styles.ovulationHighlight} />
      )}

      {isFertile && !isOvulation && !isPeriod && (
        <View style={styles.fertileHighlight} />
      )}

      {/* 2. Selected Date Outline (thin, vivid pink outline, corner radius 2-3px) */}
      {isSelected && (
        <View
          style={[
            styles.selectedOutline,
            !(isPeriod || isOvulation || isFertile) && styles.selectedNormalBg,
          ]}
        />
      )}

      {/* 3. Cell Content: Date number near top + tiny indicators below */}
      <View style={styles.contentColumn}>
        <AppText
          style={[
            styles.dateText,
            { color: textColor },
            (isPeriod || isOvulation) && styles.dateTextBold,
          ]}
        >
          {day}
        </AppText>

        <View style={styles.indicatorsRow}>
          {/* Green symptom indicator */}
          {hasSymptoms && (
            <View style={styles.symptomIndicatorWrapper}>
              <Svg width={7} height={7} viewBox="0 0 8 8" fill="none">
                <Circle cx="4" cy="4" r="3.2" fill={colors.calendar.symptomIndicator} />
              </Svg>
            </View>
          )}

          {/* Tiny period indicator */}
          {isPeriod && (
            <View style={styles.indicatorDotWrapper}>
              <View style={[styles.tinyDot, { backgroundColor: colors.white }]} />
            </View>
          )}

          {/* Orange circular indicator for fertile window / ovulation */}
          {(isFertile || isOvulation) && !isPeriod && (
            <View style={styles.indicatorDotWrapper}>
              <View
                style={[
                  styles.tinyDot,
                  {
                    backgroundColor: isOvulation
                      ? colors.white
                      : colors.calendar.fertileIndicator,
                  },
                ]}
              />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cellContainer: {
    width: "14.285%",
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  // Continuous horizontal pink band for period days
  periodBand: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 26,
    backgroundColor: colors.calendar.periodBandPink, // #F9A0BC
    zIndex: 1,
  },
  periodBandStart: {
    borderTopLeftRadius: 13,
    borderBottomLeftRadius: 13,
  },
  periodBandEnd: {
    borderTopRightRadius: 13,
    borderBottomRightRadius: 13,
  },
  ovulationHighlight: {
    position: "absolute",
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: colors.calendar.fertileIndicator, // #F28C28
    zIndex: 1,
  },
  fertileHighlight: {
    position: "absolute",
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: colors.calendar.fertileBg, // #FFF3E0
    zIndex: 1,
  },
  // Selected date: thin vivid pink outline (1.5px), corner radius 2.5px
  selectedOutline: {
    position: "absolute",
    width: 28,
    height: 28,
    borderWidth: 1.5,
    borderColor: colors.calendar.selectedOutline, // #F05B91
    borderRadius: 3,
    zIndex: 3,
  },
  selectedNormalBg: {
    backgroundColor: "#FFF7FA",
  },
  contentColumn: {
    alignItems: "center",
    justifyContent: "flex-start",
    zIndex: 4,
    height: 24,
    paddingTop: 1,
  },
  dateText: {
    fontSize: 9.5,
    lineHeight: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  dateTextBold: {
    fontWeight: "700",
  },
  indicatorsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 8,
    gap: 2,
    marginTop: 1,
  },
  symptomIndicatorWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorDotWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  tinyDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
  },
});

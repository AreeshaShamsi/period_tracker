import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { calendarTokens, getCalendarSizes, TAB_BAR_HEIGHT } from "@/theme/sizes";
import { spacing } from "@/theme/spacing";
import {
  CalendarGrid,
  CalendarGridItem,
  CalendarHeader,
  DayCellState,
  DayInfo,
  EditDateModal,
  MonthYearPicker,
  WeekdayRow,
} from "@/components/calendar";
import { useOnboarding } from "@/state/OnboardingContext";
import { generateMonthGrid, getCycleInfoForDate } from "@/utils/calendarHelpers";

// Explicit date data definition for the August calendar grid (7 cols x 5 rows)
export interface DayGridDefinition {
  dateNumber: number;
  cycleDay?: number;
  month: "prev" | "current";
  defaultState: DayCellState;
  phaseName: string;
  chanceVariant: "High" | "Medium" | "Low";
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const AUGUST_DAYS: DayGridDefinition[] = [
  // Row 1: 28 29 30 31 (prev month, gray) then 1 2 3
  { dateNumber: 28, cycleDay: 25, month: "prev", defaultState: "prev-month", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 29, cycleDay: 26, month: "prev", defaultState: "prev-month", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 30, cycleDay: 27, month: "prev", defaultState: "prev-month", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 31, cycleDay: 28, month: "prev", defaultState: "prev-month", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 1, cycleDay: 13, month: "current", defaultState: "default", phaseName: "Follicular Phase", chanceVariant: "Medium" },
  { dateNumber: 2, cycleDay: 14, month: "current", defaultState: "ovulation-icon", phaseName: "Ovulation Phase", chanceVariant: "High" },
  { dateNumber: 3, cycleDay: 15, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },

  // Row 2: 4-10
  { dateNumber: 4, cycleDay: 16, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 5, cycleDay: 17, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 6, cycleDay: 18, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 7, cycleDay: 19, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 8, cycleDay: 20, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 9, cycleDay: 21, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 10, cycleDay: 22, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },

  // Row 3: 11-17
  { dateNumber: 11, cycleDay: 23, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 12, cycleDay: 24, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 13, cycleDay: 25, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 14, cycleDay: 26, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 15, cycleDay: 27, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
  { dateNumber: 16, cycleDay: 1, month: "current", defaultState: "period", phaseName: "Menstrual Phase", chanceVariant: "Low" },
  { dateNumber: 17, cycleDay: 2, month: "current", defaultState: "period", phaseName: "Menstrual Phase", chanceVariant: "Low" },

  // Row 4: 18-24
  { dateNumber: 18, cycleDay: 3, month: "current", defaultState: "period", phaseName: "Menstrual Phase", chanceVariant: "Low" },
  { dateNumber: 19, cycleDay: 4, month: "current", defaultState: "period", phaseName: "Menstrual Phase", chanceVariant: "Low" },
  { dateNumber: 20, cycleDay: 5, month: "current", defaultState: "default", phaseName: "Follicular Phase", chanceVariant: "Low" },
  { dateNumber: 21, cycleDay: 6, month: "current", defaultState: "default", phaseName: "Follicular Phase", chanceVariant: "Low" },
  { dateNumber: 22, cycleDay: 7, month: "current", defaultState: "default", phaseName: "Follicular Phase", chanceVariant: "Low" },
  { dateNumber: 23, cycleDay: 8, month: "current", defaultState: "default", phaseName: "Follicular Phase", chanceVariant: "Low" },
  { dateNumber: 24, cycleDay: 9, month: "current", defaultState: "default", phaseName: "Follicular Phase", chanceVariant: "Low" },

  // Row 5: 25-31
  { dateNumber: 25, cycleDay: 10, month: "current", defaultState: "default", phaseName: "Follicular Phase", chanceVariant: "Low" },
  { dateNumber: 26, cycleDay: 11, month: "current", defaultState: "default", phaseName: "Follicular Phase", chanceVariant: "Medium" },
  { dateNumber: 27, cycleDay: 12, month: "current", defaultState: "medium-chance", phaseName: "Follicular Phase", chanceVariant: "Medium" },
  { dateNumber: 28, cycleDay: 13, month: "current", defaultState: "default", phaseName: "Follicular Phase", chanceVariant: "Medium" },
  { dateNumber: 29, cycleDay: 14, month: "current", defaultState: "default", phaseName: "Follicular Phase", chanceVariant: "High" },
  { dateNumber: 30, cycleDay: 15, month: "current", defaultState: "high-chance", phaseName: "Ovulation Phase", chanceVariant: "High" },
  { dateNumber: 31, cycleDay: 16, month: "current", defaultState: "default", phaseName: "Luteal Phase", chanceVariant: "Low" },
];

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const { onboardingData, userLogs, updateDateLog } = useOnboarding();

  // Shared Month and Year state
  const currentCalendarYear = useMemo(() => new Date().getFullYear(), []);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // August
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [isPickerVisible, setIsPickerVisible] = useState<boolean>(false);

  // Selected date key: initial selection "current-17" ("Aug 17")
  const [selectedKey, setSelectedKey] = useState<string>("current-17");
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);

  // Re-compute days for the currently chosen month & year
  const monthDays = useMemo<DayGridDefinition[]>(() => {
    // If August 2025, preserve the exact reference mock data
    if (selectedYear === 2025 && selectedMonth === 8) {
      return AUGUST_DAYS;
    }

    const gridCells = generateMonthGrid(selectedYear, selectedMonth);
    return gridCells.map((cell) => {
      const isCurrent = cell.isCurrentMonth;
      let defaultState: DayCellState = !isCurrent ? "prev-month" : "default";

      let cycleDay: number | undefined = isCurrent ? cell.day : undefined;
      let phaseName = "Follicular Phase";
      let chanceVariant: "High" | "Medium" | "Low" = "Low";

      if (onboardingData) {
        const info = getCycleInfoForDate(cell.iso, onboardingData, userLogs);
        cycleDay = isCurrent ? info.cycleDay : undefined;
        phaseName = info.phaseName;
        chanceVariant = info.fertilityChance;

        if (!isCurrent) {
          defaultState = "prev-month";
        } else if (info.isPeriod) {
          defaultState = "period";
        } else if (info.isOvulation) {
          defaultState = "ovulation-icon";
        } else if (info.fertilityChance === "High") {
          defaultState = "high-chance";
        } else if (info.fertilityChance === "Medium") {
          defaultState = "medium-chance";
        } else {
          defaultState = "default";
        }
      } else {
        const isPeriod = userLogs?.periodDays?.includes(cell.iso);
        if (isPeriod) {
          defaultState = "period";
        }
      }

      return {
        dateNumber: cell.day,
        cycleDay,
        month: isCurrent ? "current" : "prev",
        defaultState,
        phaseName,
        chanceVariant,
      };
    });
  }, [selectedYear, selectedMonth, onboardingData, userLogs]);

  // Adjust row count dynamically: 5 or 6 rows depending on month days length (35 or 42)
  const rowsCount = monthDays.length / calendarTokens.columns;
  const sizes = useMemo(
    () => getCalendarSizes(screenWidth, screenHeight, rowsCount),
    [screenWidth, screenHeight, rowsCount]
  );

  // Header Title: "August" if current year, or "August 2027" if different year
  const headerTitle = useMemo(() => {
    const mName = MONTH_NAMES[selectedMonth - 1] || "August";
    return selectedYear === currentCalendarYear ? mName : `${mName} ${selectedYear}`;
  }, [selectedMonth, selectedYear, currentCalendarYear]);

  // Selected day grid definition
  const selectedDayDef = useMemo(() => {
    return (
      monthDays.find((d) => `${d.month}-${d.dateNumber}` === selectedKey) ||
      monthDays.find((d) => d.month === "current" && d.dateNumber === 1) ||
      monthDays[0]
    );
  }, [monthDays, selectedKey]);

  // Format date label (e.g. "Aug 17", "Aug 1", "Sep 1", etc.)
  const selectedDateLabel = useMemo(() => {
    if (selectedYear === 2025 && selectedMonth === 8) {
      const monthPrefix = selectedDayDef.month === "prev" ? "Jul" : "Aug";
      return `${monthPrefix} ${selectedDayDef.dateNumber}`;
    }
    const mPrefix =
      selectedDayDef.month === "prev"
        ? SHORT_MONTHS[(selectedMonth - 2 + 12) % 12]
        : SHORT_MONTHS[selectedMonth - 1];
    return `${mPrefix} ${selectedDayDef.dateNumber}`;
  }, [selectedDayDef, selectedMonth, selectedYear]);

  const selectedSubtitle = useMemo(() => {
    return `Cycle Day ${selectedDayDef.cycleDay || 1} - ${selectedDayDef.phaseName}`;
  }, [selectedDayDef]);

  // Construct items for CalendarGrid
  const gridItems: CalendarGridItem[] = useMemo(() => {
    return monthDays.map((day, idx) => {
      const key = `${day.month}-${day.dateNumber}-${idx}`;
      const isSelected = `${day.month}-${day.dateNumber}` === selectedKey;

      return {
        key,
        dateNumber: day.dateNumber,
        cycleDay: day.cycleDay,
        state: day.defaultState,
        isSelected,
        onPress: () => setSelectedKey(`${day.month}-${day.dateNumber}`),
      };
    });
  }, [monthDays, selectedKey]);

  const handleOpenEdit = () => {
    setIsEditModalVisible(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalVisible(false);
  };

  const handleSaveEdit = (iso: string, isPeriod: boolean, symptoms: string[]) => {
    updateDateLog(iso, isPeriod, symptoms);
  };

  // On Month/Year Apply: reset selected date to 1st of that month and update grid
  const handleMonthYearSelect = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setSelectedKey("current-1");
    setIsPickerVisible(false);
  };

  const selectedISO = useMemo(() => {
    const mNum =
      selectedDayDef.month === "prev"
        ? selectedMonth === 1
          ? 12
          : selectedMonth - 1
        : selectedMonth;
    const yNum =
      selectedDayDef.month === "prev" && selectedMonth === 1
        ? selectedYear - 1
        : selectedYear;
    const mStr = String(mNum).padStart(2, "0");
    const dStr = String(selectedDayDef.dateNumber).padStart(2, "0");
    return `${yNum}-${mStr}-${dStr}`;
  }, [selectedDayDef, selectedMonth, selectedYear]);

  const initialSymptoms = useMemo(() => {
    return userLogs?.symptoms?.[selectedISO] || [];
  }, [userLogs, selectedISO]);

  const isPeriodSelected = selectedDayDef.defaultState === "period";

  // Bottom scroll padding = bottom bar height + safe-area inset + spacing token (so badge row & divider are fully visible when scrolled)
  const bottomScrollPadding = TAB_BAR_HEIGHT + Math.max(insets.bottom, 12) + 8 + spacing.xl;

  return (
    <View style={styles.outerWrapper}>
      <ScrollView
        style={styles.screenContainer}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 14) + spacing.sm,
            paddingBottom: bottomScrollPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header: height 48px, title centered, calendar icon button opens MonthYearPicker */}
        <CalendarHeader
          monthTitle={headerTitle}
          onCyclePress={() => {
            setSelectedMonth(8);
            setSelectedYear(2025);
            setSelectedKey("current-17");
          }}
          onCalendarPress={() => setIsPickerVisible(true)}
        />

        {/* Even spacing between header and weekday row */}
        <View style={styles.elementSpacer} />

        {/* 2. Weekday row: height 28px, muted text centered over each column, aligning with grid */}
        <WeekdayRow cellWidth={sizes.cellWidth} totalWidth={sizes.totalGridWidth} />

        {/* Even spacing between weekday row and grid */}
        <View style={styles.elementSpacer} />

        {/* 3. Calendar grid: 7 columns x 5 or 6 rows, cellWidth & cellHeight scaled, 1px borders, rounded corners */}
        <CalendarGrid items={gridItems} sizes={sizes} />

        {/* Leftover height added as even vertical spacing above the info section */}
        <View style={styles.verticalSpacer} />

        {/* 4. Info section: selected date in section-title token, subtitle in muted token, Edit pill button, badge row, divider */}
        <DayInfo
          dateTitle={selectedDateLabel}
          subtitle={selectedSubtitle}
          chanceVariant={selectedDayDef.chanceVariant}
          onEditPress={handleOpenEdit}
        />

        {/* Leftover height added as even vertical spacing below the info section */}
        <View style={styles.verticalSpacer} />

        {/* Month and Year Picker Modal */}
        <MonthYearPicker
          visible={isPickerVisible}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onClose={() => setIsPickerVisible(false)}
          onDone={handleMonthYearSelect}
        />

        {/* Edit modal */}
        <EditDateModal
          visible={isEditModalVisible}
          iso={selectedISO}
          initialIsPeriod={isPeriodSelected}
          initialSymptoms={initialSymptoms}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    backgroundColor: colors.white, // Pure white #FFFFFF
    alignItems: "center", // Horizontally centered on wide screens
    width: "100%",
  },
  screenContainer: {
    flex: 1,
    width: "100%",
    maxWidth: calendarTokens.maxContainerWidth, // Cap at 480 on wide screens
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1, // Ensures full-height distribution so leftover height is evenly absorbed
    paddingHorizontal: calendarTokens.pagePadding, // 12px horizontal page padding (matches grid edge)
    width: "100%",
  },
  elementSpacer: {
    height: calendarTokens.elementGap, // 8px (spacing.sm) even spacing
    width: "100%",
  },
  verticalSpacer: {
    flex: 1,
    minHeight: spacing.lg, // 16px minimum vertical spacing on short screens
    width: "100%",
  },
});

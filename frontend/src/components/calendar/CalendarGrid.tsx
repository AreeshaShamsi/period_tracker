import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { calendarTokens, CalendarSizes } from "@/theme/sizes";
import { DayCell, DayCellState } from "./DayCell";

export interface CalendarGridItem {
  key: string;
  dateNumber: number;
  cycleDay?: number | string;
  state: DayCellState;
  isSelected?: boolean;
  onPress: () => void;
}

export interface CalendarGridProps {
  items: CalendarGridItem[];
  sizes?: CalendarSizes;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({ items, sizes }) => {
  // Group into 5 rows of 7 cells to prevent 6-cell wrapping and keep Saturday filled
  const rows = useMemo(() => {
    const r: CalendarGridItem[][] = [];
    for (let i = 0; i < items.length; i += calendarTokens.columns) {
      r.push(items.slice(i, i + calendarTokens.columns));
    }
    return r;
  }, [items]);

  return (
    <View
      style={[
        styles.gridContainer,
        sizes ? { width: sizes.outerGridWidth, alignSelf: "center" } : null,
      ]}
    >
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.gridRow}>
          {row.map((item) => (
            <View
              key={item.key}
              style={[
                styles.gridCellWrapper,
                sizes ? { width: sizes.cellWidth, height: sizes.cellHeight } : null,
              ]}
            >
              <DayCell
                dateNumber={item.dateNumber}
                cycleDay={item.cycleDay}
                state={item.state}
                isSelected={item.isSelected}
                onPress={item.onPress}
                cellWidth={sizes?.cellWidth}
                cellHeight={sizes?.cellHeight}
                dateFont={sizes?.dateFont}
                cycleFont={sizes?.cycleFont}
                iconSize={sizes?.iconSize}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    borderRadius: calendarTokens.gridRadius, // Outer corners of the grid use the existing radius token (16px)
    borderWidth: calendarTokens.gridBorderWidth, // Lightest existing border token
    borderColor: calendarTokens.gridBorderColor, // #EEEEEE
    overflow: "hidden", // Clips the outer corners smoothly without clipping last column
  },
  gridRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  gridCellWrapper: {
    flex: 1, // 7 columns evenly distributed across each row
    minWidth: 0, // minWidth: 0 so 7 cells can never overflow
  },
});


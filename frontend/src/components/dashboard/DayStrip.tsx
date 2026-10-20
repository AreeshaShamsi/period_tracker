import React, { useRef, useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { spacing } from "@/theme/spacing";
import { DayChip, DayChipState } from "./DayChip";

export interface DayStripItem {
  id: string;
  dayName: string;
  dayNumber: number;
  state: DayChipState;
}

export interface DayStripProps {
  days: DayStripItem[];
  currentDayIndex: number;
  onSelectDay?: (index: number) => void;
}

export const DayStrip: React.FC<DayStripProps> = ({
  days,
  currentDayIndex,
  onSelectDay,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (currentDayIndex > 1) {
      // Auto-center on current day so next chips peek offscreen
      const targetX = Math.max(0, (currentDayIndex - 1) * 72);
      scrollViewRef.current?.scrollTo({ x: targetX, animated: true });
    }
  }, [currentDayIndex]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {days.map((item, index) => (
          <DayChip
            key={item.id}
            dayName={item.dayName}
            dayNumber={item.dayNumber}
            state={item.state}
            onPress={() => onSelectDay?.(index)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm + 2, // 10dp gap between chips
  },
});

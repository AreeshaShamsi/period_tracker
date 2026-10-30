import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { colors } from "@/theme/colors";
import { opacity } from "@/theme/opacity";
import { radius } from "@/theme/radius";
import { calendarTokens, sizes } from "@/theme/sizes";
import { spacing } from "@/theme/spacing";
import { POPPINS_FONTS, typography } from "@/theme/typography";
import { AppText } from "@/components/ui/AppText";

export interface MonthYearPickerProps {
  visible: boolean;
  selectedMonth: number; // 1-12
  selectedYear: number;
  onClose: () => void;
  onDone: (month: number, year: number) => void;
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

// Item height from existing touchTarget / buttonHeight token
const ITEM_HEIGHT = sizes.touchTarget; // 44px
const VISIBLE_ROWS = 5;
const PADDING_ROWS = Math.floor(VISIBLE_ROWS / 2); // 2 rows above & below center
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS; // 220px

export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  visible,
  selectedMonth,
  selectedYear,
  onClose,
  onDone,
}) => {
  const insets = useSafeAreaInsets();

  // Range of years: (currentYear - 5) to (currentYear + 5)
  const currentCalendarYear = useMemo(() => new Date().getFullYear(), []);
  const years = useMemo(() => {
    return Array.from({ length: 11 }, (_, i) => currentCalendarYear - 5 + i);
  }, [currentCalendarYear]);

  // Working state inside the bottom sheet
  const [tempMonthIndex, setTempMonthIndex] = useState<number>(selectedMonth - 1);
  const [tempYearIndex, setTempYearIndex] = useState<number>(() => {
    const idx = years.indexOf(selectedYear);
    return idx !== -1 ? idx : Math.floor(years.length / 2);
  });

  const monthScrollRef = useRef<ScrollView>(null);
  const yearScrollRef = useRef<ScrollView>(null);

  // Audio / tick sound references
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitializedRef = useRef<boolean>(false);
  const lastMonthTickRef = useRef<number>(selectedMonth - 1);
  const lastYearTickRef = useRef<number>(tempYearIndex);

  // Preload sound on mount and cleanup on unmount
  useEffect(() => {
    if (Platform.OS === "web" && typeof Audio !== "undefined") {
      try {
        const audio = new Audio("/assets/sounds/tick.mp3");
        audio.preload = "auto";
        audioRef.current = audio;
      } catch {
        // Audio element not supported or file not present
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Tick sound & haptic player
  const triggerTick = useCallback(() => {
    if (!isInitializedRef.current) return;

    if (Platform.OS === "web") {
      if (audioRef.current) {
        try {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        } catch {
          // Playback error catch (e.g. browser autoplay restriction or missing file)
        }
      }
    } else {
      Haptics.selectionAsync().catch(() => {});
    }
  }, []);

  // Synchronize initial wheel positions when sheet becomes visible
  useEffect(() => {
    if (!visible) {
      isInitializedRef.current = false;
      return;
    }

    const initialMonthIdx = selectedMonth - 1;
    const initialYearIdx = years.indexOf(selectedYear) !== -1 ? years.indexOf(selectedYear) : 5;

    lastMonthTickRef.current = initialMonthIdx;
    lastYearTickRef.current = initialYearIdx;
    isInitializedRef.current = false;

    // Position wheels to selected month and year without sound on initial open
    const timer = setTimeout(() => {
      setTempMonthIndex(initialMonthIdx);
      setTempYearIndex(initialYearIdx);
      monthScrollRef.current?.scrollTo({
        y: initialMonthIdx * ITEM_HEIGHT,
        animated: false,
      });
      yearScrollRef.current?.scrollTo({
        y: initialYearIdx * ITEM_HEIGHT,
        animated: false,
      });
      isInitializedRef.current = true;
    }, 50);

    return () => clearTimeout(timer);
  }, [visible, selectedMonth, selectedYear, years]);

  // Handle Month scroll
  const handleMonthScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const rawIdx = Math.round(y / ITEM_HEIGHT);
    const clampedIdx = Math.max(0, Math.min(rawIdx, MONTH_NAMES.length - 1));

    if (clampedIdx !== tempMonthIndex) {
      setTempMonthIndex(clampedIdx);
      if (clampedIdx !== lastMonthTickRef.current) {
        lastMonthTickRef.current = clampedIdx;
        triggerTick();
      }
    }
  };

  // Handle Year scroll
  const handleYearScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const rawIdx = Math.round(y / ITEM_HEIGHT);
    const clampedIdx = Math.max(0, Math.min(rawIdx, years.length - 1));

    if (clampedIdx !== tempYearIndex) {
      setTempYearIndex(clampedIdx);
      if (clampedIdx !== lastYearTickRef.current) {
        lastYearTickRef.current = clampedIdx;
        triggerTick();
      }
    }
  };

  const handleApply = () => {
    const chosenMonth = tempMonthIndex + 1;
    const chosenYear = years[tempYearIndex] || currentCalendarYear;
    onDone(chosenMonth, chosenYear);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        {/* Dimmed backdrop - tapping closes sheet */}
        <Pressable
          style={styles.backdropOverlay}
          onPress={onClose}
          accessibilityLabel="Close picker"
        />

        {/* Bottom Sheet Card */}
        <View
          style={[
            styles.sheetCard,
            {
              paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.md,
            },
          ]}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Title in section-title token */}
          <AppText style={styles.titleText}>Select month and year</AppText>

          {/* Wheel Picker Row (Months & Years) */}
          <View style={styles.wheelsRow}>
            {/* Center Highlight Band */}
            <View pointerEvents="none" style={styles.highlightBand} />

            {/* Left Wheel: Months */}
            <View style={styles.wheelColumn}>
              <ScrollView
                ref={monthScrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                scrollEventThrottle={16}
                onScroll={handleMonthScroll}
                contentContainerStyle={styles.wheelContent}
              >
                {MONTH_NAMES.map((name, idx) => {
                  const distance = Math.abs(idx - tempMonthIndex);
                  const isSelected = distance === 0;

                  return (
                    <Pressable
                      key={name}
                      onPress={() => {
                        setTempMonthIndex(idx);
                        monthScrollRef.current?.scrollTo({
                          y: idx * ITEM_HEIGHT,
                          animated: true,
                        });
                        if (idx !== lastMonthTickRef.current) {
                          lastMonthTickRef.current = idx;
                          triggerTick();
                        }
                      }}
                      style={styles.itemCell}
                    >
                      <AppText
                        style={[
                          styles.itemText,
                          isSelected && styles.itemTextSelected,
                          distance === 1 && styles.itemTextNear,
                          distance >= 2 && styles.itemTextFar,
                        ]}
                      >
                        {name}
                      </AppText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Right Wheel: Years */}
            <View style={styles.wheelColumn}>
              <ScrollView
                ref={yearScrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                scrollEventThrottle={16}
                onScroll={handleYearScroll}
                contentContainerStyle={styles.wheelContent}
              >
                {years.map((yearNum, idx) => {
                  const distance = Math.abs(idx - tempYearIndex);
                  const isSelected = distance === 0;

                  return (
                    <Pressable
                      key={yearNum}
                      onPress={() => {
                        setTempYearIndex(idx);
                        yearScrollRef.current?.scrollTo({
                          y: idx * ITEM_HEIGHT,
                          animated: true,
                        });
                        if (idx !== lastYearTickRef.current) {
                          lastYearTickRef.current = idx;
                          triggerTick();
                        }
                      }}
                      style={styles.itemCell}
                    >
                      <AppText
                        style={[
                          styles.itemText,
                          isSelected && styles.itemTextSelected,
                          distance === 1 && styles.itemTextNear,
                          distance >= 2 && styles.itemTextFar,
                        ]}
                      >
                        {yearNum}
                      </AppText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {/* Done button: primary pink, pill radius */}
            <Pressable
              onPress={handleApply}
              accessibilityRole="button"
              accessibilityLabel="Apply month and year selection"
              style={({ pressed }) => [styles.doneButton, pressed && styles.pressed]}
            >
              <AppText style={styles.doneButtonText}>Done</AppText>
            </Pressable>

            {/* Cancel text button */}
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel selection"
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
            >
              <AppText style={styles.cancelButtonText}>Cancel</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  backdropOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.black,
    opacity: opacity.overlay, // 0.5 dimmed overlay token
  },
  sheetCard: {
    width: "100%",
    maxWidth: calendarTokens.maxContainerWidth, // 480 capped
    backgroundColor: colors.white, // Surface token
    borderTopLeftRadius: radius.large, // Large radius token (16px)
    borderTopRightRadius: radius.large,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    alignSelf: "center",
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.circleBorder, // Subtle divider token
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  titleText: {
    fontSize: typography.sectionTitle.fontSize ?? 16,
    fontFamily: POPPINS_FONTS.semibold,
    color: colors.calendar.textMain,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  wheelsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: WHEEL_HEIGHT,
    position: "relative",
    width: "100%",
  },
  highlightBand: {
    position: "absolute",
    top: ITEM_HEIGHT * PADDING_ROWS,
    left: spacing.xs,
    right: spacing.xs,
    height: ITEM_HEIGHT,
    backgroundColor: colors.primarySoft, // Tinted background from tokens
    borderRadius: radius.medium,
    borderWidth: 1,
    borderColor: colors.calendar.separator, // Lightest border token
  },
  wheelColumn: {
    flex: 1,
    height: WHEEL_HEIGHT,
    overflow: "hidden",
  },
  wheelContent: {
    paddingVertical: ITEM_HEIGHT * PADDING_ROWS,
  },
  itemCell: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  itemText: {
    textAlign: "center",
    fontFamily: POPPINS_FONTS.regular,
    fontSize: 14,
    color: colors.calendar.textSecondary,
  },
  itemTextSelected: {
    fontFamily: POPPINS_FONTS.semibold,
    fontSize: 17,
    color: colors.calendar.primaryPink, // Primary pink token
  },
  itemTextNear: {
    fontFamily: POPPINS_FONTS.medium,
    fontSize: 14,
    color: colors.calendar.textSecondary,
    opacity: opacity.pressed, // 0.7
  },
  itemTextFar: {
    fontFamily: POPPINS_FONTS.regular,
    fontSize: 12,
    color: colors.calendar.textSecondary,
    opacity: opacity.disabled, // 0.4
  },
  actionsContainer: {
    width: "100%",
    marginTop: spacing.md,
  },
  doneButton: {
    width: "100%",
    height: sizes.buttonHeight.large, // 48px
    backgroundColor: colors.calendar.primaryPink, // Primary pink token
    borderRadius: radius.pill, // Pill radius token
    alignItems: "center",
    justifyContent: "center",
  },
  doneButtonText: {
    fontSize: 16,
    fontFamily: POPPINS_FONTS.semibold,
    color: colors.white,
  },
  cancelButton: {
    width: "100%",
    height: sizes.buttonHeight.small, // 36px
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: POPPINS_FONTS.medium,
    color: colors.calendar.textSecondary,
  },
  pressed: {
    opacity: opacity.pressed,
  },
});

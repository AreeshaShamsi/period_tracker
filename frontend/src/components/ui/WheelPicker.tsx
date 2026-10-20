import React, { useEffect, useRef, useState } from "react";
import {
  DimensionValue,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { AppText } from "./AppText";

export interface WheelItem {
  label: string;
  value: number | string;
}

export interface WheelPickerProps {
  data: WheelItem[];
  selectedIndex: number;
  onChange: (index: number) => void;
  loop?: boolean;
  unit?: string;
  itemHeight?: number; // default 48
  visibleCount?: number; // default 7
  width?: DimensionValue;
  style?: ViewStyle;
}

export const WheelPicker: React.FC<WheelPickerProps> = ({
  data,
  selectedIndex,
  onChange,
  loop = false,
  unit,
  itemHeight = 48,
  visibleCount = 7,
  width = "100%",
  style,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const N = data.length;
  const paddingCount = Math.floor(visibleCount / 2); // 3 for visibleCount 7
  const containerHeight = itemHeight * visibleCount; // 336

  // If loop is true, repeat data 5x. Middle copy starts at index N * 2.
  const displayData = loop
    ? [...data, ...data, ...data, ...data, ...data]
    : data;

  const getTargetRawIndex = (origIdx: number) => {
    if (!loop) return Math.max(0, Math.min(origIdx, N - 1));
    return N * 2 + (((origIdx % N) + N) % N);
  };

  const targetRawIndex = getTargetRawIndex(selectedIndex);
  const [scrollingRawIndex, setScrollingRawIndex] = useState<number | null>(null);

  const centerRawIndex =
    scrollingRawIndex !== null ? scrollingRawIndex : targetRawIndex;

  // Sync scroll position when selectedIndex changes
  useEffect(() => {
    scrollViewRef.current?.scrollTo({
      y: targetRawIndex * itemHeight,
      animated: false,
    });
  }, [targetRawIndex, itemHeight]);

  const handleScrollSettled = (rawY: number) => {
    let rawIndex = Math.round(rawY / itemHeight);
    const maxRaw = displayData.length - 1;
    rawIndex = Math.max(0, Math.min(rawIndex, maxRaw));

    const origIndex = loop ? ((rawIndex % N) + N) % N : rawIndex;
    const finalRaw = loop ? N * 2 + origIndex : origIndex;

    setScrollingRawIndex(finalRaw);

    scrollViewRef.current?.scrollTo({
      y: finalRaw * itemHeight,
      animated: false,
    });

    onChange(origIndex);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const currentRaw = Math.round(y / itemHeight);
    setScrollingRawIndex(currentRaw);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      handleScrollSettled(y);
    }, 100);
  };

  const onItemPress = (rawIdx: number) => {
    const origIndex = loop ? ((rawIdx % N) + N) % N : rawIdx;
    const finalRaw = loop ? N * 2 + origIndex : origIndex;
    setScrollingRawIndex(finalRaw);

    scrollViewRef.current?.scrollTo({
      y: finalRaw * itemHeight,
      animated: true,
    });

    onChange(origIndex);
  };

  return (
    <View
      style={[
        {
          height: containerHeight,
          width: width as DimensionValue,
          overflow: "hidden",
          position: "relative",
        },
        style,
      ]}
    >
      {/* Top Selection Line */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: itemHeight * paddingCount,
          left: spacing.sm,
          right: spacing.sm,
          height: 1.5,
          backgroundColor: colors.primary,
          zIndex: 10,
        }}
      />

      {/* Bottom Selection Line */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: itemHeight * (paddingCount + 1) - 1.5,
          left: spacing.sm,
          right: spacing.sm,
          height: 1.5,
          backgroundColor: colors.primary,
          zIndex: 10,
        }}
      />

      {/* Optional Unit Label */}
      {unit ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: itemHeight * paddingCount,
            right: 0,
            height: itemHeight,
            justifyContent: "center",
            zIndex: 15,
          }}
        >
          <AppText variant="unitLabel">{unit}</AppText>
        </View>
      ) : null}

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        onMomentumScrollEnd={(e) =>
          handleScrollSettled(e.nativeEvent.contentOffset.y)
        }
        onScrollEndDrag={(e) =>
          handleScrollSettled(e.nativeEvent.contentOffset.y)
        }
        contentContainerStyle={{
          paddingVertical: itemHeight * paddingCount,
        }}
      >
        {displayData.map((item, idx) => {
          const distance = Math.abs(idx - centerRawIndex);

          let variant:
            | "wheelSelected"
            | "wheelNear"
            | "wheelMid"
            | "wheelFar" = "wheelFar";
          let opacity = 0.6;

          if (distance === 0) {
            variant = "wheelSelected";
            opacity = 1;
          } else if (distance === 1) {
            variant = "wheelNear";
            opacity = 0.7;
          } else if (distance === 2) {
            variant = "wheelMid";
            opacity = 0.45;
          } else {
            variant = "wheelFar";
            opacity = 0.25;
          }

          return (
            <Pressable
              key={`${idx}-${item.value}`}
              onPress={() => onItemPress(idx)}
              style={{
                height: itemHeight,
                justifyContent: "center",
                alignItems: "center",
                opacity,
              }}
            >
              <AppText variant={variant}>{item.label}</AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

export interface WheelColumn {
  header?: string;
  data: WheelItem[];
  selectedIndex: number;
  onChange: (index: number) => void;
  loop?: boolean;
  unit?: string;
}

export interface WheelRowProps {
  columns: WheelColumn[];
  separator?: React.ReactNode;
}

export const WheelRow: React.FC<WheelRowProps> = ({ columns, separator }) => {
  return (
    <View style={{ width: "100%" }}>
      {/* Optional Headers */}
      {columns.some((c) => c.header) && (
        <View
          style={{
            flexDirection: "row",
            marginBottom: spacing.md,
          }}
        >
          {columns.map((col, idx) => (
            <React.Fragment key={idx}>
              <View style={{ flex: 1, alignItems: "center" }}>
                {col.header ? (
                  <AppText variant="wheelLabel">{col.header}</AppText>
                ) : null}
              </View>
              {separator && idx < columns.length - 1 ? (
                <View style={{ width: 24 }} />
              ) : null}
            </React.Fragment>
          ))}
        </View>
      )}

      {/* Wheel Columns */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {columns.map((col, idx) => (
          <React.Fragment key={idx}>
            <View style={{ flex: 1 }}>
              <WheelPicker
                data={col.data}
                selectedIndex={col.selectedIndex}
                onChange={col.onChange}
                loop={col.loop}
                unit={col.unit}
              />
            </View>
            {separator && idx < columns.length - 1 ? (
              <View
                style={{
                  paddingHorizontal: spacing.xs,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {separator}
              </View>
            ) : null}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

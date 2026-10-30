import React from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/ui/AppText";

export interface CircleItemProps {
  label: string;
  icon: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * CircleItem: 64px white circle with a thin light-gray border containing
 * an icon/illustration, with a small label (11px, centered, truncated with ellipsis) under it.
 */
export const CircleItem: React.FC<CircleItemProps> = ({
  label,
  icon,
  onPress,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.itemContainer,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.circle}>
        {icon}
      </View>
      <AppText
        style={styles.labelText}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
      </AppText>
    </Pressable>
  );
};

export interface CircleRowProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * CircleRow: container rendering CircleItems in a horizontal row with 16px gap.
 */
export const CircleRow: React.FC<CircleRowProps> = ({ children, style }) => {
  return <View style={[styles.rowContainer, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  itemContainer: {
    alignItems: "center",
    width: 68,
  },
  pressed: {
    opacity: 0.7,
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#E5E5EA", // thin light-gray border
    alignItems: "center",
    justifyContent: "center",
  },
  labelText: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "400",
    color: colors.calendar.textMain, // #202124
    textAlign: "center",
    width: 68,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
});

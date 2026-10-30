import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";
import { calendarTokens } from "@/theme/sizes";
import { AppText } from "@/components/ui/AppText";
import { DropIcon } from "./icons";

export interface OutlineButtonProps {
  label?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export const OutlineButton: React.FC<OutlineButtonProps> = ({
  label = "Edit",
  onPress,
  accessibilityLabel,
}) => {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      style={({ pressed }) => [styles.pillContainer, pressed && styles.pressed]}
    >
      <DropIcon size={14} color={colors.calendar.primaryPink} />
      <AppText style={styles.buttonLabel}>{label}</AppText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: calendarTokens.editButtonHeight, // height 36px
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.primary, // #E5E5EA
  },
  pressed: {
    opacity: 0.65,
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.calendar.textMain, // #202124
  },
});

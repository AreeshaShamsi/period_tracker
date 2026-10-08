import React from "react";
import { Pressable } from "react-native";
import { colors } from "@/theme/colors";
import { AppText } from "./AppText";

export interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const Chip: React.FC<ChipProps> = ({ label, selected, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        height: 36,
        paddingHorizontal: 20,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: selected ? colors.primary : colors.white,
        borderWidth: selected ? 0 : 1,
        borderColor: selected ? "transparent" : colors.separator,
      }}
    >
      <AppText
        variant="chip"
        color={selected ? colors.white : colors.textPrimary}
      >
        {label}
      </AppText>
    </Pressable>
  );
};

import React from "react";
import { View } from "react-native";
import { spacing } from "@/theme/spacing";
import { Chip } from "./Chip";

export interface SegmentedChipsOption {
  label: string;
  value: string;
}

export interface SegmentedChipsProps {
  options: SegmentedChipsOption[];
  value: string;
  onChange: (value: string) => void;
}

export const SegmentedChips: React.FC<SegmentedChipsProps> = ({
  options,
  value,
  onChange,
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: spacing.md,
      }}
    >
      {options.map((opt) => (
        <Chip
          key={opt.value}
          label={opt.label}
          selected={value === opt.value}
          onPress={() => onChange(opt.value)}
        />
      ))}
    </View>
  );
};

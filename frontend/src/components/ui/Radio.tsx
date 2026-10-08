import React from "react";
import { Pressable, View, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";
import { sizes } from "@/theme/sizes";
import { AppText } from "./AppText";

export interface RadioProps {
  selected: boolean;
  onSelect: () => void;
  label?: string;
  disabled?: boolean;
  style?: ViewStyle;
  className?: string;
}

export const Radio: React.FC<RadioProps> = ({
  selected,
  onSelect,
  label,
  disabled = false,
  style,
  className = "",
}) => {
  const outerBorderColor = disabled
    ? colors.semantic.disabled
    : selected
    ? colors.brand.primary
    : colors.border.primary;

  return (
    <Pressable
      onPress={() => !disabled && onSelect()}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label || "Radio button"}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          minHeight: sizes.touchTarget,
          paddingVertical: 6,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      className={className}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 2,
          borderColor: outerBorderColor,
          backgroundColor: colors.white,
          alignItems: "center",
          justifyContent: "center",
          marginRight: label ? 10 : 0,
        }}
      >
        {selected && (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: disabled ? colors.semantic.disabled : colors.brand.primary,
            }}
          />
        )}
      </View>
      {label && (
        <AppText variant="body" color={disabled ? colors.text.tertiary : colors.text.primary}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
};

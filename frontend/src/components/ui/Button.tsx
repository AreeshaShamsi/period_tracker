import React from "react";
import {
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { AppText } from "./AppText";

if (__DEV__) {
  if (colors?.primary === undefined) console.warn("[Button] colors.primary is undefined");
  if (colors?.appleBlack === undefined) console.warn("[Button] colors.appleBlack is undefined");
  if (colors?.white === undefined) console.warn("[Button] colors.white is undefined");
  if (colors?.separator === undefined) console.warn("[Button] colors.separator is undefined");
  if (radius?.button === undefined) console.warn("[Button] radius.button is undefined");
  if (spacing === undefined) console.warn("[Button] spacing is undefined");
}

export interface ButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  onPress: () => void;
  variant?: "dark" | "outline" | "primary";
  shape?: "rounded" | "pill";
  leftIcon?: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = "dark",
  shape = "rounded",
  leftIcon,
  disabled = false,
  style,
  className = "",
  accessibilityLabel,
  ...props
}) => {
  const isPrimary = variant === "primary";
  const isDark = variant === "dark";
  const isOutline = variant === "outline";

  const backgroundColor = isPrimary
    ? colors.primary
    : isDark
    ? colors.appleBlack
    : colors.white;

  const borderColor = isOutline ? colors.separator : "transparent";
  const borderWidth = isOutline ? 1 : 0;
  const textColor = isPrimary || isDark ? colors.white : colors.textPrimary;
  const borderRadius = shape === "pill" ? 999 : radius.button;

  const webStyles = Platform.select<ViewStyle>({
    web: {
      cursor: disabled ? "not-allowed" : "pointer",
      outlineStyle: "none",
      userSelect: "none",
    } as any,
    default: {},
  });

  return (
    <Pressable
      onPress={!disabled ? onPress : undefined}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        {
          height: 52,
          borderRadius,
          overflow: "hidden",
          backgroundColor,
          borderWidth,
          borderColor,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "stretch",
          paddingHorizontal: spacing.lg,
          opacity: pressed ? 0.85 : disabled ? 0.5 : 1,
        },
        webStyles,
        style,
      ]}
      className={className}
      {...props}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          borderRadius,
        }}
      >
        {leftIcon ? <View style={{ marginRight: 12 }}>{leftIcon}</View> : null}
        <AppText
          variant="button"
          color={textColor}
          weight="600"
        >
          {label}
        </AppText>
      </View>
    </Pressable>
  );
};

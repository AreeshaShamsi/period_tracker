import React from "react";
import { Pressable, View } from "react-native";
import { colors } from "@/theme/colors";
import { AppText } from "./AppText";

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "dark" | "outline" | "primary";
  shape?: "rounded" | "pill";
  leftIcon?: React.ReactNode;
  disabled?: boolean;
  className?: string;   
  accessibilityLabel?: string;
  testID?: string;
}

const VARIANT = {
  primary: "bg-primary",
  dark: "bg-apple-black",
  outline: "bg-white border border-separator",
} as const;

const SHAPE = { rounded: "rounded-button", pill: "rounded-full" } as const;

export const Button = ({
  label,
  onPress,
  variant = "dark",
  shape = "rounded",
  leftIcon,
  disabled = false,
  className = "",
  accessibilityLabel,
  testID,
}: ButtonProps) => {
  const textColor = variant === "outline" ? colors.textPrimary : colors.white;
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      className={`self-stretch w-full active:opacity-80 ${disabled ? "opacity-50" : "opacity-100"} ${className}`}
    >
      <View
        className={`h-[52px] w-full flex-row items-center justify-center px-4 overflow-hidden ${VARIANT[variant]} ${SHAPE[shape]}`}
      >
        {leftIcon ? <View className="mr-3">{leftIcon}</View> : null}
        <AppText variant="button" color={textColor}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
};
import React from "react";
import { Text as RNText, TextProps as RNTextProps, TextStyle, StyleSheet } from "react-native";
import { typography, TypographyVariant, getFontFamilyForWeight } from "@/theme/typography";

export interface AppTextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: "auto" | "left" | "right" | "center" | "justify";
  weight?: TextStyle["fontWeight"];
  className?: string;
  numberOfLines?: number;
  onPress?: () => void;
  children?: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = "body",
  color,
  align,
  weight,
  style,
  className = "",
  numberOfLines,
  onPress,
  children,
  ...props
}) => {
  const tokenStyle = typography[variant] || {};
  const mergedStyle: TextStyle = {
    ...tokenStyle,
    ...(color ? { color } : {}),
    ...(align ? { textAlign: align } : {}),
  };

  if (weight) {
    mergedStyle.fontFamily = getFontFamilyForWeight(weight);
    delete mergedStyle.fontWeight;
  }

  const flattenedStyle = StyleSheet.flatten([mergedStyle, style]) as TextStyle;
  if (flattenedStyle && flattenedStyle.fontWeight) {
    flattenedStyle.fontFamily = getFontFamilyForWeight(flattenedStyle.fontWeight);
    delete flattenedStyle.fontWeight;
  }

  return (
    <RNText
      style={flattenedStyle}
      className={className}
      numberOfLines={numberOfLines}
      onPress={onPress}
      {...props}
    >
      {children}
    </RNText>
  );
};

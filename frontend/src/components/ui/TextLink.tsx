import React from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import { AppText } from "./AppText";

export interface TextLinkProps {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export const TextLink: React.FC<TextLinkProps> = ({
  label,
  onPress,
  style,
  className = "",
}) => {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={style}
      className={className}
    >
      <AppText variant="link" align="center">
        {label}
      </AppText>
    </Pressable>
  );
};

import React from "react";
import { View, ViewStyle } from "react-native";
import { DividerWithLabel } from "@/components/ui/DividerWithLabel";

export interface AuthDividerProps {
  text?: string;
  style?: ViewStyle;
  className?: string;
}

export const AuthDivider: React.FC<AuthDividerProps> = ({
  text = "Already have an account?",
  style,
  className = "",
}) => {
  return (
    <View style={style} className={className}>
      <DividerWithLabel label={text} />
    </View>
  );
};

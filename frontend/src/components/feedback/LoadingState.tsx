import React from "react";
import { ActivityIndicator, View, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/ui/AppText";

export interface LoadingStateProps {
  message?: string;
  color?: string;
  style?: ViewStyle;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  color = colors.brand.primary,
  style,
  className = "",
}) => {
  return (
    <View
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        },
        style,
      ]}
      className={className}
    >
      <ActivityIndicator size="large" color={color} style={{ marginBottom: 12 }} />
      {message && (
        <AppText variant="subheadline" color={colors.text.secondary} align="center">
          {message}
        </AppText>
      )}
    </View>
  );
};

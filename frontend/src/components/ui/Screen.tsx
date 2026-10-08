import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  paddingHorizontal?: boolean;
  backgroundColor?: string;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  statusBarStyle?: "auto" | "inverted" | "light" | "dark";
  className?: string;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  paddingHorizontal = true,
  backgroundColor = colors.background,
  style,
  contentContainerStyle,
  statusBarStyle = "dark",
  className = "",
}) => {
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
  };

  const innerPaddingStyle: ViewStyle = paddingHorizontal
    ? { paddingHorizontal: spacing.xl }
    : {};

  return (
    <SafeAreaView style={[containerStyle, style]} className={className}>
      <StatusBar
        barStyle={statusBarStyle === "dark" ? "dark-content" : "light-content"}
        backgroundColor={backgroundColor}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scrollable ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[
              { flexGrow: 1, paddingBottom: spacing.xl },
              innerPaddingStyle,
              contentContainerStyle,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[{ flex: 1 }, innerPaddingStyle, contentContainerStyle]}>
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

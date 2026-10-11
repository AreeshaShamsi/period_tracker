import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { getTabBarContentPaddingBottom } from "@/theme/sizes";
import { AppText, Screen } from "@/components/ui";

export default function CalendarTabRoute() {
  const insets = useSafeAreaInsets();
  const paddingBottom = getTabBarContentPaddingBottom(insets.bottom);

  return (
    <Screen scrollable={false} paddingHorizontal backgroundColor={colors.white}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingBottom,
        }}
      >
        <AppText variant="screenTitle">Calendar</AppText>
        <View style={{ height: spacing.sm }} />
        <AppText variant="body" align="center">
          Coming soon
        </AppText>
      </View>
    </Screen>
  );
}

import React from "react";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { TAB_BAR_HEIGHT } from "@/theme/sizes";
import { TabItem } from "./TabItem";

export type BottomTabBarProps = Parameters<
  NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>
>[0];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPosition = Math.max(insets.bottom, 12) + 8;
  const dynamicPosition: ViewStyle = { bottom: bottomPosition };

  return (
    <View style={[styles.barWrapper, dynamicPosition, styles.shadow]}>
      {Platform.OS === "android" ? (
        <BlurView
          intensity={40}
          tint="light"
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        >
          <View style={[StyleSheet.absoluteFill, styles.androidGlassBg]} />
        </BlurView>
      ) : (
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill}>
          <View style={[StyleSheet.absoluteFill, styles.glassBg]} />
        </BlurView>
      )}

      <View style={[StyleSheet.absoluteFill, styles.glassBorder]} pointerEvents="none" />

      <View style={styles.tabsRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          if (options.tabBarItemStyle === false) return null;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => navigation.emit({ type: "tabLongPress", target: route.key });

          return (
            <TabItem
              key={route.key}
              routeName={route.name}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  barWrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    ...(Platform.OS === "web" ? { maxWidth: 448, marginHorizontal: "auto" as any } : {}),
    height: TAB_BAR_HEIGHT,
    borderRadius: radius.tabBarFloating,
    overflow: "hidden",
  },
  shadow: Platform.select<ViewStyle>({
    ios: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 4 } },
    android: { elevation: 10 },
    default: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 4 } },
  }) as ViewStyle,
  androidGlassBg: { backgroundColor: colors.glassBgAndroid },
  glassBg: { backgroundColor: colors.glassBg },
  glassBorder: { borderRadius: radius.tabBarFloating, borderWidth: 1, borderColor: colors.glassBorder },
  tabsRow: { flexDirection: "row", alignItems: "center", height: "100%", paddingHorizontal: 8 },
});

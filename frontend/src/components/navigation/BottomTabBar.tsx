import React, { useEffect, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { TAB_BAR_HEIGHT } from "@/theme/sizes";
import { AppText } from "@/components/ui/AppText";
import {
  AIChatTabIcon,
  AnalyticsTabIcon,
  CalendarTabIcon,
  HomeTabIcon,
  ProfileTabIcon,
  TabIconProps,
} from "@/components/icons";

export type BottomTabBarProps = Parameters<
  NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>
>[0];

interface TabConfigItem {
  label: string;
  Icon: React.FC<TabIconProps>;
}

const TAB_CONFIG: Record<string, TabConfigItem> = {
  index: { label: "Home", Icon: HomeTabIcon },
  calendar: { label: "Calendar", Icon: CalendarTabIcon },
  analytics: { label: "Analytic", Icon: AnalyticsTabIcon },
  "ai-chat": { label: "AI Chat", Icon: AIChatTabIcon },
  profile: { label: "Profile", Icon: ProfileTabIcon },
};

interface TabItemProps {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const TabItem: React.FC<TabItemProps> = ({
  routeName,
  isFocused,
  onPress,
  onLongPress,
}) => {
  const config = TAB_CONFIG[routeName] || {
    label: routeName,
    Icon: HomeTabIcon,
  };
  const { label, Icon } = config;

  const [anim] = useState(() => new Animated.Value(isFocused ? 1 : 0));
  const [scale] = useState(() =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.85, 1],
    })
  );

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isFocused ? 1 : 0,
      duration: 160,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [isFocused, anim]);

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={onLongPress}
      hitSlop={8}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        {/* Animated Active Icon (scale 0.85 -> 1) */}
        <Animated.View style={{ transform: [{ scale }] }}>
          <Icon
            size={24}
            color={isFocused ? colors.tabActive : colors.tabInactive}
            active={isFocused}
          />
        </Animated.View>

        {/* 6px below: label */}
        <View style={{ marginTop: 6, alignItems: "center" }}>
          {isFocused ? (
            <AppText variant="tabLabelActive" color={colors.tabActive}>
              {label}
            </AppText>
          ) : (
            <AppText variant="tabLabel" color={colors.tabInactive}>
              {label}
            </AppText>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  const containerShadowStyle = Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 4 },
    },
    android: {
      elevation: 10,
    },
    web: {
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
    } as unknown as ViewStyle,
    default: {},
  });

  return (
    <View
      style={[
        {
          position: "absolute",
          bottom: Math.max(insets.bottom, 12) + 8,
          left: 16,
          right: 16,
          height: TAB_BAR_HEIGHT,
          borderRadius: radius.tabBarFloating,
          overflow: "hidden",
        },
        containerShadowStyle,
      ]}
    >
      {/* Background Glass Blur & Overlay */}
      {Platform.OS === "android" ? (
        <BlurView
          intensity={40}
          tint="light"
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        >
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: colors.glassBgAndroid },
            ]}
          />
        </BlurView>
      ) : (
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill}>
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: colors.glassBg },
            ]}
          />
        </BlurView>
      )}

      {/* Glass Border */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: radius.tabBarFloating,
            borderWidth: 1,
            borderColor: colors.glassBorder,
          },
        ]}
        pointerEvents="none"
      />

      {/* Content Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          height: "100%",
          paddingHorizontal: 8,
        }}
      >
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

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

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

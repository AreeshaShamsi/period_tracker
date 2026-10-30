import React, { useEffect, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { AppText } from "@/components/ui/AppText";
import {
  AIChatTabIcon,
  AnalyticsTabIcon,
  CalendarTabIcon,
  HomeTabIcon,
  ProfileTabIcon,
  TabIconProps,
} from "@/components/icons";

interface TabConfigItem {
  label: string;
  Icon: React.FC<TabIconProps>;
}

const TAB_CONFIG: Record<string, TabConfigItem> = {
  index: { label: "Home", Icon: HomeTabIcon },
  calendar: { label: "Calendar", Icon: CalendarTabIcon },
  analytics: { label: "Tracker", Icon: AnalyticsTabIcon },
  "ai-chat": { label: "Articles", Icon: AIChatTabIcon },
  profile: { label: "Account", Icon: ProfileTabIcon },
};

export interface TabItemProps {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

export const TabItem: React.FC<TabItemProps> = ({
  routeName,
  isFocused,
  onPress,
  onLongPress,
}) => {
  const config = TAB_CONFIG[routeName] || { label: routeName, Icon: HomeTabIcon };
  const { label, Icon } = config;
  const [anim] = useState(() => new Animated.Value(isFocused ? 1 : 0));
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

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
      style={styles.tabPressable}
    >
      <View style={styles.tabInner}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Icon
            size={22}
            color={isFocused ? colors.nav.active : colors.nav.inactive}
            active={isFocused}
          />
        </Animated.View>

        <View style={styles.labelContainer}>
          {isFocused ? (
            <View style={styles.activePill}>
              <AppText variant="caption" style={styles.activeLabelText}>
                {label}
              </AppText>
            </View>
          ) : (
            <AppText variant="caption" style={styles.inactiveLabelText}>
              {label}
            </AppText>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tabPressable: { flex: 1, alignItems: "center", justifyContent: "center" },
  tabInner: { alignItems: "center", justifyContent: "center" },
  labelContainer: { marginTop: 4, alignItems: "center" },
  activePill: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 8,
    paddingVertical: 1.5,
    borderRadius: radius.pill,
  },
  activeLabelText: { fontSize: 10, fontWeight: "700", color: colors.white },
  inactiveLabelText: { fontSize: 11, fontWeight: "500", color: colors.nav.inactive },
});

import React from "react";
import { Alert, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { DEMO_USER } from "@/constants/auth";
import { LunariLogo } from "@/components/auth";
import { AppCard, AppIcon, AppText, Divider, Screen } from "@/components/ui";

export default function AccountScreen() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => router.replace("/(auth)/welcome"),
      },
    ]);
  };

  const menuItems = [
    { id: "profile", icon: "profile" as const, title: "Your Profile" },
    { id: "notifications", icon: "notification" as const, title: "Notifications" },
    { id: "privacy", icon: "privacy" as const, title: "Privacy & Security" },
    { id: "help", icon: "help" as const, title: "Help & Support" },
  ];

  return (
    <Screen scrollable paddingHorizontal backgroundColor={colors.white}>
      {/* Top Header Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 12,
          paddingBottom: 16,
        }}
      >
        <AppText variant="title2" weight="700" color={colors.textPrimary} style={{ fontSize: 22 }}>
          Account
        </AppText>
        <Pressable
          onPress={() => Alert.alert("Settings", "Settings screen coming soon")}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <AppIcon name="settings" size="medium" color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* User Profile Row using reusable LunariLogo (medium size 48px) */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
        }}
      >
        <LunariLogo size="medium" style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <AppText variant="body" weight="600" color={colors.textPrimary} style={{ fontSize: 15 }}>
            {DEMO_USER.name}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} style={{ fontSize: 12, marginTop: 2 }}>
            {DEMO_USER.email}
          </AppText>
        </View>
        <AppIcon name="chevronRight" size="small" color={colors.textMuted} />
      </View>

      <Divider spacing={10} color={colors.border} />

      {/* Menu Rows */}
      <View style={{ marginTop: 2 }}>
        {menuItems.map((item, idx) => (
          <React.Fragment key={item.id}>
            <Pressable
              onPress={() => Alert.alert(item.title, "Option selected")}
              style={{
                height: 52,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              accessibilityRole="button"
              accessibilityLabel={item.title}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <AppIcon name={item.icon} size="medium" color={colors.textPrimary} />
                <AppText variant="body" color={colors.textPrimary} style={{ fontSize: 14 }}>
                  {item.title}
                </AppText>
              </View>
              <AppIcon name="chevronRight" size="small" color={colors.textMuted} />
            </Pressable>
            {idx < menuItems.length - 1 && <Divider spacing={0} color={colors.border} />}
          </React.Fragment>
        ))}
      </View>

      <Divider spacing={14} color={colors.border} />

      {/* Log Out Action Row */}
      <Pressable
        onPress={handleLogout}
        style={{
          height: 52,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
        accessibilityRole="button"
        accessibilityLabel="Log Out"
      >
        <AppIcon name="logout" size="medium" color={colors.primary} />
        <AppText variant="body" weight="600" color={colors.primary} style={{ fontSize: 14 }}>
          Log Out
        </AppText>
      </Pressable>

      {/* Bottom Wellness Supportive Card */}
      <AppCard
        variant="soft"
        cardRadius="medium"
        style={{
          backgroundColor: colors.brand.soft,
          borderRadius: 14,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          marginTop: "auto",
          marginBottom: 16,
        }}
      >
        <View
          style={{
            width: 32,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.white,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AppIcon name="heart" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="subheadline" weight="600" color={colors.textPrimary} style={{ fontSize: 13 }}>
            You{"'"}re doing great!
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} style={{ fontSize: 11, marginTop: 2 }}>
            Your health matters ✨
          </AppText>
        </View>
      </AppCard>
    </Screen>
  );
}

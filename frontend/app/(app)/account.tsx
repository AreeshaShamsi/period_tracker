import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { DEMO_USER } from "@/constants/auth";
import { LunariLogo } from "@/components/auth";
import { authService } from "@/services/auth.service";
import { getAuthUser } from "@/lib/storage";
import { AuthUser } from "@/types/auth";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { getTabBarContentPaddingBottom } from "@/theme/sizes";
import {
  AppCard,
  AppIcon,
  AppText,
  Divider,
  ErrorModal,
  Screen,
} from "@/components/ui";

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const paddingBottom = getTabBarContentPaddingBottom(insets.bottom);

  const [user, setUser] = useState<Partial<AuthUser>>({
    name: DEMO_USER.name,
    email: DEMO_USER.email,
    is_google_linked: false,
    has_password: true,
    auth_providers: ["email"],
  });

  const [modalState, setModalState] = useState<{
    visible: boolean;
    title?: string;
    message: string;
  }>({
    visible: false,
    message: "",
  });

  useEffect(() => {
    let isMounted = true;

    // Load cached authenticated user first if available
    getAuthUser().then((cached) => {
      if (isMounted && cached?.name) {
        setUser((prev) => ({
          ...prev,
          name: cached.name,
          email: cached.email,
          is_google_linked: cached.is_google_linked ?? false,
          has_password: cached.has_password ?? true,
          auth_providers: cached.auth_providers ?? ["email"],
        }));
      }
    });

    // Fetch verified current user from GET /api/auth/me
    authService
      .getCurrentUser()
      .then((res) => {
        if (isMounted && res.data?.user) {
          setUser(res.data.user);
        }
      })
      .catch(() => {
        // Fall back gracefully to cached or default user when offline or unauthorized
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const { signInWithGoogle: linkGoogleAccount, isLoading: isLinkingGoogle } =
    useGoogleAuth({
      mode: "link",
      onSuccess: async () => {
        try {
          const res = await authService.getCurrentUser();
          if (res.data?.user) {
            setUser(res.data.user);
          }
        } catch {}
        setModalState({
          visible: true,
          title: "Account Linked",
          message:
            "Your Google account has been successfully linked! You can now sign in using either your password or Google.",
        });
      },
      onError: (msg, details) => {
        setModalState({
          visible: true,
          title: details?.title || "Account Linking Notice",
          message: details?.message || msg,
        });
      },
    });

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await authService.logout();
          } catch (err) {
            console.error("Logout error:", err);
          } finally {
            router.replace("/(auth)/welcome");
          }
        },
      },
    ]);
  };

  const menuItems = [
    { id: "profile", icon: "profile" as const, title: "Your Profile" },
    { id: "notifications", icon: "notification" as const, title: "Notifications" },
    { id: "privacy", icon: "privacy" as const, title: "Privacy & Security" },
    { id: "help", icon: "help" as const, title: "Help & Support" },
  ];

  const isGoogleLinked = Boolean(
    user.is_google_linked || user.auth_providers?.includes("google")
  );

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
            {user.name}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} style={{ fontSize: 12, marginTop: 2 }}>
            {user.email}
          </AppText>
        </View>
        <AppIcon name="chevronRight" size="small" color={colors.textMuted} />
      </View>

      <Divider spacing={12} color={colors.border} />

      {/* Sign-In Methods / Linked Accounts Section */}
      <View style={{ paddingVertical: 10 }}>
        <AppText
          variant="caption"
          weight="600"
          color={colors.textSecondary}
          style={{ textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}
        >
          Sign-In Methods
        </AppText>

        {/* Email & Password Provider Row */}
        {user.has_password !== false && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 10,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <AppIcon name="email" size="medium" color={colors.textPrimary} />
              <View>
                <AppText variant="body" weight="600" color={colors.textPrimary} style={{ fontSize: 14 }}>
                  Password
                </AppText>
                <AppText variant="caption" color={colors.textSecondary} style={{ fontSize: 12 }}>
                  {user.email}
                </AppText>
              </View>
            </View>
            <View
              style={{
                backgroundColor: colors.brand.soft,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <AppText variant="caption" weight="600" color={colors.primary}>
                Active
              </AppText>
            </View>
          </View>
        )}

        {/* Google Sign-In Provider Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <AppIcon name="google" size="medium" color={colors.textPrimary} />
            <View>
              <AppText variant="body" weight="600" color={colors.textPrimary} style={{ fontSize: 14 }}>
                Google
              </AppText>
              <AppText variant="caption" color={colors.textSecondary} style={{ fontSize: 12 }}>
                {isGoogleLinked ? "Linked & active" : "Not connected"}
              </AppText>
            </View>
          </View>

          {isGoogleLinked ? (
            <View
              style={{
                backgroundColor: colors.brand.soft,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <AppText variant="caption" weight="600" color={colors.primary}>
                Linked
              </AppText>
            </View>
          ) : (
            <Pressable
              onPress={() => linkGoogleAccount()}
              disabled={isLinkingGoogle}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                opacity: isLinkingGoogle ? 0.7 : 1,
              }}
              accessibilityRole="button"
              accessibilityLabel="Link Google Account"
            >
              {isLinkingGoogle ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <AppText variant="caption" weight="600" color={colors.white}>
                  Link Google
                </AppText>
              )}
            </Pressable>
          )}
        </View>
      </View>

      <Divider spacing={12} color={colors.border} />

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
          marginBottom: 16,
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
          marginBottom: paddingBottom + 16,
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

      {/* Reusable Error / Status Modal */}
      <ErrorModal
        visible={modalState.visible}
        title={modalState.title}
        message={modalState.message}
        onDismiss={() => setModalState({ visible: false, message: "" })}
        buttonText="OK"
      />
    </Screen>
  );
}

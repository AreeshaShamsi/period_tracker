import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { sizes } from "@/theme/sizes";
import { shadows } from "@/theme/shadows";
import { opacity } from "@/theme/opacity";
import { AppText } from "@/components/ui";
import { useOnboarding } from "@/state/OnboardingContext";
import { headerStrings } from "@/constants/dashboardStrings";

export interface HeaderSectionProps {
  userName?: string;
  photoUri?: string;
  onAvatarPress?: () => void;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  userName,
  photoUri,
  onAvatarPress,
}) => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { onboardingData } = useOnboarding();
  const rawName = userName || onboardingData?.name || "Areesha";
  const firstName = rawName.trim().split(" ")[0] || "there";
  const isCompact = width <= 340;

  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <AppText variant="bodySmall" color={colors.text.secondary}>
          {headerStrings.greeting(firstName)}
        </AppText>
        <AppText
          variant="heading"
          weight="700"
          color={colors.text.primary}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          style={isCompact ? styles.compact : undefined}
        >
          {headerStrings.tagline}
        </AppText>
      </View>

      <Pressable
        onPress={onAvatarPress ?? (() => router.push("/profile"))}
        accessibilityRole="button"
        accessibilityLabel={headerStrings.openProfile}
        style={({ pressed }) => [styles.avatar, pressed && styles.avatarPressed]}
      >
        <View style={styles.avatarInner}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <AppText variant="cardTitle" weight="700" color={colors.brand.primary}>
              {firstName.charAt(0).toUpperCase()}
            </AppText>
          )}
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  textBlock: { flex: 1, alignItems: "flex-start", gap: spacing.xs },
  compact: { fontSize: sizes.header.taglineFontSizeCompact, lineHeight: 24 },
  avatar: {
    width: sizes.header.avatarSize,
    height: sizes.header.avatarSize,
    borderRadius: radius.pill,
    borderWidth: sizes.header.avatarRingWidth,
    borderColor: colors.white,
    ...shadows.avatar,
  },
  avatarInner: {
    flex: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.recommendation.cardBackground,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarPressed: { opacity: opacity.pressed },
  image: { width: "100%", height: "100%" },
});

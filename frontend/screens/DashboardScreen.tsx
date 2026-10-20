import React from "react";
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { getTabBarContentPaddingBottom } from "@/theme/sizes";
import { useOnboarding } from "@/state/OnboardingContext";
import { AppText, Button, Screen } from "@/components/ui";
import { ChevronRightIcon, DropIcon, MoreVertIcon } from "@/components/icons";
import { LunariLogo } from "@/components/auth";
import { avgCycleLength, cycleDay } from "@/utils/cycle";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface DashboardScreenProps {
  onProfile?: () => void;
  onQuickLog?: (type?: any) => void;
  onEditPeriod?: () => void;
  onSeeAllPhases?: () => void;
  onPhasePress?: (phaseIndex: number) => void;
  onMenuPress?: () => void;
}

const PHASES = [
  {
    number: 1,
    name: "Menstrual",
    color: "#FF4D80",
    bgColor: "#FFF0F5",
    icon: (
      <Svg width={48} height={48} viewBox="0 0 48 48">
        <Circle cx={24} cy={24} r={20} fill="#FFDDE6" />
        <Path
          d="M24 12C20 18 16 23 16 27C16 31.4 19.6 35 24 35C28.4 35 32 31.4 32 27C32 23 28 18 24 12Z"
          fill="#FF4D80"
        />
      </Svg>
    ),
  },
  {
    number: 2,
    name: "Follicular",
    color: "#0284C7",
    bgColor: "#F0F9FF",
    icon: (
      <Svg width={48} height={48} viewBox="0 0 48 48">
        <Circle cx={24} cy={24} r={20} fill="#E0F2FE" />
        <Path
          d="M24 14C20 17 18 21 18 25C18 28.3 20.7 31 24 31C27.3 31 30 28.3 30 25C30 21 28 17 24 14Z"
          fill="#0284C7"
        />
        <Path
          d="M24 16C23 18 22 20 22 22C22 23.1 22.9 24 24 24C25.1 24 26 23.1 26 22C26 20 25 18 24 16Z"
          fill="#38BDF8"
        />
      </Svg>
    ),
  },
  {
    number: 3,
    name: "Ovulation",
    color: "#FF9F1C",
    bgColor: "#FFFBEB",
    icon: (
      <Svg width={48} height={48} viewBox="0 0 48 48">
        <Circle cx={24} cy={24} r={20} fill="#FEF3C7" />
        <Circle cx={24} cy={24} r={9} fill="#F59E0B" />
        <Circle cx={24} cy={24} r={5} fill="#FDE68A" />
      </Svg>
    ),
  },
  {
    number: 4,
    name: "Luteal",
    color: "#9333EA",
    bgColor: "#FAF5FF",
    icon: (
      <Svg width={48} height={48} viewBox="0 0 48 48">
        <Circle cx={24} cy={24} r={20} fill="#F3E8FF" />
        <Path
          d="M27 15C22 15 18 19 18 24C18 29 22 33 27 33C29.2 33 31.2 32.2 32.8 30.9C28.4 30.3 25 26.5 25 21.9C25 17.3 28.4 13.5 32.8 12.9C31.2 11.6 29.2 11 27 11"
          fill="#9333EA"
        />
      </Svg>
    ),
  },
];

/**
 * Reusable Circular Cycle Ring with pink and amber arcs, knobs, and center content.
 */
function CycleRing({
  currentDay,
  cycleLength,
  periodLength,
  ovulationDay,
  size = 250,
  strokeWidth = 18,
}: {
  currentDay: number;
  cycleLength: number;
  periodLength: number;
  ovulationDay: number;
  size?: number;
  strokeWidth?: number;
}) {
  const center = size / 2;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;

  // Period arc (starts at -90 deg / top)
  const periodFraction = Math.min(Math.max(periodLength / cycleLength, 0), 1);
  const periodStrokeLength = periodFraction * circumference;
  const periodAngleRad = -Math.PI / 2 + periodFraction * 2 * Math.PI;
  const periodKnobX = center + r * Math.cos(periodAngleRad);
  const periodKnobY = center + r * Math.sin(periodAngleRad);

  // Ovulation arc (4 days window leading up to ovulation)
  const ovulationStartDay = Math.max(ovulationDay - 3, periodLength + 1);
  const ovulationDuration = 4;
  const ovulationStartFraction = ovulationStartDay / cycleLength;
  const ovulationFraction = ovulationDuration / cycleLength;
  const ovulationStrokeLength = ovulationFraction * circumference;
  const ovulationOffset = -ovulationStartFraction * circumference;
  const ovulationEndAngleRad =
    -Math.PI / 2 + (ovulationStartFraction + ovulationFraction) * 2 * Math.PI;
  const ovulationKnobX = center + r * Math.cos(ovulationEndAngleRad);
  const ovulationKnobY = center + r * Math.sin(ovulationEndAngleRad);

  const daysUntilOvulation = Math.max(ovulationDay - currentDay, 0);

  const getDaySuffix = (d: number) => {
    if (d >= 11 && d <= 13) return "th";
    switch (d % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        {/* 1. Track circle */}
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke="#ECEFF1"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* 2. Amber Ovulation Arc */}
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke="#FF9F1C"
          strokeWidth={strokeWidth}
          strokeDasharray={`${ovulationStrokeLength} ${circumference}`}
          strokeDashoffset={ovulationOffset}
          strokeLinecap="round"
          fill="none"
          origin={`${center}, ${center}`}
          rotation={-90}
        />

        {/* 3. Pink Period Arc */}
        <Circle
          cx={center}
          cy={center}
          r={r}
          stroke="#FF4D80"
          strokeWidth={strokeWidth}
          strokeDasharray={`${periodStrokeLength} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          fill="none"
          origin={`${center}, ${center}`}
          rotation={-90}
        />
      </Svg>

      {/* Period knob: white knob with pink border */}
      <View
        style={{
          position: "absolute",
          left: periodKnobX - 11,
          top: periodKnobY - 11,
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: colors.white,
          borderWidth: 3,
          borderColor: "#FF4D80",
        }}
      />

      {/* Ovulation knob: knob with small ovulation indicator */}
      <View
        style={{
          position: "absolute",
          left: ovulationKnobX - 11,
          top: ovulationKnobY - 11,
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: colors.white,
          borderWidth: 2,
          borderColor: "#FF9F1C",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 7,
            height: 7,
            borderRadius: 3.5,
            backgroundColor: "#FF9F1C",
          }}
        />
      </View>

      {/* Center Content Stack */}
      <View style={{ position: "absolute", alignItems: "center" }}>
        {/* Pink drop icon */}
        <DropIcon size={24} color="#FF4D80" />

        <View style={{ height: 4 }} />

        {/* "Period" label */}
        <AppText
          variant="label"
          color={colors.textSecondary}
          style={{ fontSize: 14, fontWeight: "500" }}
        >
          Period
        </AppText>

        <View style={{ height: 2 }} />

        {/* Large "4th" with small "days" beside it */}
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <AppText
            variant="screenTitle"
            style={{ fontSize: 44, lineHeight: 48, fontWeight: "700" }}
          >
            {currentDay}{getDaySuffix(currentDay)}
          </AppText>
          <View style={{ width: 4 }} />
          <AppText
            variant="label"
            color={colors.textSecondary}
            style={{ fontSize: 16, fontWeight: "500" }}
          >
            days
          </AppText>
        </View>

        <View style={{ height: 2 }} />

        {/* "Ovulation  11 days left" */}
        <AppText
          variant="caption"
          color={colors.textSecondary}
          style={{ fontSize: 13 }}
        >
          Ovulation  {daysUntilOvulation} days left
        </AppText>
      </View>
    </View>
  );
}

/**
 * Lunari Home Screen conforming strictly to the requested screen structure:
 * 1. Status bar area (system).
 * 2. Top App Bar: left circular pink logo icon, centered title "Lunari", right vertical 3-dot overflow menu.
 * 3. Cycle Card (white, radius.card, soft elevation): contains CycleRing, then pill-shaped "Edit Period" button.
 * 4. Phases Card (white, radius.card): header row with "Menstrual Cycle Phases" on the left and a pink right-arrow icon on the right,
 *    then a horizontally scrolling row of PhaseCard items (the third card is partially cut off to show it scrolls).
 * 5. Bottom Navigation Bar: provided by TabsLayout.
 */
export default function DashboardScreen({
  onEditPeriod,
  onSeeAllPhases,
  onPhasePress,
  onMenuPress,
}: DashboardScreenProps) {
  const { onboardingData } = useOnboarding();
  const today = new Date();
  const insets = useSafeAreaInsets();
  const paddingBottom = getTabBarContentPaddingBottom(insets.bottom);

  const avg = avgCycleLength(onboardingData) || 28;
  const cDay = cycleDay(onboardingData, today) || 4;
  const periodLen = onboardingData.periodLength || 5;
  const ovulationDay = Math.round(avg - 14) || 15;

  const handleEditPeriod = () => {
    if (onEditPeriod) {
      onEditPeriod();
    } else {
      Alert.alert("Edit Period", "Period log adjustment dialog");
    }
  };

  const handleSeeAllPhases = () => {
    if (onSeeAllPhases) {
      onSeeAllPhases();
    } else {
      Alert.alert("Cycle Phases", "Viewing all 4 cycle phases");
    }
  };

  const handleMenu = () => {
    if (onMenuPress) {
      onMenuPress();
    } else {
      Alert.alert("Lunari", "Settings & Preferences");
    }
  };

  return (
    <Screen
      scrollable
      paddingHorizontal
      backgroundColor="#F8F9FA"
      contentContainerStyle={{ paddingBottom }}
    >
      {/* 2. Top App Bar */}
      <View
        style={{
          height: 56,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginVertical: spacing.xs,
        }}
      >
        {/* Left: Circular pink logo icon */}
        <View
          style={{
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LunariLogo size={36} />
        </View>

        {/* Center: Title "Lunari" */}
        <AppText
          variant="screenTitle"
          align="center"
          style={{ fontSize: 20, fontWeight: "700" }}
        >
          Lunari
        </AppText>

        {/* Right: Vertical 3-dot overflow menu */}
        <Pressable
          onPress={handleMenu}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Menu"
          style={{
            width: 48,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MoreVertIcon size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={{ height: spacing.sm }} />

      {/* 3. Cycle Card (white, radius.card, soft elevation) */}
      <View style={styles.cardContainer}>
        {/* Cycle Ring */}
        <CycleRing
          currentDay={cDay}
          cycleLength={avg}
          periodLength={periodLen}
          ovulationDay={ovulationDay}
        />

        <View style={{ height: spacing.xl }} />

        {/* Pill-shaped "Edit Period" button (primary fill, onPrimary text) */}
        <Button
          label="Edit Period"
          shape="pill"
          variant="primary"
          onPress={handleEditPeriod}
          className="self-center px-8"
        />
      </View>

      <View style={{ height: spacing.lg }} />

      {/* 4. Phases Card (white, radius.card, soft elevation) */}
      <View style={styles.cardContainer}>
        {/* Header Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: spacing.md,
          }}
        >
          <AppText
            variant="cardTitle"
            style={{ fontSize: 18, fontWeight: "700" }}
          >
            Menstrual Cycle Phases
          </AppText>

          <Pressable
            onPress={handleSeeAllPhases}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="View cycle phases"
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronRightIcon size={22} color="#FF4D80" />
          </Pressable>
        </View>

        {/* Horizontally scrolling row of PhaseCard items */}
        {/* The 3rd card is partially cut off to show it scrolls */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: spacing.sm, gap: spacing.md }}
        >
          {PHASES.map((phase, idx) => (
            <Pressable
              key={phase.number}
              onPress={() => (onPhasePress ? onPhasePress(idx) : null)}
              style={{
                width: 148,
                height: 160,
                borderRadius: 12,
                backgroundColor: phase.bgColor,
                padding: spacing.md,
                justifyContent: "space-between",
              }}
            >
              {/* Badge + Phase Name */}
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: phase.color,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <AppText
                    variant="caption"
                    color={colors.white}
                    style={{ fontSize: 12, fontWeight: "700" }}
                  >
                    {phase.number}
                  </AppText>
                </View>

                <View style={{ width: spacing.sm }} />

                <AppText
                  variant="label"
                  style={{ fontSize: 14, fontWeight: "600" }}
                  numberOfLines={1}
                >
                  {phase.name}
                </AppText>
              </View>

              {/* Centered Illustration */}
              <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
                {phase.icon}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={{ height: spacing.xl }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.lg,
    // Very soft card shadow (elevation.card)
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
});

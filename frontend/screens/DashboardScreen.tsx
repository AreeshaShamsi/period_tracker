import React from "react";
import { Pressable, View } from "react-native";
import { colors } from "@/theme/colors";
import { radius } from "@/theme/radius";
import { spacing } from "@/theme/spacing";
import { useOnboarding } from "@/state/OnboardingContext";
import {
  CheckIcon,
  DropIcon,
  MoodIcon,
  NoteIcon,
  SymptomsIcon,
} from "@/components/icons";
import {
  AppText,
  Card,
  CircularProgress,
  Screen,
  SectionTitle,
} from "@/components/ui";
import {
  avgCycleLength,
  cycleDay,
  fertileWindow,
  getPhase,
  getStats,
  nextPeriod,
} from "@/utils/cycle";
import { formatShortDate, toISO } from "@/utils/date";

export interface DashboardScreenProps {
  onProfile?: () => void;
  onQuickLog?: (type: string) => void;
}

const PHASE_DESCRIPTIONS: Record<string, string> = {
  menstrual:
    "Your period is here. Rest, stay hydrated and be gentle with yourself.",
  follicular:
    "Energy is rising as your body prepares for ovulation. A great time to try new things.",
  ovulation:
    "You are in your ovulation window. Energy and mood are usually at their peak.",
  luteal:
    "Hormones are shifting. You may feel more tired or sensitive, so slow down and look after yourself.",
};

export default function DashboardScreen({
  onProfile,
  onQuickLog,
}: DashboardScreenProps) {
  const { onboardingData, userLogs, togglePeriodLog } = useOnboarding();
  const today = new Date();

  const handleProfile = () => {
    if (onProfile) onProfile();
    else console.log("Profile clicked");
  };

  const handleQuickLog = (type: string) => {
    if (type === "period") {
      togglePeriodLog(toISO(today));
    }
    if (onQuickLog) onQuickLog(type);
    else console.log("Quick log clicked:", type);
  };

  // Derived cycle numbers
  const avg = avgCycleLength(onboardingData);
  const cDay = cycleDay(onboardingData, today);
  const phaseName = getPhase(cDay, onboardingData.periodLength, avg);
  const np = nextPeriod(onboardingData, today);
  const fertile = fertileWindow(onboardingData, today);
  const cycleStats = getStats(onboardingData, userLogs);

  const firstName = onboardingData.name
    ? onboardingData.name.trim().split(" ")[0]
    : "User";

  const hour = today.getHours();
  const greeting =
    hour < 12
      ? "Good morning,"
      : hour < 18
      ? "Good afternoon,"
      : "Good evening,";

  const phaseCapitalized =
    phaseName.charAt(0).toUpperCase() + phaseName.slice(1);

  // Next Period Text formatting
  let nextPeriodDaysText = "";
  if (np.isLate) {
    nextPeriodDaysText = `${np.daysLate} ${np.daysLate === 1 ? "day" : "days"} late`;
  } else if (np.daysUntil === 0) {
    nextPeriodDaysText = "Today";
  } else if (np.daysUntil === 1) {
    nextPeriodDaysText = "Tomorrow";
  } else {
    if (onboardingData.cycleType === "irregular" && np.minDaysUntil !== undefined && np.maxDaysUntil !== undefined) {
      nextPeriodDaysText = `in ${np.minDaysUntil}–${np.maxDaysUntil} days`;
    } else {
      nextPeriodDaysText = `in ${np.daysUntil} days`;
    }
  }

  let nextPeriodDateText = formatShortDate(np.date);
  if (onboardingData.cycleType === "irregular" && np.minDate && np.maxDate) {
    nextPeriodDateText = `${formatShortDate(np.minDate)} – ${formatShortDate(np.maxDate)}`;
  }

  const isPeriodLoggedToday = userLogs.periodDays.includes(toISO(today));

  const phasesList = ["menstrual", "follicular", "ovulation", "luteal"];

  return (
    <Screen
      scrollable
      paddingHorizontal
      backgroundColor={colors.white}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
    >
      {/* 1. HEADER ROW */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: spacing.sm,
        }}
      >
        <View>
          <AppText variant="small">{greeting}</AppText>
          <AppText
            variant="screenTitle"
            align="left"
            style={{ fontSize: 24, lineHeight: 30 }}
          >
            {firstName}
          </AppText>
        </View>

        <Pressable
          onPress={handleProfile}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Profile"
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AppText
            variant="cardTitle"
            color={colors.primary}
            weight="700"
            style={{ fontSize: 18, lineHeight: 22 }}
          >
            {firstName.charAt(0).toUpperCase()}
          </AppText>
        </Pressable>
      </View>

      <View style={{ height: spacing.xl }} />

      {/* 2. HERO CARD */}
      <View
        style={{
          backgroundColor: colors.primary,
          borderRadius: 24,
          padding: spacing.xl,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Circular Progress (Cycle Day) */}
          <CircularProgress
            size={116}
            strokeWidth={10}
            trackColor={colors.whiteAlpha30}
            progressColor={colors.white}
            progress={Math.min(cDay / avg, 1)}
          >
            <AppText variant="small" color={colors.white}>
              Cycle day
            </AppText>
            <AppText
              variant="percent"
              color={colors.white}
              style={{ fontSize: 32, lineHeight: 38 }}
            >
              {cDay}
            </AppText>
          </CircularProgress>

          <View style={{ width: spacing.xl }} />

          {/* Next Period Info */}
          <View style={{ flex: 1 }}>
            <AppText variant="small" color={colors.whiteAlpha85}>
              Next period
            </AppText>
            <AppText
              variant="cardTitle"
              color={colors.white}
              weight="700"
              style={{ fontSize: 24, lineHeight: 30 }}
            >
              {nextPeriodDaysText}
            </AppText>
            <AppText
              variant="small"
              color={colors.white}
              style={{ opacity: 0.9, marginTop: spacing.xs }}
            >
              {nextPeriodDateText}
            </AppText>
          </View>
        </View>

        <View style={{ height: spacing.lg }} />

        {/* Phase Pill */}
        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              backgroundColor: colors.whiteAlpha20,
              paddingHorizontal: spacing.md,
              height: 28,
              borderRadius: 999,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <AppText
              variant="small"
              color={colors.white}
              weight="600"
              style={{ fontSize: 12, lineHeight: 16 }}
            >
              {phaseCapitalized} phase
            </AppText>
          </View>
        </View>
      </View>

      <View style={{ height: spacing.xl }} />

      {/* 3. CURRENT CYCLE INFORMATION */}
      <SectionTitle>Current cycle</SectionTitle>
      <View style={{ height: spacing.md }} />

      <Card>
        {/* Phase Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: colors.primary,
              }}
            />
            <AppText variant="cardTitle">{phaseCapitalized}</AppText>
          </View>
          <AppText variant="small">
            Day {cDay} of {avg}
          </AppText>
        </View>

        <View style={{ height: spacing.md }} />

        {/* 4-Segment Phase Bar */}
        <View style={{ flexDirection: "row", gap: spacing.xs }}>
          {phasesList.map((p) => (
            <View
              key={p}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 999,
                backgroundColor:
                  p === phaseName ? colors.primary : colors.track,
              }}
            />
          ))}
        </View>

        <View style={{ height: spacing.md }} />

        {/* Phase Description */}
        <AppText variant="body" color={colors.textSecondary} style={{ fontSize: 14 }}>
          {PHASE_DESCRIPTIONS[phaseName]}
        </AppText>

        <View style={{ height: spacing.md }} />
        <View style={{ height: 1, backgroundColor: colors.separator }} />
        <View style={{ height: spacing.md }} />

        {/* Info Rows */}
        <View style={{ gap: spacing.xs }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <AppText variant="small">Fertile window</AppText>
            <AppText variant="label">
              {formatShortDate(fertile.startDate)} – {formatShortDate(fertile.endDate)}
            </AppText>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <AppText variant="small">Estimated ovulation</AppText>
            <AppText variant="label">
              {formatShortDate(fertile.ovulationDate)}
            </AppText>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <AppText variant="small">Period length</AppText>
            <AppText variant="label">
              {onboardingData.periodLength || 4} days
            </AppText>
          </View>
        </View>
      </Card>

      <View style={{ height: spacing.xl }} />

      {/* 4. QUICK LOGGING ACTIONS */}
      <SectionTitle>Quick log</SectionTitle>
      <View style={{ height: spacing.md }} />

      <View style={{ flexDirection: "row", gap: spacing.md }}>
        {/* Tile 1: Period */}
        <Pressable
          onPress={() => handleQuickLog("period")}
          style={{
            flex: 1,
            height: 88,
            borderRadius: radius.tile,
            backgroundColor: isPeriodLoggedToday
              ? colors.primary
              : colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isPeriodLoggedToday ? (
            <CheckIcon size={24} color={colors.white} />
          ) : (
            <DropIcon size={24} color={colors.primary} />
          )}
          <View style={{ height: spacing.xs }} />
          <AppText
            variant="small"
            color={isPeriodLoggedToday ? colors.white : colors.textPrimary}
            weight="500"
          >
            {isPeriodLoggedToday ? "Logged" : "Period"}
          </AppText>
        </Pressable>

        {/* Tile 2: Symptoms */}
        <Pressable
          onPress={() => handleQuickLog("symptoms")}
          style={{
            flex: 1,
            height: 88,
            borderRadius: radius.tile,
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SymptomsIcon size={24} color={colors.primary} />
          <View style={{ height: spacing.xs }} />
          <AppText variant="small" color={colors.textPrimary} weight="500">
            Symptoms
          </AppText>
        </Pressable>

        {/* Tile 3: Mood */}
        <Pressable
          onPress={() => handleQuickLog("mood")}
          style={{
            flex: 1,
            height: 88,
            borderRadius: radius.tile,
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MoodIcon size={24} color={colors.primary} />
          <View style={{ height: spacing.xs }} />
          <AppText variant="small" color={colors.textPrimary} weight="500">
            Mood
          </AppText>
        </Pressable>

        {/* Tile 4: Notes */}
        <Pressable
          onPress={() => handleQuickLog("notes")}
          style={{
            flex: 1,
            height: 88,
            borderRadius: radius.tile,
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <NoteIcon size={24} color={colors.primary} />
          <View style={{ height: spacing.xs }} />
          <AppText variant="small" color={colors.textPrimary} weight="500">
            Notes
          </AppText>
        </Pressable>
      </View>

      <View style={{ height: spacing.xl }} />

      {/* 5. BASIC CYCLE STATISTICS */}
      <SectionTitle>Your stats</SectionTitle>
      <View style={{ height: spacing.md }} />

      <View style={{ flexDirection: "row", gap: spacing.md }}>
        {/* Stat 1: Avg cycle */}
        <View style={{ flex: 1 }}>
          <Card style={{ padding: 14 }}>
            <AppText
              variant="statValue"
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {cycleStats.avgCycle} days
            </AppText>
            <View style={{ height: spacing.xs }} />
            <AppText variant="small">Avg. cycle</AppText>
          </Card>
        </View>

        {/* Stat 2: Avg period */}
        <View style={{ flex: 1 }}>
          <Card style={{ padding: 14 }}>
            <AppText
              variant="statValue"
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {cycleStats.avgPeriod} days
            </AppText>
            <View style={{ height: spacing.xs }} />
            <AppText variant="small">Avg. period</AppText>
          </Card>
        </View>

        {/* Stat 3: Cycles tracked */}
        <View style={{ flex: 1 }}>
          <Card style={{ padding: 14 }}>
            <AppText
              variant="statValue"
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {cycleStats.cyclesTracked}
            </AppText>
            <View style={{ height: spacing.xs }} />
            <AppText variant="small">Cycles tracked</AppText>
          </Card>
        </View>
      </View>
    </Screen>
  );
}

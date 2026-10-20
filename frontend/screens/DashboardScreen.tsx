import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Href, useRouter } from "expo-router";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { useOnboarding } from "@/state/OnboardingContext";
import { Screen } from "@/components/ui";
import { avgCycleLength, cycleDay, getPhase } from "@/utils/cycle";
import { generateDayStripItems, formatPhaseName } from "@/utils/dashboardHelpers";
import { getDefaultRecommendations } from "@/utils/defaultRecommendations";
import {
  HeaderSection,
  DayStrip,
  CycleCard,
  LogSymptomsButton,
  RecommendationSection,
  MoodSection,
} from "@/components/dashboard";

export interface DashboardScreenProps {
  onProfile?: () => void;
  onLogSymptoms?: () => void;
  onSeeAllRecommendations?: () => void;
  onQuickLog?: (type: string) => void;
}

export default function DashboardScreen({
  onProfile,
  onLogSymptoms,
  onSeeAllRecommendations,
}: DashboardScreenProps) {
  const router = useRouter();
  const { onboardingData } = useOnboarding();
  const [selectedMoodId, setSelectedMoodId] = useState<string>("happy");
  const today = useMemo(() => new Date(), []);

  const avg = avgCycleLength(onboardingData) || 28;
  const cDay = cycleDay(onboardingData, today) || 12;
  const pLen = onboardingData.periodLength || 5;
  const oDay = Math.round(avg - 14) || 14;
  const phaseTitle = formatPhaseName(getPhase(cDay, pLen, avg) || "follicular");
  const userName = onboardingData.name?.trim().split(" ")[0] || "Areesha";

  const { items: dayItems, currentIndex } = useMemo(
    () => generateDayStripItems(today),
    [today]
  );

  const handleProfileNavigation = () =>
    onProfile ? onProfile() : router.push("/profile");

  const handleSymptomsNavigation = () =>
    onLogSymptoms ? onLogSymptoms() : Alert.alert("Log Symptoms", "Symptom tracking screen opened.");

  const handleSeeAllRecs = () =>
    onSeeAllRecommendations ? onSeeAllRecommendations() : Alert.alert("Recommendations", "Viewing guides.");

  const recommendationItems = useMemo(
    () =>
      getDefaultRecommendations(
        () => Alert.alert("Nutrition Guide", "Magnesium and hydration tips."),
        () => Alert.alert("Activity Guide", "Light yoga and restorative walks.")
      ),
    []
  );

  return (
    <Screen
      scrollable
      paddingHorizontal
      backgroundColor={colors.background.secondary}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.sectionSpacing}>
        <HeaderSection userName={userName} onAvatarPress={handleProfileNavigation} />
      </View>
      <DayStrip days={dayItems} currentDayIndex={currentIndex} />
      <View style={styles.sectionSpacing}>
        <CycleCard
          currentDay={cDay}
          cycleLength={avg}
          periodLength={pLen}
          ovulationDay={oDay}
          currentPhaseName={phaseTitle}
        />
        <LogSymptomsButton onPress={handleSymptomsNavigation} />
        <RecommendationSection items={recommendationItems} onSeeAllPress={handleSeeAllRecs} />
        <MoodSection selectedMoodId={selectedMoodId} onSelectMood={setSelectedMoodId} />
        <View style={styles.bottomSpacer} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  contentContainer: { paddingTop: spacing.xs },
  sectionSpacing: { paddingHorizontal: spacing.xs },
  bottomSpacer: { height: 104 },
});

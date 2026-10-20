import React, { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { useOnboarding } from "@/state/OnboardingContext";
import { addDays, daysInMonth, parseISO, toISO } from "@/utils/date";
import {
  AppText,
  BigTextInput,
  Button,
  CalendarMonth,
  OnboardingHeader,
  Screen,
  SegmentedChips,
  WheelRow,
} from "@/components/ui";

export interface OnboardingFlowProps {
  onBackToAccount: () => void;
  onFinishOnboarding: () => void;
}

type StepId = "name" | "birthday" | "periodLength" | "cycleLength" | "lastPeriod";

interface StepConfig {
  id: StepId;
  number: number;
}

const STEPS: StepConfig[] = [
  { id: "name", number: 1 },
  { id: "birthday", number: 2 },
  { id: "periodLength", number: 5 },
  { id: "cycleLength", number: 6 },
  { id: "lastPeriod", number: 7 },
];

export default function OnboardingFlow({
  onBackToAccount,
  onFinishOnboarding,
}: OnboardingFlowProps) {
  const { onboardingData, setField, setOnboardingData } = useOnboarding();

  // Smartly resume on the unfinished step if onboarding is in progress
  const initialStep = React.useMemo(() => {
    if (
      typeof onboardingData.step === "number" &&
      onboardingData.step >= 0 &&
      onboardingData.step < STEPS.length
    ) {
      return onboardingData.step;
    }
    if (!onboardingData.name || onboardingData.name.trim() === "") {
      return 0;
    }
    return 1;
  }, [onboardingData.step, onboardingData.name]);

  const [stepIndex, setStepIndex] = useState(initialStep);

  const goToStep = (nextIdx: number) => {
    setStepIndex(nextIdx);
    setField("step", nextIdx);
  };

  const currentStep = STEPS[stepIndex];
  const currentYear = new Date().getFullYear();

  // Local state initialized from context
  const [name, setName] = useState(onboardingData.name || "");
  const [bMonth, setBMonth] = useState(onboardingData.birthday.month || 12);
  const [bDay, setBDay] = useState(onboardingData.birthday.day || 25);
  const [bYear, setBYear] = useState(onboardingData.birthday.year || 1995);

  const [periodLen, setPeriodLen] = useState(onboardingData.periodLength || 4);

  const [cycleType, setCycleType] = useState<"regular" | "irregular">(
    onboardingData.cycleType || "regular"
  );
  const [cycleLen, setCycleLen] = useState(onboardingData.cycleLength || 28);
  const [cycleMin, setCycleMin] = useState(onboardingData.cycleLengthMin || 26);
  const [cycleMax, setCycleMax] = useState(onboardingData.cycleLengthMax || 28);

  const [selectedCalendarDays, setSelectedCalendarDays] = useState<Set<string>>(
    new Set(onboardingData.lastPeriodDays || [])
  );

  const calendarScrollViewRef = useRef<ScrollView>(null);

  // Wheel Data Helpers
  const monthsData = Array.from({ length: 12 }, (_, i) => ({
    label: String(i + 1).padStart(2, "0"),
    value: i + 1,
  }));

  const maxDaysInBMonth = daysInMonth(bYear, bMonth);
  const daysData = Array.from({ length: maxDaysInBMonth }, (_, i) => ({
    label: String(i + 1).padStart(2, "0"),
    value: i + 1,
  }));

  const yearsData = Array.from(
    { length: 51 },
    (_, i) => currentYear - 60 + i
  ).map((y) => ({ label: String(y), value: y }));

  const periodLengthData = Array.from({ length: 10 }, (_, i) => ({
    label: String(i + 1),
    value: i + 1,
  }));

  const regularCycleData = Array.from({ length: 25 }, (_, i) => ({
    label: String(i + 21),
    value: i + 21,
  }));

  const minCycleData = Array.from({ length: 25 }, (_, i) => ({
    label: String(i + 21),
    value: i + 21,
  }));

  const maxCycleData = Array.from({ length: 25 }, (_, i) => ({
    label: String(i + 21),
    value: i + 21,
  }));

  // Handle Birthday Month/Year changes clamping Day
  const handleMonthChange = (idx: number) => {
    const newM = idx + 1;
    setBMonth(newM);
    const maxD = daysInMonth(bYear, newM);
    if (bDay > maxD) setBDay(maxD);
  };

  const handleYearChange = (idx: number) => {
    const newY = currentYear - 60 + idx;
    setBYear(newY);
    const maxD = daysInMonth(newY, bMonth);
    if (bDay > maxD) setBDay(maxD);
  };

  const handleDayChange = (idx: number) => {
    setBDay(idx + 1);
  };

  // Handle Irregular cycle min/max clamping
  const handleMinChange = (idx: number) => {
    const val = 21 + idx;
    setCycleMin(val);
    if (val > cycleMax) {
      setCycleMax(val);
    }
  };

  const handleMaxChange = (idx: number) => {
    const val = 21 + idx;
    setCycleMax(val);
    if (val < cycleMin) {
      setCycleMin(val);
    }
  };

  // Calendar Day Selection Logic
  const today = new Date();
  const handleCalendarDayToggle = (isoStr: string) => {
    const isoArr = Array.from(selectedCalendarDays);
    if (isoArr.length > 0 && isoArr[0] === isoStr) {
      // Clear selection
      setSelectedCalendarDays(new Set());
      return;
    }

    // Select starting at isoStr for periodLen days (clamped to today)
    const startDate = parseISO(isoStr);
    const newSelected = new Set<string>();
    const todayISO = toISO(today);

    for (let i = 0; i < periodLen; i++) {
      const d = addDays(startDate, i);
      const iso = toISO(d);
      if (iso <= todayISO) {
        newSelected.add(iso);
      }
    }
    setSelectedCalendarDays(newSelected);
  };

  // Back Navigation
  const handleBack = () => {
    if (stepIndex === 0) {
      onBackToAccount();
    } else {
      goToStep(stepIndex - 1);
    }
  };

  // Continue / Finish Button Handler
  const handleContinue = async () => {
    if (currentStep.id === "name") {
      const trimmed = name.trim();
      setField("name", trimmed);
      goToStep(1);
    } else if (currentStep.id === "birthday") {
      setField("birthday", { month: bMonth, day: bDay, year: bYear });
      goToStep(2); // Goes to step 5 (periodLength)
    } else if (currentStep.id === "periodLength") {
      setField("periodLength", periodLen);
      goToStep(3); // Goes to step 6 (cycleLength)
    } else if (currentStep.id === "cycleLength") {
      setField("cycleType", cycleType);
      setField("cycleLength", cycleLen);
      setField("cycleLengthMin", cycleMin);
      setField("cycleLengthMax", cycleMax);
      goToStep(4); // Goes to step 7 (lastPeriod)
    } else if (currentStep.id === "lastPeriod") {
      const sortedDays = Array.from(selectedCalendarDays).sort();
      const updatedData = {
        ...onboardingData,
        name: name.trim(),
        birthday: { month: bMonth, day: bDay, year: bYear },
        periodLength: periodLen,
        cycleType,
        cycleLength: cycleLen,
        cycleLengthMin: cycleMin,
        cycleLengthMax: cycleMax,
        lastPeriodDays: sortedDays,
        step: 4,
      };
      await setOnboardingData(updatedData);
      onFinishOnboarding();
    }
  };

  // Last 3 Months for Step 7 Calendar
  const monthsForCalendar = [
    { year: today.getFullYear(), month: today.getMonth() - 1 }, // 2 months ago
    { year: today.getFullYear(), month: today.getMonth() },     // Previous month
    { year: today.getFullYear(), month: today.getMonth() + 1 }, // Current month
  ].map(({ year, month }) => {
    let y = year;
    let m = month;
    if (m < 1) {
      m += 12;
      y -= 1;
    } else if (m > 12) {
      m -= 12;
      y += 1;
    }
    return { year: y, month: m };
  });

  return (
    <Screen scrollable={false} paddingHorizontal backgroundColor={colors.white}>
      <OnboardingHeader
        step={currentStep.number}
        total={7}
        onBack={handleBack}
      />

      <View style={{ height: spacing.xl }} />

      {/* Screen Title */}
      <View style={{ paddingHorizontal: spacing.lg }}>
        {currentStep.id === "name" && (
          <AppText variant="screenTitle">What{"'"}s your name?</AppText>
        )}
        {currentStep.id === "birthday" && (
          <AppText variant="screenTitle">When is your birthday?</AppText>
        )}
        {currentStep.id === "periodLength" && (
          <AppText variant="screenTitle">
            How long does your period{"\n"}usually last?
          </AppText>
        )}
        {currentStep.id === "cycleLength" && (
          <AppText variant="screenTitle">
            How long does your cycle{"\n"}usually last?
          </AppText>
        )}
        {currentStep.id === "lastPeriod" && (
          <AppText variant="screenTitle">
            When did your last period{"\n"}start?
          </AppText>
        )}
      </View>

      {/* Step Content Area */}
      {currentStep.id === "name" && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, justifyContent: "center" }}
        >
          <BigTextInput
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            autoFocus
          />
        </KeyboardAvoidingView>
      )}

      {currentStep.id === "birthday" && (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <WheelRow
            columns={[
              {
                header: "Month",
                data: monthsData,
                selectedIndex: bMonth - 1,
                onChange: handleMonthChange,
                loop: true,
              },
              {
                header: "Day",
                data: daysData,
                selectedIndex: Math.min(bDay - 1, daysData.length - 1),
                onChange: handleDayChange,
                loop: false,
              },
              {
                header: "Year",
                data: yearsData,
                selectedIndex: yearsData.findIndex((y) => y.value === bYear),
                onChange: handleYearChange,
                loop: false,
              },
            ]}
          />
        </View>
      )}

      {currentStep.id === "periodLength" && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <WheelRow
            columns={[
              {
                data: periodLengthData,
                selectedIndex: periodLen - 1,
                onChange: (idx) => setPeriodLen(idx + 1),
                unit: "days",
              },
            ]}
          />
        </View>
      )}

      {currentStep.id === "cycleLength" && (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <View style={{ marginBottom: spacing.lg }}>
            <SegmentedChips
              options={[
                { label: "Regular", value: "regular" },
                { label: "Irregular", value: "irregular" },
              ]}
              value={cycleType}
              onChange={(v) => setCycleType(v as "regular" | "irregular")}
            />
          </View>

          <View style={{ height: spacing.lg }} />

          {cycleType === "regular" ? (
            <WheelRow
              columns={[
                {
                  data: regularCycleData,
                  selectedIndex: cycleLen - 21,
                  onChange: (idx) => setCycleLen(21 + idx),
                  unit: "days",
                },
              ]}
            />
          ) : (
            <WheelRow
              separator={
                <AppText variant="wheelSelected" style={{ marginHorizontal: 4 }}>
                  -
                </AppText>
              }
              columns={[
                {
                  data: minCycleData,
                  selectedIndex: cycleMin - 21,
                  onChange: handleMinChange,
                },
                {
                  data: maxCycleData,
                  selectedIndex: cycleMax - 21,
                  onChange: handleMaxChange,
                  unit: "days",
                },
              ]}
            />
          )}
        </View>
      )}

      {currentStep.id === "lastPeriod" && (
        <View style={{ flex: 1, marginVertical: spacing.md }}>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.inputBg,
              borderRadius: 14,
              padding: spacing.xs,
            }}
          >
            <ScrollView
              ref={calendarScrollViewRef}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => {
                // Initial scroll to position previous month at top
                calendarScrollViewRef.current?.scrollTo({
                  y: 180,
                  animated: false,
                });
              }}
            >
              {monthsForCalendar.map(({ year, month }) => (
                <CalendarMonth
                  key={`${year}-${month}`}
                  year={year}
                  month={month}
                  selectedDays={selectedCalendarDays}
                  onToggle={handleCalendarDayToggle}
                  maxDate={today}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Bottom Button */}
      <View style={{ marginBottom: spacing.xl, marginTop: spacing.md, width: "100%", alignSelf: "stretch" }}>
        <Button
          variant="primary"
          shape="pill"
          label={currentStep.id === "lastPeriod" ? "Finish" : "Continue"}
          onPress={handleContinue}
          disabled={
            (currentStep.id === "name" && !name.trim()) ||
            (currentStep.id === "lastPeriod" && selectedCalendarDays.size === 0)
          }
        />
      </View>
    </Screen>
  );
}

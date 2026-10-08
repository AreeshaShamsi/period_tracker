import AsyncStorage from "@react-native-async-storage/async-storage";
import { OnboardingData, UserLogs } from "@/types/onboarding";

const ONBOARDING_KEY = "@lunari_onboarding_data";
const LOGS_KEY = "@lunari_user_logs";

export async function saveOnboarding(data: OnboardingData): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving onboarding data:", error);
  }
}

export async function loadOnboarding(): Promise<OnboardingData | null> {
  try {
    const json = await AsyncStorage.getItem(ONBOARDING_KEY);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error("Error loading onboarding data:", error);
    return null;
  }
}

export async function saveLogs(logs: UserLogs): Promise<void> {
  try {
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error("Error saving user logs:", error);
  }
}

export async function loadLogs(): Promise<UserLogs | null> {
  try {
    const json = await AsyncStorage.getItem(LOGS_KEY);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error("Error loading user logs:", error);
    return null;
  }
}

export async function clearStorage(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([ONBOARDING_KEY, LOGS_KEY]);
  } catch (error) {
    console.error("Error clearing storage:", error);
  }
}

import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { OnboardingData, UserLogs } from "@/types/onboarding";
import { AuthUser } from "@/types/auth";

const ONBOARDING_KEY = "@lunari_onboarding_data";
const LOGS_KEY = "@lunari_user_logs";
const AUTH_TOKEN_KEY = "lunari_auth_token";
const AUTH_USER_KEY = "@lunari_auth_user";

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

export async function saveAuthToken(token: string): Promise<void> {
  try {
    if (Platform.OS !== "web") {
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
    } else {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    }
  } catch (error) {
    console.error("Error saving auth token to secure storage:", error);
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch {}
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    if (Platform.OS !== "web") {
      const secureToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (secureToken) return secureToken;
    }
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error("Error loading auth token:", error);
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return null;
    }
  }
}

export async function clearAuthToken(): Promise<void> {
  try {
    if (Platform.OS !== "web") {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY).catch(() => {});
    }
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error("Error clearing auth token:", error);
  }
}

export async function saveAuthUser(user: AuthUser): Promise<void> {
  try {
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Error saving auth user:", error);
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const json = await AsyncStorage.getItem(AUTH_USER_KEY);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error("Error loading auth user:", error);
    return null;
  }
}

export async function clearAuthUser(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AUTH_USER_KEY);
  } catch (error) {
    console.error("Error clearing auth user:", error);
  }
}

export async function clearStorage(): Promise<void> {
  try {
    if (Platform.OS !== "web") {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY).catch(() => {});
    }
    await AsyncStorage.multiRemove([
      ONBOARDING_KEY,
      LOGS_KEY,
      AUTH_TOKEN_KEY,
      AUTH_USER_KEY,
    ]);
  } catch (error) {
    console.error("Error clearing storage:", error);
  }
}

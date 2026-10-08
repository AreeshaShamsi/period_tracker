import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";

export type IconName =
  | "home"
  | "calendar"
  | "stats"
  | "profile"
  | "settings"
  | "back"
  | "close"
  | "chevronRight"
  | "chevronDown"
  | "check"
  | "heart"
  | "period"
  | "symptoms"
  | "mood"
  | "notes"
  | "notification"
  | "privacy"
  | "help"
  | "logout"
  | "email"
  | "lock"
  | "eye"
  | "apple"
  | "google";

export const iconMap: Record<IconName, keyof typeof Ionicons.glyphMap> = {
  home: "home-outline",
  calendar: "calendar-outline",
  stats: "bar-chart-outline",
  profile: "person-outline",
  settings: "settings-outline",
  back: "chevron-back-outline",
  close: "close-outline",
  chevronRight: "chevron-forward-outline",
  chevronDown: "chevron-down-outline",
  check: "checkmark-outline",
  heart: "heart-outline",
  period: "water-outline",
  symptoms: "pulse-outline",
  mood: "happy-outline",
  notes: "document-text-outline",
  notification: "notifications-outline",
  privacy: "shield-checkmark-outline",
  help: "help-circle-outline",
  logout: "log-out-outline",
  email: "mail-outline",
  lock: "lock-closed-outline",
  eye: "eye-outline",
  apple: "logo-apple",
  google: "logo-google",
};

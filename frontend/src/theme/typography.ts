import { TextStyle } from "react-native";
import { colors } from "./colors";

export type TypographyVariant =
  | "screenTitle"
  | "counter"
  | "wheelLabel"
  | "wheelSelected"
  | "wheelNear"
  | "wheelMid"
  | "wheelFar"
  | "unitLabel"
  | "bigInput"
  | "chip"
  | "calendarMonth"
  | "calendarWeek"
  | "calendarDay"
  | "percent"
  | "sectionTitle"
  | "statValue"
  | "cardTitle"
  | "small"
  | "heading"
  | "body"
  | "label"
  | "inputText"
  | "bodySmall"
  | "title"
  | "subtitle"
  | "button"
  | "caption"
  | "link"
  | "footer"
  | "largeTitle"
  | "title1"
  | "title2"
  | "title3"
  | "headline"
  | "callout"
  | "subheadline"
  | "footnote"
  | "caption2"
  | "tabLabel"
  | "tabLabelActive";

export const POPPINS_FONTS = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
} as const;

export function getFontFamilyForWeight(weight?: TextStyle["fontWeight"]): string {
  if (!weight) return POPPINS_FONTS.regular;
  const wStr = String(weight).toLowerCase();
  if (wStr === "700" || wStr === "bold" || wStr === "800" || wStr === "900") {
    return POPPINS_FONTS.bold;
  }
  if (wStr === "600" || wStr === "semibold") {
    return POPPINS_FONTS.semibold;
  }
  if (wStr === "500" || wStr === "medium") {
    return POPPINS_FONTS.medium;
  }
  return POPPINS_FONTS.regular;
}

export const typography: Record<TypographyVariant, TextStyle> = {
  screenTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: POPPINS_FONTS.bold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  counter: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: POPPINS_FONTS.medium,
    color: colors.textPrimary,
  },
  wheelLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textSecondary,
    textAlign: "center",
  },
  wheelSelected: {
    fontSize: 34,
    lineHeight: 40,
    fontFamily: POPPINS_FONTS.bold,
    color: colors.primary,
    textAlign: "center",
  },
  wheelNear: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: POPPINS_FONTS.bold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  wheelMid: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textPrimary,
    textAlign: "center",
  },
  wheelFar: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textSecondary,
    textAlign: "center",
  },
  unitLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textSecondary,
  },
  bigInput: {
    fontSize: 30,
    lineHeight: 38,
    fontFamily: POPPINS_FONTS.medium,
    color: colors.textPrimary,
    textAlign: "center",
  },
  chip: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: POPPINS_FONTS.semibold,
  },
  calendarMonth: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: POPPINS_FONTS.semibold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  calendarWeek: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: POPPINS_FONTS.medium,
    color: colors.textSecondary,
    textAlign: "center",
  },
  calendarDay: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: POPPINS_FONTS.semibold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  percent: {
    fontSize: 44,
    lineHeight: 52,
    fontFamily: POPPINS_FONTS.bold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: POPPINS_FONTS.bold,
    color: colors.textPrimary,
  },
  statValue: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: POPPINS_FONTS.bold,
    color: colors.primary,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: POPPINS_FONTS.semibold,
    color: colors.textPrimary,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textSecondary,
  },

  heading: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: POPPINS_FONTS.bold,
    color: colors.textPrimary,
    textAlign: "left",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textSecondary,
    textAlign: "left",
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: POPPINS_FONTS.medium,
    color: colors.textPrimary,
  },
  inputText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textPrimary,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textPrimary,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: POPPINS_FONTS.bold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textSecondary,
    textAlign: "center",
  },
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: POPPINS_FONTS.semibold,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textSecondary,
    textAlign: "center",
  },
  link: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: POPPINS_FONTS.semibold,
    color: colors.primary,
  },
  footer: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textSecondary,
  },
  largeTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: POPPINS_FONTS.bold,
    color: colors.textPrimary,
  },
  title1: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: POPPINS_FONTS.bold,
    color: colors.textPrimary,
  },
  title2: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: POPPINS_FONTS.bold,
    color: colors.textPrimary,
  },
  title3: {
    fontSize: 18,
    lineHeight: 23,
    fontFamily: POPPINS_FONTS.semibold,
    color: colors.textPrimary,
  },
  headline: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: POPPINS_FONTS.semibold,
    color: colors.textPrimary,
  },
  callout: {
    fontSize: 14,
    lineHeight: 19,
    fontFamily: POPPINS_FONTS.medium,
    color: colors.textPrimary,
  },
  subheadline: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textSecondary,
  },
  footnote: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textSecondary,
  },
  caption2: {
    fontSize: 10,
    lineHeight: 13,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textSecondary,
  },
  tabLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: POPPINS_FONTS.semibold,
    textAlign: "center",
  },
  tabLabelActive: {
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.1,
    fontFamily: POPPINS_FONTS.bold,
    textAlign: "center",
  },
};

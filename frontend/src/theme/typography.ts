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
  | "caption2";

export const URBANIST_FONTS = {
  regular: "Urbanist_400Regular",
  medium: "Urbanist_500Medium",
  semibold: "Urbanist_600SemiBold",
  bold: "Urbanist_700Bold",
} as const;

export function getFontFamilyForWeight(weight?: TextStyle["fontWeight"]): string {
  if (!weight) return URBANIST_FONTS.regular;
  const wStr = String(weight).toLowerCase();
  if (wStr === "700" || wStr === "bold" || wStr === "800" || wStr === "900") {
    return URBANIST_FONTS.bold;
  }
  if (wStr === "600" || wStr === "semibold") {
    return URBANIST_FONTS.semibold;
  }
  if (wStr === "500" || wStr === "medium") {
    return URBANIST_FONTS.medium;
  }
  return URBANIST_FONTS.regular;
}

export const typography: Record<TypographyVariant, TextStyle> = {
  screenTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: URBANIST_FONTS.bold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  counter: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: URBANIST_FONTS.medium,
    color: colors.textPrimary,
  },
  wheelLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontFamily: URBANIST_FONTS.regular,
    color: colors.textSecondary,
    textAlign: "center",
  },
  wheelSelected: {
    fontSize: 34,
    lineHeight: 40,
    fontFamily: URBANIST_FONTS.bold,
    color: colors.primary,
    textAlign: "center",
  },
  wheelNear: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: URBANIST_FONTS.bold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  wheelMid: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: URBANIST_FONTS.regular,
    color: colors.textPrimary,
    textAlign: "center",
  },
  wheelFar: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: URBANIST_FONTS.regular,
    color: colors.textSecondary,
    textAlign: "center",
  },
  unitLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: URBANIST_FONTS.regular,
    color: colors.textSecondary,
  },
  bigInput: {
    fontSize: 30,
    lineHeight: 38,
    fontFamily: URBANIST_FONTS.medium,
    color: colors.textPrimary,
    textAlign: "center",
  },
  chip: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: URBANIST_FONTS.semibold,
  },
  calendarMonth: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: URBANIST_FONTS.semibold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  calendarWeek: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: URBANIST_FONTS.medium,
    color: colors.textSecondary,
    textAlign: "center",
  },
  calendarDay: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: URBANIST_FONTS.semibold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  percent: {
    fontSize: 44,
    lineHeight: 52,
    fontFamily: URBANIST_FONTS.bold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: URBANIST_FONTS.bold,
    color: colors.textPrimary,
  },
  statValue: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: URBANIST_FONTS.bold,
    color: colors.primary,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: URBANIST_FONTS.semibold,
    color: colors.textPrimary,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: URBANIST_FONTS.regular,
    color: colors.textSecondary,
  },

  heading: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: URBANIST_FONTS.bold,
    color: colors.textPrimary,
    textAlign: "left",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: URBANIST_FONTS.regular,
    color: colors.textSecondary,
    textAlign: "left",
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: URBANIST_FONTS.medium,
    color: colors.textPrimary,
  },
  inputText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: URBANIST_FONTS.regular,
    color: colors.textPrimary,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: URBANIST_FONTS.regular,
    color: colors.textPrimary,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: URBANIST_FONTS.bold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: URBANIST_FONTS.regular,
    color: colors.textSecondary,
    textAlign: "center",
  },
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: URBANIST_FONTS.semibold,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: URBANIST_FONTS.regular,
    color: colors.textSecondary,
    textAlign: "center",
  },
  link: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: URBANIST_FONTS.semibold,
    color: colors.primary,
  },
  footer: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: URBANIST_FONTS.regular,
    color: colors.textSecondary,
  },
  largeTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontFamily: URBANIST_FONTS.bold,
    color: colors.textPrimary,
  },
  title1: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: URBANIST_FONTS.bold,
    color: colors.textPrimary,
  },
  title2: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: URBANIST_FONTS.bold,
    color: colors.textPrimary,
  },
  title3: {
    fontSize: 18,
    lineHeight: 23,
    fontFamily: URBANIST_FONTS.semibold,
    color: colors.textPrimary,
  },
  headline: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: URBANIST_FONTS.semibold,
    color: colors.textPrimary,
  },
  callout: {
    fontSize: 14,
    lineHeight: 19,
    fontFamily: URBANIST_FONTS.medium,
    color: colors.textPrimary,
  },
  subheadline: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: URBANIST_FONTS.regular,
    color: colors.textSecondary,
  },
  footnote: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: URBANIST_FONTS.regular,
    color: colors.textSecondary,
  },
  caption2: {
    fontSize: 10,
    lineHeight: 13,
    fontFamily: URBANIST_FONTS.regular,
    color: colors.textSecondary,
  },
};

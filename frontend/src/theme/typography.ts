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
  // Onboarding screens primary heading: reduced ~2-3px to 23px, weight 600 (SemiBold), comfortable line spacing
  screenTitle: {
    fontSize: 23,
    lineHeight: 31,
    fontFamily: POPPINS_FONTS.semibold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  // Onboarding header step counter (e.g. 1 / 7): secondary and readable
  counter: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: POPPINS_FONTS.medium,
    color: colors.textSecondary,
  },
  // Onboarding wheel picker column labels (Month, Day, Year): visually secondary
  wheelLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: POPPINS_FONTS.medium,
    color: colors.textSecondary,
    textAlign: "center",
  },
  // Onboarding wheel picker active center value: reduced ~2-3px to 31px, weight 600, pink indicator color
  wheelSelected: {
    fontSize: 31,
    lineHeight: 38,
    fontFamily: POPPINS_FONTS.semibold,
    color: colors.primary,
    textAlign: "center",
  },
  // Onboarding wheel picker near-center values: subtle, regular weight, distinct from selected
  wheelNear: {
    fontSize: 23,
    lineHeight: 29,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textSecondary,
    textAlign: "center",
  },
  // Onboarding wheel picker mid-distance values
  wheelMid: {
    fontSize: 17,
    lineHeight: 23,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textMuted,
    textAlign: "center",
  },
  // Onboarding wheel picker far-distance values
  wheelFar: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textMuted,
    textAlign: "center",
  },
  // Onboarding wheel unit label (e.g. "days"): secondary supporting text
  unitLabel: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textSecondary,
  },
  // Onboarding Name step large text input: slightly reduced, readable and centered
  bigInput: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: POPPINS_FONTS.medium,
    color: colors.textPrimary,
    textAlign: "center",
  },
  // Onboarding cycle type segmented chips
  chip: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: POPPINS_FONTS.medium,
  },
  // Onboarding calendar month header
  calendarMonth: {
    fontSize: 14,
    lineHeight: 19,
    fontFamily: POPPINS_FONTS.medium,
    color: colors.textPrimary,
    textAlign: "center",
  },
  // Onboarding calendar weekday letters
  calendarWeek: {
    fontSize: 11,
    lineHeight: 15,
    fontFamily: POPPINS_FONTS.medium,
    color: colors.textSecondary,
    textAlign: "center",
  },
  // Onboarding calendar day numbers
  calendarDay: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: POPPINS_FONTS.medium,
    color: colors.textPrimary,
    textAlign: "center",
  },
  // Setup screen circular progress percent: balanced and distinct
  percent: {
    fontSize: 38,
    lineHeight: 46,
    fontFamily: POPPINS_FONTS.semibold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: POPPINS_FONTS.semibold,
    color: colors.textPrimary,
  },
  statValue: {
    fontSize: 20,
    lineHeight: 26,
    fontFamily: POPPINS_FONTS.semibold,
    color: colors.primary,
  },
  cardTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: POPPINS_FONTS.medium,
    color: colors.textPrimary,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textSecondary,
  },
  heading: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: POPPINS_FONTS.semibold,
    color: colors.textPrimary,
    textAlign: "left",
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textSecondary,
    textAlign: "left",
  },
  label: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: POPPINS_FONTS.medium,
    color: colors.textPrimary,
  },
  inputText: {
    fontSize: 14,
    lineHeight: 19,
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
    fontSize: 24,
    lineHeight: 30,
    fontFamily: POPPINS_FONTS.semibold,
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textSecondary,
    textAlign: "center",
  },
  button: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: POPPINS_FONTS.medium,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textSecondary,
    textAlign: "center",
  },
  link: {
    fontSize: 13,
    lineHeight: 17,
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
    fontSize: 26,
    lineHeight: 32,
    fontFamily: POPPINS_FONTS.semibold,
    color: colors.textPrimary,
  },
  title1: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: POPPINS_FONTS.semibold,
    color: colors.textPrimary,
  },
  title2: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: POPPINS_FONTS.semibold,
    color: colors.textPrimary,
  },
  title3: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: POPPINS_FONTS.semibold,
    color: colors.textPrimary,
  },
  headline: {
    fontSize: 14,
    lineHeight: 19,
    fontFamily: POPPINS_FONTS.semibold,
    color: colors.textPrimary,
  },
  callout: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: POPPINS_FONTS.medium,
    color: colors.textPrimary,
  },
  subheadline: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: POPPINS_FONTS.regular,
    color: colors.textSecondary,
  },
  footnote: {
    fontSize: 11,
    lineHeight: 15,
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
    fontFamily: POPPINS_FONTS.medium,
    textAlign: "center",
  },
  tabLabelActive: {
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.1,
    fontFamily: POPPINS_FONTS.semibold,
    textAlign: "center",
  },
};

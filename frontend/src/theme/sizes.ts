import { colors } from "./colors";
import { radius } from "./radius";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const sizes = {
  screenPadding: 24,
  buttonHeight: {
    small: 36,
    medium: 45,
    large: 48,
  },
  inputHeight: 46,
  icon: {
    small: 14,
    medium: 18,
    large: 24,
  },
  avatar: {
    small: 32,
    medium: 48,
    large: 56,
  },
  touchTarget: 44,
  recommendation: {
    cardMinHeight: 144,
    tile: 48,
    image: 38,
    tileBorderWidth: 1,
  },
  header: {
    avatarSize: 52,
    avatarRingWidth: 2,
    taglineFontSize: 22,
    taglineFontSizeCompact: 17,
  },
} as const;

export type Sizes = typeof sizes;

export const TAB_BAR_HEIGHT = 72;

export function getTabBarContentPaddingBottom(insetsBottom: number): number {
  return TAB_BAR_HEIGHT + 8 + Math.max(insetsBottom, 12) + 16;
}

export const calendarTokens = {
  maxContainerWidth: 480, // Cap container at 480px on wide screens
  pagePadding: spacing.md, // 12px horizontal page padding (spacing token)
  aspectRatio: 1.25, // cellHeight = cellWidth * 1.25
  columns: 7,
  rows: 5,
  headerHeight: 48, // Header: height 48px
  weekdayRowHeight: 28, // Weekday row: height 28px
  gridBorderWidth: 1, // 1px border on cells
  gridBorderColor: colors.calendar.separator, // Lightest existing border token (#EEEEEE)
  gridRadius: radius.large, // Outer corners of grid use existing radius token (16px)
  cellRadius: radius.checkbox, // Selected cell border radius token (6px)
  cellInnerPadding: spacing.xs, // cell inner padding: 4px
  touchTarget: 44, // 44px tap area
  iconButtonSize: 36, // Left cycle & right calendar icon buttons: 36px
  editButtonHeight: 36, // Edit pill button height: 36px
  selectedBorderColor: "#2F80ED", // Selected-border token
  selectedBorderWidth: 2, // 2px border overlay
  selectedInfoMarginTop: spacing.lg, // 16px top margin
  elementGap: spacing.sm, // 8px even spacing between header, weekday row, grid
  badgeRowGap: spacing.md, // 12px gap below title row
  dividerHeight: 1, // 1px divider
  dividerMarginTop: spacing.md, // 12px divider margin

  clamp: {
    dateFont: { min: 13, factor: 0.36, max: 16 },
    cycleFont: { min: 8, factor: 0.22, max: 10 },
    iconSize: { min: 14, factor: 0.42, max: 20 },
  },

  typography: {
    monthTitle: 19, // Month title "August" 18-20px bold
    weekday: 11.5, // text 11-12px muted
    selectedDate: typography.sectionTitle.fontSize ?? 18, // "Aug 17" in section-title token (16-18px)
    selectedSubtitle: typography.subheadline.fontSize ?? 12, // subtitle 12px muted
    chanceText: 11.5,
  },
} as const;

export type CalendarTokens = typeof calendarTokens;

export interface CalendarSizes {
  containerWidth: number;
  innerWidth: number;
  cellWidth: number;
  cellHeight: number;
  totalGridWidth: number;
  outerGridWidth: number;
  dateFont: number;
  cycleFont: number;
  iconSize: number;
  gridHeight: number;
  leftoverHeight: number;
  emptySpaceBottom: number;
}

function clamp(min: number, val: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Calculates responsive calendar cell and component sizes based on screen width and height.
 * innerWidth = screenWidth (capped at max-width token) - 2 x pagePadding - 2 x gridBorderWidth
 * cellWidth = Math.floor(innerWidth / 7)
 */
export function getCalendarSizes(
  screenWidth: number,
  screenHeight: number = 844,
  rowsCount: number = calendarTokens.rows
): CalendarSizes {
  const safeScreenWidth = screenWidth > 0 ? screenWidth : 390;
  const containerWidth = Math.min(safeScreenWidth, calendarTokens.maxContainerWidth);
  const innerWidth = containerWidth - 2 * calendarTokens.pagePadding - 2 * calendarTokens.gridBorderWidth;
  // Math.floor guarantees 7 * cellWidth <= innerWidth and prevents wrapping/subpixel overflow
  const cellWidth = Math.floor(innerWidth / calendarTokens.columns);
  const totalGridWidth = cellWidth * calendarTokens.columns;
  const outerGridWidth = totalGridWidth + 2 * calendarTokens.gridBorderWidth;
  const cellHeight = Math.round(cellWidth * calendarTokens.aspectRatio);

  const dateFont = clamp(
    calendarTokens.clamp.dateFont.min,
    cellWidth * calendarTokens.clamp.dateFont.factor,
    calendarTokens.clamp.dateFont.max
  );

  const cycleFont = clamp(
    calendarTokens.clamp.cycleFont.min,
    cellWidth * calendarTokens.clamp.cycleFont.factor,
    calendarTokens.clamp.cycleFont.max
  );

  const iconSize = clamp(
    calendarTokens.clamp.iconSize.min,
    cellWidth * calendarTokens.clamp.iconSize.factor,
    calendarTokens.clamp.iconSize.max
  );

  const gridHeight = cellHeight * rowsCount;

  // Approximate top chrome and tab bar reserve on 390x844
  const topReserved = 55; // insets.top + spacing.sm
  const bottomReserved = TAB_BAR_HEIGHT + 34 + spacing.xl;
  const topAreaHeight = calendarTokens.headerHeight + 2 * calendarTokens.elementGap + calendarTokens.weekdayRowHeight + gridHeight;
  const infoSectionHeight = 81; // 36 + 12 + 20 + 12 + 1
  const availableContentHeight = screenHeight - topReserved - bottomReserved;
  const leftoverHeight = Math.max(0, availableContentHeight - topAreaHeight - infoSectionHeight);

  // Leftover space is absorbed by even vertical spacers above and below info section, leaving 0 empty space
  const emptySpaceBottom = 0;

  return {
    containerWidth,
    innerWidth,
    cellWidth,
    cellHeight,
    totalGridWidth,
    outerGridWidth,
    dateFont,
    cycleFont,
    iconSize,
    gridHeight,
    leftoverHeight,
    emptySpaceBottom,
  };
}

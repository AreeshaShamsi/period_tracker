import React from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { colors } from "@/theme/colors";

export interface IconProps {
  size?: number;
  color?: string;
}

/**
 * DropIcon: blood-drop shape
 */
export const DropIcon: React.FC<IconProps> = ({
  size = 14,
  color = colors.calendar.primaryPink,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 1.5C8 1.5 2.5 7.5 2.5 10.5C2.5 13.5 5 15 8 15C11 15 13.5 13.5 13.5 10.5C13.5 7.5 8 1.5 8 1.5Z"
        fill={color}
      />
    </Svg>
  );
};

/**
 * CloverIcon: green four-leaf clover (safe / low chance day)
 */
export const CloverIcon: React.FC<IconProps> = ({
  size = 14,
  color = "#43B987",
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      {/* 4 clover petals */}
      <Circle cx="8" cy="5" r="2.6" fill={color} />
      <Circle cx="8" cy="11" r="2.6" fill={color} />
      <Circle cx="5" cy="8" r="2.6" fill={color} />
      <Circle cx="11" cy="8" r="2.6" fill={color} />
      {/* Center connection */}
      <Circle cx="8" cy="8" r="1.5" fill={color} />
      {/* Stem */}
      <Path
        d="M8 8.5C8 11.5 10 13 11.5 13.5"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export interface OvulationIconProps extends IconProps {
  circleColor?: string;
  faceColor?: string;
}

/**
 * OvulationIcon: small circle icon with a face / sparkle mark
 */
export const OvulationIcon: React.FC<OvulationIconProps> = ({
  size = 14,
  color,
  circleColor = color || colors.calendar.fertileAccent,
  faceColor = colors.white,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      {/* Circle */}
      <Circle cx="8" cy="8" r="6.5" fill={circleColor} />
      {/* Friendly sparkle / face mark: two tiny eyes and a short smile */}
      <Circle cx="6" cy="7" r="0.9" fill={faceColor} />
      <Circle cx="10" cy="7" r="0.9" fill={faceColor} />
      <Path
        d="M6 9.5C6.5 10.5 9.5 10.5 10 9.5"
        stroke={faceColor}
        strokeWidth="1"
        strokeLinecap="round"
      />
    </Svg>
  );
};

/**
 * CalendarIcon: outlined calendar icon button
 */
export const CalendarIcon: React.FC<IconProps> = ({
  size = 18,
  color = colors.calendar.textMain,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2.5"
        stroke={color}
        strokeWidth="1.6"
      />
      <Path
        d="M8 2.5V5.5M16 2.5V5.5M3 9.5H21"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <Circle cx="8" cy="13" r="1" fill={color} />
      <Circle cx="12" cy="13" r="1" fill={color} />
      <Circle cx="16" cy="13" r="1" fill={color} />
      <Circle cx="8" cy="17" r="1" fill={color} />
      <Circle cx="12" cy="17" r="1" fill={color} />
      <Circle cx="16" cy="17" r="1" fill={color} />
    </Svg>
  );
};

/**
 * CycleIcon: circular pink cycle / refresh icon button
 */
export const CycleIcon: React.FC<IconProps> = ({
  size = 20,
  color = colors.calendar.primaryPink,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.8" />
      <Path
        d="M12 6.5C12 6.5 8 11 8 13.5C8 15.7 9.8 17.5 12 17.5C14.2 17.5 16 15.7 16 13.5C16 11 12 6.5 12 6.5Z"
        fill={color}
      />
    </Svg>
  );
};

/**
 * FlowDropsIllustration: red/pink blood-drops illustration for Flow section
 */
export const FlowDropsIllustration: React.FC<IconProps> = ({
  size = 32,
  color = "#F45B91",
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Back drop */}
      <Path
        d="M19 8C19 8 14 13.5 14 17C14 19.8 16.2 22 19 22C21.8 22 24 19.8 24 17C24 13.5 19 8 19 8Z"
        fill="#FF8CA3"
      />
      {/* Front drop */}
      <Path
        d="M12 12C12 12 7 17.5 7 21C7 23.8 9.2 26 12 26C14.8 26 17 23.8 17 21C17 17.5 12 12 12 12Z"
        fill={color}
      />
      {/* Drop shine */}
      <Circle cx="10" cy="21" r="1.2" fill="#FFFFFF" opacity={0.6} />
    </Svg>
  );
};

/**
 * HeadacheFaceIllustration: face with headache / tension lines
 */
export const HeadacheFaceIllustration: React.FC<IconProps> = ({
  size = 32,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Head circle */}
      <Circle cx="16" cy="16" r="12" fill="#FEF08A" />
      {/* Strained eyes */}
      <Path
        d="M11 14L13.5 15.5M11 17L13.5 15.5"
        stroke="#854D0E"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M21 14L18.5 15.5M21 17L18.5 15.5"
        stroke="#854D0E"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Straight neutral / discomfort mouth */}
      <Path
        d="M13 21H19"
        stroke="#854D0E"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Headache lightning / tension marks above forehead */}
      <Path
        d="M8 8L9.5 10.5L8.5 12"
        stroke="#EF4444"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M24 8L22.5 10.5L23.5 12"
        stroke="#EF4444"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};

/**
 * NightSweatsFaceIllustration: face with sweat droplets
 */
export const NightSweatsFaceIllustration: React.FC<IconProps> = ({
  size = 32,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Warm peach face */}
      <Circle cx="16" cy="16" r="12" fill="#FED7AA" />
      {/* Weary eyes */}
      <Circle cx="12" cy="15" r="1.5" fill="#9A3412" />
      <Circle cx="20" cy="15" r="1.5" fill="#9A3412" />
      {/* Sigh mouth */}
      <Path
        d="M13 21C14 20 18 20 19 21"
        stroke="#9A3412"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Sweat drop on side */}
      <Path
        d="M24 12C24 12 22 14.5 22 16C22 17.1 22.9 18 24 18C25.1 18 26 17.1 26 16C26 14.5 24 12 24 12Z"
        fill="#38BDF8"
      />
    </Svg>
  );
};

/**
 * VaginalDrynessFaceIllustration: illustrated face
 */
export const VaginalDrynessFaceIllustration: React.FC<IconProps> = ({
  size = 32,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Soft beige face */}
      <Circle cx="16" cy="16" r="12" fill="#FDE68A" />
      {/* Neutral calm eyes */}
      <Path
        d="M11 15C12 14 14 14 14 15"
        stroke="#78350F"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M18 15C18 14 20 14 21 15"
        stroke="#78350F"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Gentle small mouth */}
      <Path
        d="M14 20C15 20.8 17 20.8 18 20"
        stroke="#78350F"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Little warm blush dots */}
      <Circle cx="10" cy="18" r="1.4" fill="#FCA5A5" opacity={0.6} />
      <Circle cx="22" cy="18" r="1.4" fill="#FCA5A5" opacity={0.6} />
    </Svg>
  );
};

/**
 * NormalMoodFaceIllustration: yellow smiling face ("Normal")
 */
export const NormalMoodFaceIllustration: React.FC<IconProps> = ({
  size = 32,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx="16" cy="16" r="12" fill="#FBBF24" />
      {/* Happy eyes */}
      <Circle cx="12" cy="14" r="1.6" fill="#78350F" />
      <Circle cx="20" cy="14" r="1.6" fill="#78350F" />
      {/* Smile */}
      <Path
        d="M11 18.5C12.5 21.5 19.5 21.5 21 18.5"
        stroke="#78350F"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
};

/**
 * SadMoodFaceIllustration: blue crying face ("Sad")
 */
export const SadMoodFaceIllustration: React.FC<IconProps> = ({
  size = 32,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx="16" cy="16" r="12" fill="#93C5FD" />
      {/* Sad eyes */}
      <Circle cx="12" cy="14" r="1.6" fill="#1E3A8A" />
      <Circle cx="20" cy="14" r="1.6" fill="#1E3A8A" />
      {/* Frown */}
      <Path
        d="M12 21C13.5 19 18.5 19 20 21"
        stroke="#1E3A8A"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* Tear drop on left cheek */}
      <Path
        d="M10 17C10 17 9 18.5 9 19.5C9 20.3 9.5 21 10.3 21C11.1 21 11.6 20.3 11.6 19.5C11.6 18.5 10 17 10 17Z"
        fill="#2563EB"
      />
    </Svg>
  );
};

/**
 * AnxiousMoodFaceIllustration: blue worried face ("Anxious")
 */
export const AnxiousMoodFaceIllustration: React.FC<IconProps> = ({
  size = 32,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Circle cx="16" cy="16" r="12" fill="#93C5FD" />
      {/* Worried raised eyebrows & wide eyes */}
      <Circle cx="12" cy="14.5" r="1.7" fill="#1E3A8A" />
      <Circle cx="20" cy="14.5" r="1.7" fill="#1E3A8A" />
      <Path
        d="M10 11.5L14 12.5M22 11.5L18 12.5"
        stroke="#1E3A8A"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      {/* Wavy nervous mouth */}
      <Path
        d="M11 20C12.5 19 14.5 21 16.5 20C18.5 19 19.5 20.5 21 20"
        stroke="#1E3A8A"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
};

/**
 * MedicineBottleIllustration: bottle / pill / condom protection icon
 */
export const MedicineBottleIllustration: React.FC<IconProps> = ({
  size = 32,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* Rounded medical / contraceptive pack */}
      <Rect
        x="9"
        y="9"
        width="14"
        height="14"
        rx="4"
        stroke="#EC4899"
        strokeWidth="1.6"
        fill="#FDF2F8"
      />
      {/* Inner circular protective foil ring */}
      <Circle
        cx="16"
        cy="16"
        r="4.5"
        stroke="#EC4899"
        strokeWidth="1.5"
        fill="#FCE7F3"
      />
      <Circle cx="16" cy="16" r="2" fill="#EC4899" />
    </Svg>
  );
};

/**
 * FlexedArmIcon: yellow flexed-arm icon for Weight stat
 */
export const FlexedArmIcon: React.FC<IconProps> = ({
  size = 28,
  color = "#FFA62B",
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 14C20.5 14 21.5 12.5 21 11C20.5 9 18.5 7.5 16 7.5C14 7.5 13 8.5 12 10C11 8.5 9.5 8 8 8.5C6.5 9 5.5 10.5 5.5 12C5.5 14.5 7.5 16.5 10 16.5H16C17 16.5 18 15.5 19 14Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13 10C14 11 15 12.5 15.5 14.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
};

/**
 * ThermometerIcon: red thermometer icon for Temperature stat
 */
export const ThermometerIcon: React.FC<IconProps> = ({
  size = 28,
  color = "#F45B91",
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Tube & bulb */}
      <Path
        d="M14 14.3V5C14 3.9 13.1 3 12 3C10.9 3 10 3.9 10 5V14.3C8.8 15.1 8 16.4 8 18C8 20.2 9.8 22 12 22C14.2 22 16 20.2 16 18C16 16.4 15.2 15.1 14 14.3Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Mercury filling */}
      <Circle cx="12" cy="18" r="2.2" fill={color} />
      <Path
        d="M12 9V16"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
};

/**
 * WaterDropIcon: blue water-drop icon for Drink Water stat
 */
export const WaterDropIcon: React.FC<IconProps> = ({
  size = 28,
  color = "#3B82F6",
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2.5C12 2.5 4.5 11 4.5 15.5C4.5 19.5 7.9 22 12 22C16.1 22 19.5 19.5 19.5 15.5C19.5 11 12 2.5 12 2.5Z"
        fill={color}
      />
      <Path
        d="M9 14.5C9 13 10 11.5 11 10.5"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity={0.7}
      />
    </Svg>
  );
};

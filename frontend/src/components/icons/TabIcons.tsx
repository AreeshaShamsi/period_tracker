import React from "react";
import Svg, { Path, Rect, Circle } from "react-native-svg";

export interface TabIconProps {
  size?: number;
  color?: string;
  active?: boolean;
}

export const HomeTabIcon: React.FC<TabIconProps> = ({
  size = 24,
  color = "#8E8E93",
  active = false,
}) => {
  if (active) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 2.5L2.5 10.5H5.5V20.5H18.5V10.5H21.5L12 2.5Z"
          fill={color}
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Rect x="9.5" y="13.5" width="5" height="7" rx="1" fill="#FFFFFF" />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3L3.5 10.5H6V19.5H18V10.5H20.5L12 3Z"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Path
        d="M10 19.5V14.5H14V19.5"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export const CalendarTabIcon: React.FC<TabIconProps> = ({
  size = 24,
  color = "#8E8E93",
  active = false,
}) => {
  if (active) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="5" width="18" height="16" rx="3" fill={color} />
        <Path d="M8 2.5V5.5M16 2.5V5.5M3 9.5H21" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <Circle cx="8" cy="13" r="1.2" fill="#FFFFFF" />
        <Circle cx="12" cy="13" r="1.2" fill="#FFFFFF" />
        <Circle cx="16" cy="13" r="1.2" fill="#FFFFFF" />
        <Circle cx="8" cy="17" r="1.2" fill="#FFFFFF" />
        <Circle cx="12" cy="17" r="1.2" fill="#FFFFFF" />
        <Circle cx="16" cy="17" r="1.2" fill="#FFFFFF" />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5" width="18" height="16" rx="3" stroke={color} strokeWidth="1.6" fill="none" />
      <Path d="M8 2.5V5.5M16 2.5V5.5M3 9.5H21" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <Circle cx="8" cy="13" r="1" fill={color} />
      <Circle cx="12" cy="13" r="1" fill={color} />
      <Circle cx="16" cy="13" r="1" fill={color} />
      <Circle cx="8" cy="17" r="1" fill={color} />
      <Circle cx="12" cy="17" r="1" fill={color} />
      <Circle cx="16" cy="17" r="1" fill={color} />
    </Svg>
  );
};

export const AnalyticsTabIcon: React.FC<TabIconProps> = ({
  size = 24,
  color = "#8E8E93",
  active = false,
}) => {
  if (active) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3.5" y="12" width="4.5" height="8.5" rx="1.5" fill={color} />
        <Rect x="9.75" y="5.5" width="4.5" height="15" rx="1.5" fill={color} />
        <Rect x="16" y="9" width="4.5" height="11.5" rx="1.5" fill={color} />
        <Path d="M4.5 14H7M10.75 8.5H13.25M17 11.5H19.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3.5" y="12" width="4.5" height="8.5" rx="1.5" stroke={color} strokeWidth="1.6" fill="none" />
      <Rect x="9.75" y="5.5" width="4.5" height="15" rx="1.5" stroke={color} strokeWidth="1.6" fill="none" />
      <Rect x="16" y="9" width="4.5" height="11.5" rx="1.5" stroke={color} strokeWidth="1.6" fill="none" />
    </Svg>
  );
};

export const AIChatTabIcon: React.FC<TabIconProps> = ({
  size = 24,
  color = "#8E8E93",
  active = false,
}) => {
  if (active) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
          fill={color}
          stroke={color}
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <Path
          d="M12 7.5L13 10.5L16 11.5L13 12.5L12 15.5L11 12.5L8 11.5L11 10.5L12 7.5Z"
          fill="#FFFFFF"
        />
        <Path
          d="M18.5 2L19.4 5.1L22.5 6L19.4 6.9L18.5 10L17.6 6.9L14.5 6L17.6 5.1L18.5 2Z"
          fill={color}
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3.5L14.1 10L20.5 12.1L14.1 14.2L12 20.7L9.9 14.2L3.5 12.1L9.9 10L12 3.5Z"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Path
        d="M18.5 2.5L19.4 5.2L22.1 6.1L19.4 7L18.5 9.7L17.6 7L14.9 6.1L17.6 5.2L18.5 2.5Z"
        fill="none"
        stroke={color}
        strokeWidth="1.4"
      />
    </Svg>
  );
};

export const ProfileTabIcon: React.FC<TabIconProps> = ({
  size = 24,
  color = "#8E8E93",
  active = false,
}) => {
  if (active) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="7" r="4.5" fill={color} />
        <Path
          d="M4 20.5C4 15.8056 7.58172 12 12 12C16.4183 12 20 15.8056 20 20.5V21H4V20.5Z"
          fill={color}
        />
        <Path
          d="M8.5 20.5C8.5 18.5 10 17 12 17C14 17 15.5 18.5 15.5 20.5"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="7" r="4.5" stroke={color} strokeWidth="1.6" fill="none" />
      <Path
        d="M4 20.5C4 15.8056 7.58172 12 12 12C16.4183 12 20 15.8056 20 20.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
};

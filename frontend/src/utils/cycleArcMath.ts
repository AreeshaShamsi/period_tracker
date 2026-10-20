export interface PhaseSegment {
  name: string;
  color: string;
  startAngle: number;
  sweepAngle: number;
  duration: number;
}

export interface ArcGeometry {
  segments: PhaseSegment[];
  markerAngle: number;
  markerPos: { x: number; y: number };
}

/**
 * Computes SVG arc path definition for an arch (semicircle curving over the top).
 * Angles in degrees: 180° (left) -> 90° (top) -> 0° (right).
 */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const rad = (angleInDegrees * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy - radius * Math.sin(rad),
  };
}

export function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);
  const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  // Sweep flag 1 draws clockwise (decreasing angle in standard cartesian with inverted Y)
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

/**
 * Calculates phase segment angles and current-day marker position.
 */
export function computeCycleArc(
  currentDay: number,
  cycleLength: number,
  periodLength: number,
  ovulationDay: number,
  cx: number,
  cy: number,
  radius: number,
  colors: {
    menstruation: string;
    follicular: string;
    ovulation: string;
    luteal: string;
  }
): ArcGeometry {
  const totalDays = Math.max(cycleLength, 20);
  const pLen = Math.max(periodLength, 3);
  const oDay = Math.max(Math.min(ovulationDay, totalDays - 2), pLen + 4);

  // Phase durations
  const dMenstrual = pLen;
  const dFollicular = Math.max(oDay - 3 - pLen, 2);
  const dOvulation = 4;
  const dLuteal = Math.max(totalDays - (dMenstrual + dFollicular + dOvulation), 2);
  const computedTotal = dMenstrual + dFollicular + dOvulation + dLuteal;

  const gapAngle = 3;
  const totalUsableAngle = 180 - gapAngle * 3;

  const durations = [
    { name: "Menstruation", color: colors.menstruation, d: dMenstrual },
    { name: "Follicular phase", color: colors.follicular, d: dFollicular },
    { name: "Ovulation", color: colors.ovulation, d: dOvulation },
    { name: "Luteal phase", color: colors.luteal, d: dLuteal },
  ];

  let currentAngle = 180;
  const segments: PhaseSegment[] = durations.map((item, idx) => {
    const sweep = (item.d / computedTotal) * totalUsableAngle;
    const start = currentAngle;
    currentAngle -= sweep;
    const segment: PhaseSegment = {
      name: item.name,
      color: item.color,
      startAngle: start,
      sweepAngle: sweep,
      duration: item.d,
    };
    if (idx < 3) {
      currentAngle -= gapAngle;
    }
    return segment;
  });

  // Marker calculation
  const clampedDay = Math.min(Math.max(currentDay, 1), totalDays);
  const dayFraction = (clampedDay - 1) / (totalDays - 1 || 1);
  const markerAngle = 180 - dayFraction * 180;
  const markerPos = polarToCartesian(cx, cy, radius, markerAngle);

  return { segments, markerAngle, markerPos };
}

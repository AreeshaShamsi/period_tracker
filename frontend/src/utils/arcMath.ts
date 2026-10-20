export interface DashSegment {
  path: string;
  color: string;
  slot: number;
}

export interface MarkerGeometry {
  angle: number;
  points: string;
  glowPoints: string;
}

export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const rad = (angleInDegrees * Math.PI) / 180;
  return {
    x: cx - radius * Math.cos(rad),
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
  const p1 = polarToCartesian(cx, cy, radius, startAngle);
  const p2 = polarToCartesian(cx, cy, radius, endAngle);
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${radius} ${radius} 0 0 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
}

export function computeDashSegments(
  cx: number,
  cy: number,
  radius: number,
  segmentColors: string[]
): DashSegment[] {
  const slotAngle = 180 / 8; // 22.5 deg
  const halfSweep = 3.25; // 6.5 deg path sweep + 26px round caps ≈ 40x26 pill

  return segmentColors.slice(0, 8).map((color, i) => {
    const centerAngle = (i + 0.5) * slotAngle;
    const startAngle = centerAngle - halfSweep;
    const endAngle = centerAngle + halfSweep;
    return {
      slot: i + 1,
      color,
      path: describeArc(cx, cy, radius, startAngle, endAngle),
    };
  });
}

export function computeMarkerGeometry(
  currentDay: number,
  cycleLength: number,
  cx: number,
  cy: number,
  radius: number
): MarkerGeometry {
  const visibleStart = 22.5;
  const visibleEnd = 157.5;
  const safeCycle = Math.max(cycleLength || 28, 1);
  const progress = Math.max(0, Math.min(1, (currentDay - 0.5) / safeCycle));
  const rawAngle = visibleStart + (visibleEnd - visibleStart) * progress;
  const angle = Math.max(visibleStart, Math.min(visibleEnd, rawAngle));

  const rad = (angle * Math.PI) / 180;
  const center = polarToCartesian(cx, cy, radius, angle);
  // Tangent pointing backward (counter-clockwise)
  const ux = -Math.sin(rad);
  const uy = Math.cos(rad);
  // Outward normal
  const nx = -Math.cos(rad);
  const ny = -Math.sin(rad);

  const formatPoly = (dApex: number, dBase: number, w: number): string => {
    const aX = center.x + dApex * ux;
    const aY = center.y + dApex * uy;
    const b1X = center.x - dBase * ux + w * nx;
    const b1Y = center.y - dBase * uy + w * ny;
    const b2X = center.x - dBase * ux - w * nx;
    const b2Y = center.y - dBase * uy - w * ny;
    return `${aX.toFixed(2)},${aY.toFixed(2)} ${b1X.toFixed(2)},${b1Y.toFixed(2)} ${b2X.toFixed(2)},${b2Y.toFixed(2)}`;
  };

  return {
    angle,
    points: formatPoly(22, 11, 19),
    glowPoints: formatPoly(26, 14, 23),
  };
}

export function getPhaseForDay(
  currentDay: number,
  cycleLength: number,
  periodLength: number,
  ovulationDay: number
): string {
  const pLen = periodLength || 5;
  const cLen = cycleLength || 28;
  const oDay = ovulationDay || Math.max(1, cLen - 14);

  if (currentDay <= pLen) return "Menstruation Phase";
  if (currentDay >= oDay - 1 && currentDay <= oDay + 1) return "Ovulation Phase";
  if (currentDay < oDay - 1) return "Follicular Phase";
  return "Luteal Phase";
}

export const ARC_GEOMETRY = {
  viewWidth: 320,
  viewHeight: 165,
  centerX: 160,
  centerY: 150,
  radius: 124,
  dashStrokeWidth: 26,
  dashHalfSweep: 3.25,
  slotAngle: 22.5,
  visibleStart: 22.5,
  visibleEnd: 157.5,
  markerSide: 26,
  markerOuterStroke: 14,
  markerInnerStroke: 6,
  markerShadowSpread: 6,
  markerShadowOpacity: 0.25,
} as const;

export interface DashSegment {
  path: string;
  color: string;
  slot: number;
}

export interface MarkerGeometry {
  x: number;
  y: number;
  rotation: number;
  path: string;
}

export function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx - radius * Math.cos(rad), y: cy - radius * Math.sin(rad) };
}

export function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const p1 = polarToCartesian(cx, cy, radius, startAngle);
  const p2 = polarToCartesian(cx, cy, radius, endAngle);
  return `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${radius} ${radius} 0 0 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
}

export function computeDashSegments(cx: number, cy: number, radius: number, colors: string[]): DashSegment[] {
  const { slotAngle, dashHalfSweep } = ARC_GEOMETRY;
  return colors.slice(0, 8).map((color, i) => {
    const center = (i + 0.5) * slotAngle;
    return {
      slot: i + 1,
      color,
      path: describeArc(cx, cy, radius, center - dashHalfSweep, center + dashHalfSweep),
    };
  });
}

export function getMarkerTrianglePath(side: number = ARC_GEOMETRY.markerSide): string {
  const r = side / Math.sqrt(3);
  const halfR = r / 2;
  const halfS = side / 2;
  return `M ${r.toFixed(2)} 0 L ${(-halfR).toFixed(2)} ${halfS.toFixed(2)} L ${(-halfR).toFixed(2)} ${(-halfS).toFixed(2)} Z`;
}

export function computeMarkerGeometry(
  currentDay: number,
  cycleLength: number,
  cx: number,
  cy: number,
  radius: number
): MarkerGeometry {
  const { visibleStart, visibleEnd, markerSide } = ARC_GEOMETRY;
  const safeCycle = Math.max(cycleLength || 28, 1);
  const progress = Math.max(0, Math.min(1, (currentDay - 0.5) / safeCycle));
  const theta = Math.max(visibleStart, Math.min(visibleEnd, visibleStart + (visibleEnd - visibleStart) * progress));

  const rad = (theta * Math.PI) / 180;
  const x = cx - radius * Math.cos(rad);
  const y = cy - radius * Math.sin(rad);

  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
    rotation: Number((theta - 90).toFixed(2)),
    path: getMarkerTrianglePath(markerSide),
  };
}

export function getPhaseForDay(cDay: number, cLen: number, pLen: number, oDay: number): string {
  const period = pLen || 5;
  const ov = oDay || Math.max(1, (cLen || 28) - 14);
  if (cDay <= period) return "Menstruation Phase";
  if (cDay >= ov - 1 && cDay <= ov + 1) return "Ovulation Phase";
  if (cDay < ov - 1) return "Follicular Phase";
  return "Luteal Phase";
}

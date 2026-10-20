package com.lunari.app.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import com.lunari.app.R
import com.lunari.app.theme.LunariTheme
import kotlin.math.cos
import kotlin.math.roundToInt
import kotlin.math.sin

/**
 * Reusable, stateless composable displaying the menstrual cycle progress ring.
 *
 * @param currentDay The current day in the cycle (e.g. 4)
 * @param cycleLength Total days in the cycle (e.g. 28)
 * @param periodLength Duration of period bleeding in days (e.g. 5)
 * @param ovulationDay Day on which ovulation is estimated (e.g. 15)
 * @param modifier Composable modifier
 * @param ringSize Diameter of the circular ring
 */
@Composable
fun CycleRing(
    currentDay: Int,
    cycleLength: Int,
    periodLength: Int,
    ovulationDay: Int,
    modifier: Modifier = Modifier,
    ringSize: Dp = 260.dp
) {
    val colors = LunariTheme.colors
    val typography = LunariTheme.typography
    val spacing = LunariTheme.spacing

    // Animation progress for first load sweep (0f -> 1f)
    val animProgress = remember { Animatable(0f) }
    LaunchedEffect(currentDay, cycleLength, periodLength, ovulationDay) {
        animProgress.animateTo(
            targetValue = 1f,
            animationSpec = tween(
                durationMillis = 1100,
                easing = FastOutSlowInEasing
            )
        )
    }

    // Geometry computations (no hardcoded angles)
    val validCycleLength = cycleLength.coerceAtLeast(1)
    val strokeWidthDp = spacing.ringStrokeWidth
    val strokeWidthPx = with(LocalDensity.current) { strokeWidthDp.toPx() }
    val ringSizePx = with(LocalDensity.current) { ringSize.toPx() }
    val radiusPx = (ringSizePx - strokeWidthPx) / 2f
    val centerPx = ringSizePx / 2f

    // 1. Period Arc (Starts at top: -90 degrees)
    val periodStartAngle = -90f
    val fullPeriodSweep = (periodLength.toFloat() / validCycleLength) * 360f
    val currentPeriodSweep = fullPeriodSweep * animProgress.value

    // Period Knob position
    val periodKnobAngleRad = Math.toRadians((periodStartAngle + currentPeriodSweep).toDouble())
    val periodKnobX = centerPx + radiusPx * cos(periodKnobAngleRad).toFloat()
    val periodKnobY = centerPx + radiusPx * sin(periodKnobAngleRad).toFloat()

    // 2. Ovulation / Fertile Window Arc
    // Typical fertile window covers 4-5 days up to ovulation day
    val ovulationDuration = 4
    val ovulationStartDay = (ovulationDay - 3).coerceAtLeast(periodLength + 1)
    val ovulationStartAngle = -90f + (ovulationStartDay.toFloat() / validCycleLength) * 360f
    val fullOvulationSweep = (ovulationDuration.toFloat() / validCycleLength) * 360f
    val currentOvulationSweep = fullOvulationSweep * animProgress.value

    // Ovulation Knob position
    val ovulationKnobAngleRad = Math.toRadians((ovulationStartAngle + currentOvulationSweep).toDouble())
    val ovulationKnobX = centerPx + radiusPx * cos(ovulationKnobAngleRad).toFloat()
    val ovulationKnobY = centerPx + radiusPx * sin(ovulationKnobAngleRad).toFloat()

    val daysUntilOvulation = (ovulationDay - currentDay).coerceAtLeast(0)
    val daySuffix = getDayOrdinalSuffix(currentDay)

    val a11yDescription = "Cycle progress: Day $currentDay of $cycleLength. " +
            "Period lasts $periodLength days. Ovulation in $daysUntilOvulation days."

    Box(
        modifier = modifier
            .size(ringSize)
            .semantics { contentDescription = a11yDescription },
        contentAlignment = Alignment.Center
    ) {
        // Drawing the Canvas Arcs
        Canvas(modifier = Modifier.size(ringSize)) {
            val canvasStroke = Stroke(
                width = strokeWidthPx,
                cap = StrokeCap.Round
            )
            val arcSize = Size(radiusPx * 2f, radiusPx * 2f)
            val arcTopLeft = Offset(strokeWidthPx / 2f, strokeWidthPx / 2f)

            // 1. Light-gray background track
            drawArc(
                color = colors.ringTrack,
                startAngle = 0f,
                sweepAngle = 360f,
                useCenter = false,
                topLeft = arcTopLeft,
                size = arcSize,
                style = canvasStroke
            )

            // 2. Amber ovulation window arc
            if (currentOvulationSweep > 0f) {
                drawArc(
                    color = colors.ovulationAmber,
                    startAngle = ovulationStartAngle,
                    sweepAngle = currentOvulationSweep,
                    useCenter = false,
                    topLeft = arcTopLeft,
                    size = arcSize,
                    style = canvasStroke
                )
            }

            // 3. Pink period phase arc
            if (currentPeriodSweep > 0f) {
                drawArc(
                    color = colors.periodPink,
                    startAngle = periodStartAngle,
                    sweepAngle = currentPeriodSweep,
                    useCenter = false,
                    topLeft = arcTopLeft,
                    size = arcSize,
                    style = canvasStroke
                )
            }
        }

        // Period knob at end of pink arc: white knob with pink border
        val knobSize = spacing.ringKnobSize
        val knobSizePx = with(LocalDensity.current) { knobSize.toPx() }

        Box(
            modifier = Modifier
                .offset {
                    IntOffset(
                        (periodKnobX - knobSizePx / 2f).roundToInt(),
                        (periodKnobY - knobSizePx / 2f).roundToInt()
                    )
                }
                .size(knobSize)
                .clip(CircleShape)
                .background(colors.surface)
                .border(width = 3.dp, color = colors.periodPink, shape = CircleShape)
        )

        // Ovulation knob at end of amber arc: knob containing small ovulation icon
        Box(
            modifier = Modifier
                .offset {
                    IntOffset(
                        (ovulationKnobX - knobSizePx / 2f).roundToInt(),
                        (ovulationKnobY - knobSizePx / 2f).roundToInt()
                    )
                }
                .size(knobSize)
                .clip(CircleShape)
                .background(colors.surface)
                .border(width = 2.dp, color = colors.ovulationAmber, shape = CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                painter = painterResource(id = R.drawable.ic_ovulation),
                contentDescription = stringResource(id = R.string.content_desc_ovulation_icon),
                tint = colors.ovulationAmber,
                modifier = Modifier.size(12.dp)
            )
        }

        // Center Content Stacked
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.align(Alignment.Center)
        ) {
            // 1. Pink drop icon
            Icon(
                painter = painterResource(id = R.drawable.ic_drop),
                contentDescription = stringResource(id = R.string.content_desc_period_drop),
                tint = colors.periodPink,
                modifier = Modifier.size(24.dp)
            )

            Spacer(modifier = Modifier.height(spacing.xs))

            // 2. "Period" label
            Text(
                text = stringResource(id = R.string.period_label),
                style = typography.ringPhaseLabel,
                color = colors.textSecondary
            )

            Spacer(modifier = Modifier.height(2.dp))

            // 3. Large "4th" with small "days" beside it
            Row(
                verticalAlignment = Alignment.Bottom,
                modifier = Modifier.padding(bottom = 2.dp)
            ) {
                Text(
                    text = "$currentDay$daySuffix",
                    style = typography.ringDayNumber,
                    color = colors.textPrimary
                )
                Spacer(modifier = Modifier.width(spacing.xs))
                Text(
                    text = stringResource(id = R.string.cycle_day_days),
                    style = typography.ringDayUnit,
                    color = colors.textSecondary,
                    modifier = Modifier.offset(y = (-6).dp)
                )
            }

            // 4. "Ovulation  11 days left" below
            Text(
                text = stringResource(id = R.string.ovulation_days_left_format, daysUntilOvulation),
                style = typography.ringSubtext,
                color = colors.textSecondary
            )
        }
    }
}

private fun getDayOrdinalSuffix(day: Int): String {
    return if (day in 11..13) {
        "th"
    } else when (day % 10) {
        1 -> "st"
        2 -> "nd"
        3 -> "rd"
        else -> "th"
    }
}

// ---------------------------------------------------------------------------
// Previews
// ---------------------------------------------------------------------------

@Preview(name = "CycleRing - Light Mode", showBackground = true, backgroundColor = 0xFFFFFFFF)
@Composable
private fun CycleRingPreviewLight() {
    LunariTheme(darkTheme = false) {
        CycleRing(
            currentDay = 4,
            cycleLength = 28,
            periodLength = 5,
            ovulationDay = 15
        )
    }
}

@Preview(name = "CycleRing - Dark Mode", showBackground = true, backgroundColor = 0xFF121417)
@Composable
private fun CycleRingPreviewDark() {
    LunariTheme(darkTheme = true) {
        CycleRing(
            currentDay = 4,
            cycleLength = 28,
            periodLength = 5,
            ovulationDay = 15
        )
    }
}

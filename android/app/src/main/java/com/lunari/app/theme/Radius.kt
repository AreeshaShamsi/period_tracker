package com.lunari.app.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Immutable
data class LunariRadius(
    val none: Dp = 0.dp,
    val small: Dp = 8.dp,
    val medium: Dp = 12.dp,
    val card: Dp = 20.dp,
    val large: Dp = 24.dp,
    val pill: Dp = 999.dp
) {
    val cardShape: Shape = RoundedCornerShape(card)
    val phaseCardShape: Shape = RoundedCornerShape(medium)
    val pillShape: Shape = RoundedCornerShape(pill)
    val badgeShape: Shape = RoundedCornerShape(small)
    val knobShape: Shape = RoundedCornerShape(pill)
}

val LocalRadius = LunariRadius()

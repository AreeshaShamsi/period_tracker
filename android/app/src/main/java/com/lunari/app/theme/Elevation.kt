package com.lunari.app.theme

import androidx.compose.runtime.Immutable
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Immutable
data class LunariElevation(
    val card: Dp = 2.dp,
    val bottomNav: Dp = 8.dp,
    val topBar: Dp = 0.dp,
    val knob: Dp = 4.dp
)

val LocalElevation = LunariElevation(
    card = 2.dp,
    bottomNav = 8.dp,
    topBar = 0.dp,
    knob = 4.dp
)

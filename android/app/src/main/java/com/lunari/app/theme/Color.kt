package com.lunari.app.theme

import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color

// Primary Lunari Brand Colors
val LunariPink = Color(0xFFFF4D80)
val LunariPinkDark = Color(0xFFE03368)
val LunariPinkLight = Color(0xFFFFF0F5)
val LunariPinkSubtle = Color(0xFFFFDDE6)

// Phase Accent Colors
val PeriodPink = Color(0xFFFF4D80)
val FollicularBlue = Color(0xFF0284C7)
val FollicularBlueLight = Color(0xFFE0F2FE)
val OvulationAmber = Color(0xFFFF9F1C)
val OvulationAmberLight = Color(0xFFFEF3C7)
val LutealPurple = Color(0xFF9333EA)
val LutealPurpleLight = Color(0xFFF3E8FF)

// Ring Colors
val RingTrack = Color(0xFFECEFF1)
val RingTrackDark = Color(0xFF2C3238)

// Neutral Colors
val White = Color(0xFFFFFFFF)
val Black = Color(0xFF000000)
val BackgroundLight = Color(0xFFF8F9FA)
val BackgroundDark = Color(0xFF121417)
val SurfaceLight = Color(0xFFFFFFFF)
val SurfaceDark = Color(0xFF1E2228)

val TextPrimaryLight = Color(0xFF1A1A1A)
val TextPrimaryDark = Color(0xFFF0F2F5)
val TextSecondaryLight = Color(0xFF757575)
val TextSecondaryDark = Color(0xFF9AA0A6)

// Navigation
val NavActive = LunariPink
val NavInactiveLight = Color(0xFF9E9E9E)
val NavInactiveDark = Color(0xFF6B7280)

@Immutable
data class LunariColors(
    val primary: Color,
    val onPrimary: Color,
    val primaryContainer: Color,
    val onPrimaryContainer: Color,
    val background: Color,
    val surface: Color,
    val onSurface: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val ringTrack: Color,
    val periodPink: Color,
    val follicularBlue: Color,
    val ovulationAmber: Color,
    val lutealPurple: Color,
    val navActive: Color,
    val navInactive: Color,
    val cardBackground: Color,
    val isDark: Boolean
)

val LightLunariColors = LunariColors(
    primary = LunariPink,
    onPrimary = White,
    primaryContainer = LunariPinkLight,
    onPrimaryContainer = LunariPinkDark,
    background = BackgroundLight,
    surface = SurfaceLight,
    onSurface = TextPrimaryLight,
    textPrimary = TextPrimaryLight,
    textSecondary = TextSecondaryLight,
    ringTrack = RingTrack,
    periodPink = PeriodPink,
    follicularBlue = FollicularBlue,
    ovulationAmber = OvulationAmber,
    lutealPurple = LutealPurple,
    navActive = NavActive,
    navInactive = NavInactiveLight,
    cardBackground = SurfaceLight,
    isDark = false
)

val DarkLunariColors = LunariColors(
    primary = LunariPink,
    onPrimary = White,
    primaryContainer = Color(0xFF3B1E29),
    onPrimaryContainer = LunariPinkLight,
    background = BackgroundDark,
    surface = SurfaceDark,
    onSurface = TextPrimaryDark,
    textPrimary = TextPrimaryDark,
    textSecondary = TextSecondaryDark,
    ringTrack = RingTrackDark,
    periodPink = PeriodPink,
    follicularBlue = Color(0xFF38BDF8),
    ovulationAmber = Color(0xFFFBBF24),
    lutealPurple = Color(0xFFA855F7),
    navActive = NavActive,
    navInactive = NavInactiveDark,
    cardBackground = SurfaceDark,
    isDark = true
)

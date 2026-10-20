package com.lunari.app.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf

val LocalLunariColors = staticCompositionLocalOf { LightLunariColors }
val LocalLunariTypography = staticCompositionLocalOf { LocalTypography }
val LocalLunariSpacing = staticCompositionLocalOf { LocalSpacing }
val LocalLunariRadius = staticCompositionLocalOf { LocalRadius }
val LocalLunariElevation = staticCompositionLocalOf { LocalElevation }

object LunariTheme {
    val colors: LunariColors
        @Composable
        @ReadOnlyComposable
        get() = LocalLunariColors.current

    val typography: LunariTypography
        @Composable
        @ReadOnlyComposable
        get() = LocalLunariTypography.current

    val spacing: LunariSpacing
        @Composable
        @ReadOnlyComposable
        get() = LocalLunariSpacing.current

    val radius: LunariRadius
        @Composable
        @ReadOnlyComposable
        get() = LocalLunariRadius.current

    val elevation: LunariElevation
        @Composable
        @ReadOnlyComposable
        get() = LocalLunariElevation.current
}

@Composable
fun LunariTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colors = if (darkTheme) DarkLunariColors else LightLunariColors
    val typography = LocalTypography
    val spacing = LocalSpacing
    val radius = LocalRadius
    val elevation = LocalElevation

    CompositionLocalProvider(
        LocalLunariColors provides colors,
        LocalLunariTypography provides typography,
        LocalLunariSpacing provides spacing,
        LocalLunariRadius provides radius,
        LocalLunariElevation provides elevation,
        content = content
    )
}

package com.lunari.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.lunari.app.R
import com.lunari.app.theme.FollicularBlue
import com.lunari.app.theme.LunariTheme
import com.lunari.app.theme.OvulationAmber
import com.lunari.app.theme.PeriodPink
import com.lunari.app.theme.White

/**
 * Reusable, stateless PhaseCard composable.
 *
 * @param phaseNumber Numeric index of the cycle phase (1, 2, 3, 4)
 * @param phaseName Name of the phase ("Menstrual", "Follicular", "Ovulation", "Luteal")
 * @param phaseColor Distinctive accent color for the badge and illustration tint
 * @param illustration Composable slot for the phase illustration/icon
 * @param modifier Composable modifier
 * @param onClick Optional callback when card is tapped
 */
@Composable
fun PhaseCard(
    phaseNumber: Int,
    phaseName: String,
    phaseColor: Color,
    illustration: @Composable () -> Unit,
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null
) {
    val typography = LunariTheme.typography
    val spacing = LunariTheme.spacing
    val radius = LunariTheme.radius
    val colors = LunariTheme.colors

    // Subtle light tinted surface background (adapts smoothly to dark mode)
    val cardBg = if (colors.isDark) {
        phaseColor.copy(alpha = 0.16f)
    } else {
        phaseColor.copy(alpha = 0.08f)
    }

    val a11yDesc = "Phase $phaseNumber: $phaseName"

    Card(
        shape = radius.phaseCardShape,
        colors = CardDefaults.cardColors(containerColor = cardBg),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        modifier = modifier
            .width(spacing.phaseCardWidth)
            .height(spacing.phaseCardHeight)
            .semantics {
                contentDescription = a11yDesc
                role = Role.Button
            }
            .then(
                if (onClick != null) {
                    Modifier.clickable(onClick = onClick)
                } else {
                    Modifier
                }
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(spacing.md)
        ) {
            // Header: Small numbered badge + phase name
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                // Numbered badge
                Box(
                    modifier = Modifier
                        .size(22.dp)
                        .background(color = phaseColor, shape = CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = phaseNumber.toString(),
                        style = typography.phaseNumber,
                        color = White
                    )
                }

                Spacer(modifier = Modifier.width(spacing.sm))

                // Phase name
                Text(
                    text = phaseName,
                    style = typography.phaseName,
                    color = colors.textPrimary,
                    maxLines = 1
                )
            }

            // Illustration centered below
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                illustration()
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Previews
// ---------------------------------------------------------------------------

@Preview(name = "PhaseCard - Menstrual (Light)", showBackground = true)
@Composable
private fun PhaseCardMenstrualPreviewLight() {
    LunariTheme(darkTheme = false) {
        PhaseCard(
            phaseNumber = 1,
            phaseName = "Menstrual",
            phaseColor = PeriodPink,
            illustration = {
                Icon(
                    painter = painterResource(id = R.drawable.ic_phase_menstrual),
                    contentDescription = null,
                    tint = Color.Unspecified,
                    modifier = Modifier.size(54.dp)
                )
            }
        )
    }
}

@Preview(name = "PhaseCard - Follicular (Dark)", showBackground = true, backgroundColor = 0xFF121417)
@Composable
private fun PhaseCardFollicularPreviewDark() {
    LunariTheme(darkTheme = true) {
        PhaseCard(
            phaseNumber = 2,
            phaseName = "Follicular",
            phaseColor = FollicularBlue,
            illustration = {
                Icon(
                    painter = painterResource(id = R.drawable.ic_phase_follicular),
                    contentDescription = null,
                    tint = Color.Unspecified,
                    modifier = Modifier.size(54.dp)
                )
            }
        )
    }
}

@Preview(name = "PhaseCard - Ovulation (Light)", showBackground = true)
@Composable
private fun PhaseCardOvulationPreviewLight() {
    LunariTheme(darkTheme = false) {
        PhaseCard(
            phaseNumber = 3,
            phaseName = "Ovulation",
            phaseColor = OvulationAmber,
            illustration = {
                Icon(
                    painter = painterResource(id = R.drawable.ic_phase_ovulation),
                    contentDescription = null,
                    tint = Color.Unspecified,
                    modifier = Modifier.size(54.dp)
                )
            }
        )
    }
}

package com.lunari.app.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.lunari.app.R
import com.lunari.app.theme.FollicularBlue
import com.lunari.app.theme.LutealPurple
import com.lunari.app.theme.LunariTheme
import com.lunari.app.theme.OvulationAmber
import com.lunari.app.theme.PeriodPink

data class PhaseItemData(
    val number: Int,
    val name: String,
    val color: Color,
    val illustrationRes: Int
)

/**
 * Reusable, stateless PhasesSection composable.
 *
 * Displays a white card with rounded corners and soft elevation containing:
 * 1. Header row: "Menstrual Cycle Phases" + pink right arrow
 * 2. Horizontally scrolling LazyRow of PhaseCards, with the 3rd card partially cut off to signify scrollability.
 *
 * @param onSeeAllPhasesClick Callback for the right arrow header action
 * @param onPhaseCardClick Callback when an individual phase card is clicked
 * @param modifier Composable modifier
 * @param phases Data list of cycle phases (Menstrual, Follicular, Ovulation, Luteal)
 */
@Composable
fun PhasesSection(
    onSeeAllPhasesClick: () -> Unit,
    onPhaseCardClick: (PhaseItemData) -> Unit,
    modifier: Modifier = Modifier,
    phases: List<PhaseItemData> = defaultPhasesList()
) {
    val colors = LunariTheme.colors
    val typography = LunariTheme.typography
    val spacing = LunariTheme.spacing
    val radius = LunariTheme.radius
    val elevation = LunariTheme.elevation

    Card(
        shape = radius.cardShape,
        colors = CardDefaults.cardColors(containerColor = colors.cardBackground),
        elevation = CardDefaults.cardElevation(defaultElevation = elevation.card),
        modifier = modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = spacing.lg)
        ) {
            // Header Row: "Menstrual Cycle Phases" + pink right arrow
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = spacing.lg)
            ) {
                Text(
                    text = stringResource(id = R.string.menstrual_cycle_phases_title),
                    style = typography.sectionHeader,
                    color = colors.textPrimary
                )

                IconButton(
                    onClick = onSeeAllPhasesClick,
                    modifier = Modifier
                        .size(spacing.minTouchTarget)
                        .semantics {
                            contentDescription = "View all menstrual cycle phases"
                        }
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_arrow_right),
                        contentDescription = stringResource(id = R.string.content_desc_arrow_right),
                        tint = colors.primary,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(spacing.sm))

            // Horizontally scrolling row of PhaseCards
            // With spacing.lg content padding and spacing.md item gap, the 3rd card is partially cut off on standard screens
            LazyRow(
                contentPadding = PaddingValues(horizontal = spacing.lg),
                horizontalArrangement = Arrangement.spacedBy(spacing.md),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(phases, key = { it.number }) { phase ->
                    PhaseCard(
                        phaseNumber = phase.number,
                        phaseName = phase.name,
                        phaseColor = phase.color,
                        illustration = {
                            Icon(
                                painter = painterResource(id = phase.illustrationRes),
                                contentDescription = null,
                                tint = Color.Unspecified,
                                modifier = Modifier.size(52.dp)
                            )
                        },
                        onClick = { onPhaseCardClick(phase) }
                    )
                }
            }
        }
    }
}

/**
 * Default phases list:
 * 1. Menstrual (pink)
 * 2. Follicular (blue)
 * 3. Ovulation (amber)
 * 4. Luteal (purple)
 */
fun defaultPhasesList(): List<PhaseItemData> = listOf(
    PhaseItemData(
        number = 1,
        name = "Menstrual",
        color = PeriodPink,
        illustrationRes = R.drawable.ic_phase_menstrual
    ),
    PhaseItemData(
        number = 2,
        name = "Follicular",
        color = FollicularBlue,
        illustrationRes = R.drawable.ic_phase_follicular
    ),
    PhaseItemData(
        number = 3,
        name = "Ovulation",
        color = OvulationAmber,
        illustrationRes = R.drawable.ic_phase_ovulation
    ),
    PhaseItemData(
        number = 4,
        name = "Luteal",
        color = LutealPurple,
        illustrationRes = R.drawable.ic_phase_luteal
    )
)

// ---------------------------------------------------------------------------
// Previews
// ---------------------------------------------------------------------------

@Preview(name = "PhasesSection - Light Mode", showBackground = true, backgroundColor = 0xFFF8F9FA)
@Composable
private fun PhasesSectionPreviewLight() {
    LunariTheme(darkTheme = false) {
        PhasesSection(
            onSeeAllPhasesClick = {},
            onPhaseCardClick = {},
            modifier = Modifier.padding(16.dp)
        )
    }
}

@Preview(name = "PhasesSection - Dark Mode", showBackground = true, backgroundColor = 0xFF121417)
@Composable
private fun PhasesSectionPreviewDark() {
    LunariTheme(darkTheme = true) {
        PhasesSection(
            onSeeAllPhasesClick = {},
            onPhaseCardClick = {},
            modifier = Modifier.padding(16.dp)
        )
    }
}

package com.lunari.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.lunari.app.R
import com.lunari.app.theme.LunariTheme
import com.lunari.app.ui.components.CycleRing
import com.lunari.app.ui.components.LunariBottomNavBar
import com.lunari.app.ui.components.LunariNavItem
import com.lunari.app.ui.components.PhaseItemData
import com.lunari.app.ui.components.PhasesSection

/**
 * Lunari Home Screen UI State.
 */
data class HomeUiState(
    val currentDay: Int = 4,
    val cycleLength: Int = 28,
    val periodLength: Int = 5,
    val ovulationDay: Int = 15,
    val selectedNavItem: LunariNavItem = LunariNavItem.Home
)

/**
 * Stateful entry composable for Lunari Home Screen.
 */
@Composable
fun HomeScreen(
    modifier: Modifier = Modifier,
    onEditPeriodClick: () -> Unit = {},
    onSeeAllPhasesClick: () -> Unit = {},
    onPhaseClick: (PhaseItemData) -> Unit = {},
    onOverflowMenuClick: () -> Unit = {}
) {
    var uiState by remember { mutableStateOf(HomeUiState()) }

    HomeScreenContent(
        uiState = uiState,
        onEditPeriodClick = onEditPeriodClick,
        onSeeAllPhasesClick = onSeeAllPhasesClick,
        onPhaseClick = onPhaseClick,
        onOverflowMenuClick = onOverflowMenuClick,
        onNavItemSelect = { newTab -> uiState = uiState.copy(selectedNavItem = newTab) },
        modifier = modifier
    )
}

/**
 * Stateless Home Screen content composable conforming strictly to:
 * 1. Status bar area (system).
 * 2. Top App Bar: left circular pink logo icon, centered title "Lunari", right vertical 3-dot overflow menu.
 * 3. Cycle Card (white, radius.card, soft elevation): contains CycleRing, then pill-shaped "Edit Period" button.
 * 4. Phases Card (white, radius.card): header row with "Menstrual Cycle Phases" + pink right arrow,
 *    and horizontally scrolling LazyRow of PhaseCard items (3rd card partially cut off).
 * 5. Bottom Navigation Bar (5 items): Home, Calendar, Tracker, Articles, Account.
 */
@Composable
fun HomeScreenContent(
    uiState: HomeUiState,
    onEditPeriodClick: () -> Unit,
    onSeeAllPhasesClick: () -> Unit,
    onPhaseClick: (PhaseItemData) -> Unit,
    onOverflowMenuClick: () -> Unit,
    onNavItemSelect: (LunariNavItem) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LunariTheme.colors
    val typography = LunariTheme.typography
    val spacing = LunariTheme.spacing
    val radius = LunariTheme.radius
    val elevation = LunariTheme.elevation

    Scaffold(
        topBar = {
            LunariTopAppBar(
                onOverflowClick = onOverflowMenuClick
            )
        },
        bottomBar = {
            LunariBottomNavBar(
                selectedItem = uiState.selectedNavItem,
                onItemSelected = onNavItemSelect
            )
        },
        containerColor = colors.background,
        modifier = modifier
            .fillMaxSize()
            .statusBarsPadding()
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = spacing.lg, vertical = spacing.md)
        ) {
            // 3. Cycle Card (white, radius.card, soft elevation)
            Card(
                shape = radius.cardShape,
                colors = CardDefaults.cardColors(containerColor = colors.cardBackground),
                elevation = CardDefaults.cardElevation(defaultElevation = elevation.card),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = spacing.lg, vertical = spacing.xl)
                ) {
                    // COMPONENT 1: CycleRing
                    CycleRing(
                        currentDay = uiState.currentDay,
                        cycleLength = uiState.cycleLength,
                        periodLength = uiState.periodLength,
                        ovulationDay = uiState.ovulationDay,
                        modifier = Modifier.align(Alignment.CenterHorizontally)
                    )

                    Spacer(modifier = Modifier.height(spacing.xl))

                    // Pill-shaped "Edit Period" button (primary fill, onPrimary text)
                    Button(
                        onClick = onEditPeriodClick,
                        shape = radius.pillShape,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = colors.primary,
                            contentColor = colors.onPrimary
                        ),
                        contentPadding = PaddingValues(horizontal = 32.dp, vertical = 12.dp),
                        modifier = Modifier
                            .heightIn(min = spacing.minTouchTarget)
                            .semantics {
                                contentDescription = "Edit period logs and dates"
                            }
                    ) {
                        Text(
                            text = stringResource(id = R.string.edit_period_button),
                            style = typography.button,
                            color = colors.onPrimary
                        )
                    }
                }
            }

            // 16dp spacing between cards
            Spacer(modifier = Modifier.height(spacing.lg))

            // 4. Phases Card (white, radius.card, soft elevation)
            PhasesSection(
                onSeeAllPhasesClick = onSeeAllPhasesClick,
                onPhaseCardClick = onPhaseClick
            )

            // Bottom spacer for comfortable scroll padding
            Spacer(modifier = Modifier.height(spacing.xl))
        }
    }
}

/**
 * Top App Bar:
 * - Left circular pink logo icon
 * - Centered title "Lunari"
 * - Right vertical 3-dot overflow menu
 * - Touch targets >= 48dp
 */
@Composable
fun LunariTopAppBar(
    onOverflowClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LunariTheme.colors
    val typography = LunariTheme.typography
    val spacing = LunariTheme.spacing

    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
        modifier = modifier
            .fillMaxWidth()
            .height(56.dp)
            .background(colors.background)
            .padding(horizontal = spacing.sm)
    ) {
        // Left: Circular pink logo icon
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(spacing.minTouchTarget)
                .semantics {
                    contentDescription = "Lunari App Logo"
                }
        ) {
            Icon(
                painter = painterResource(id = R.drawable.ic_lunari_logo),
                contentDescription = stringResource(id = R.string.content_desc_logo),
                tint = colors.primary,
                modifier = Modifier.size(36.dp)
            )
        }

        // Center: Centered title "Lunari"
        Text(
            text = stringResource(id = R.string.app_name),
            style = typography.topBarTitle,
            color = colors.textPrimary,
            textAlign = TextAlign.Center,
            modifier = Modifier.weight(1f)
        )

        // Right: Vertical 3-dot overflow menu
        IconButton(
            onClick = onOverflowClick,
            modifier = Modifier
                .size(spacing.minTouchTarget)
                .semantics {
                    contentDescription = "More menu options"
                }
        ) {
            Icon(
                painter = painterResource(id = R.drawable.ic_more_vert),
                contentDescription = stringResource(id = R.string.content_desc_menu),
                tint = colors.textPrimary,
                modifier = Modifier.size(24.dp)
            )
        }
    }
}

// ---------------------------------------------------------------------------
// Previews
// ---------------------------------------------------------------------------

@Preview(name = "HomeScreen - Light Mode", showBackground = true, device = "id:pixel_7")
@Composable
private fun HomeScreenPreviewLight() {
    LunariTheme(darkTheme = false) {
        HomeScreenContent(
            uiState = HomeUiState(),
            onEditPeriodClick = {},
            onSeeAllPhasesClick = {},
            onPhaseClick = {},
            onOverflowMenuClick = {},
            onNavItemSelect = {}
        )
    }
}

@Preview(name = "HomeScreen - Dark Mode", showBackground = true, device = "id:pixel_7")
@Composable
private fun HomeScreenPreviewDark() {
    LunariTheme(darkTheme = true) {
        HomeScreenContent(
            uiState = HomeUiState(),
            onEditPeriodClick = {},
            onSeeAllPhasesClick = {},
            onPhaseClick = {},
            onOverflowMenuClick = {},
            onNavItemSelect = {}
        )
    }
}

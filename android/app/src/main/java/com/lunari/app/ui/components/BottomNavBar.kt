package com.lunari.app.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.material.ripple.rememberRipple
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.lunari.app.R
import com.lunari.app.theme.LunariTheme

enum class LunariNavItem(
    val titleRes: Int,
    val iconRes: Int
) {
    Home(R.string.nav_home, R.drawable.ic_nav_home),
    Calendar(R.string.nav_calendar, R.drawable.ic_nav_calendar),
    Tracker(R.string.nav_tracker, R.drawable.ic_nav_tracker),
    Articles(R.string.nav_articles, R.drawable.ic_nav_articles),
    Account(R.string.nav_account, R.drawable.ic_nav_account)
}

/**
 * Reusable, stateless Bottom Navigation Bar for Lunari.
 *
 * @param selectedItem Currently active navigation item
 * @param onItemSelected Callback when an item is selected
 * @param modifier Composable modifier
 */
@Composable
fun LunariBottomNavBar(
    selectedItem: LunariNavItem,
    onItemSelected: (LunariNavItem) -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = LunariTheme.colors
    val typography = LunariTheme.typography
    val spacing = LunariTheme.spacing
    val elevation = LunariTheme.elevation

    Surface(
        color = colors.surface,
        shadowElevation = elevation.bottomNav,
        modifier = modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .height(64.dp)
                .selectableGroup(),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            LunariNavItem.values().forEach { item ->
                val isSelected = item == selectedItem
                val itemTitle = stringResource(id = item.titleRes)
                val itemColor = if (isSelected) colors.navActive else colors.navInactive

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                    modifier = Modifier
                        .weight(1f)
                        .height(spacing.minTouchTarget)
                        .selectable(
                            selected = isSelected,
                            onClick = { onItemSelected(item) },
                            role = Role.Tab,
                            interactionSource = remember { MutableInteractionSource() },
                            indication = rememberRipple(bounded = false, radius = 24.dp)
                        )
                        .semantics {
                            contentDescription = itemTitle
                            selected = isSelected
                        }
                ) {
                    Icon(
                        painter = painterResource(id = item.iconRes),
                        contentDescription = null,
                        tint = itemColor,
                        modifier = Modifier.size(24.dp)
                    )

                    Spacer(modifier = Modifier.height(2.dp))

                    Text(
                        text = itemTitle,
                        style = typography.navLabel,
                        color = itemColor
                    )
                }
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Previews
// ---------------------------------------------------------------------------

@Preview(name = "BottomNavBar - Light", showBackground = true)
@Composable
private fun BottomNavBarPreviewLight() {
    LunariTheme(darkTheme = false) {
        LunariBottomNavBar(
            selectedItem = LunariNavItem.Home,
            onItemSelected = {}
        )
    }
}

@Preview(name = "BottomNavBar - Dark", showBackground = true, backgroundColor = 0xFF121417)
@Composable
private fun BottomNavBarPreviewDark() {
    LunariTheme(darkTheme = true) {
        LunariBottomNavBar(
            selectedItem = LunariNavItem.Home,
            onItemSelected = {}
        )
    }
}

package com.lunari.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.lunari.app.theme.LunariTheme
import com.lunari.app.ui.screens.HomeScreen

/**
 * Main Android entry point for Lunari.
 * Launches the new Lunari HomeScreen composable wrapped in LunariTheme.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            LunariTheme {
                HomeScreen()
            }
        }
    }
}

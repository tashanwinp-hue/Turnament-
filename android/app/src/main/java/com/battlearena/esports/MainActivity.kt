package com.battlearena.esports

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.battlearena.esports.data.TournamentRepository
import com.battlearena.esports.model.Tournament

class MainActivity : ComponentActivity() {
    private val repository = TournamentRepository()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            BattleArenaApp(repository)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BattleArenaApp(repository: TournamentRepository) {
    var selectedTab by remember { mutableIntStateOf(0) }
    val tournaments by repository.getTournamentsFlow().collectAsState(initial = emptyList())

    val darkBg = Color(0xFF09090B)
    val cardBg = Color(0xFF18181B)
    val amberAccent = Color(0xFFF59E0B)

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "BATTLE ARENA",
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White,
                            fontSize = 20.sp
                        )
                        Text(
                            text = "Free Fire BR & CS Esports",
                            color = Color(0xFFA1A1AA),
                            fontSize = 11.sp
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF09090B))
            )
        },
        bottomBar = {
            NavigationBar(containerColor = Color(0xFF09090B)) {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    label = { Text("Matches", fontSize = 11.sp) },
                    icon = { Text("⚔️") }
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    label = { Text("My Matches", fontSize = 11.sp) },
                    icon = { Text("📋") }
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    label = { Text("Leaderboard", fontSize = 11.sp) },
                    icon = { Text("🏆") }
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    label = { Text("Admin", fontSize = 11.sp) },
                    icon = { Text("👑") }
                )
            }
        },
        containerColor = darkBg
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .background(darkBg)
        ) {
            when (selectedTab) {
                0 -> TournamentsListScreen(tournaments = tournaments)
                1 -> MyMatchesPlaceholderScreen()
                2 -> LeaderboardPlaceholderScreen()
                3 -> AdminScreen(isAdmin = repository.isCurrentUserAdmin())
            }
        }
    }
}

@Composable
fun TournamentsListScreen(tournaments: List<Tournament>) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        items(tournaments) { tournament ->
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF18181B)),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            color = if (tournament.mode == "br") Color(0x33F97316) else Color(0x3306B6D4),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = "FF ${tournament.mode.uppercase()} • ${tournament.format.uppercase()}",
                                color = if (tournament.mode == "br") Color(0xFFFB923C) else Color(0xFF22D3EE),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }

                        Text(
                            text = tournament.status.replace("_", " ").uppercase(),
                            color = Color(0xFFF59E0B),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = tournament.title,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        fontSize = 16.sp
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Map: ${tournament.map}",
                            color = Color(0xFFA1A1AA),
                            fontSize = 12.sp
                        )
                        Text(
                            text = "Slots: ${tournament.registeredCount}/${tournament.maxSlots}",
                            color = Color(0xFFE4E4E7),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Prize: ${tournament.prizePool}",
                            color = Color(0xFFF59E0B),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Button(
                            onClick = { /* Open registration */ },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B)),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                        ) {
                            Text(text = "Join Free", color = Color.Black, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun MyMatchesPlaceholderScreen() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("Your registered tournaments and room IDs will appear here", color = Color(0xFFA1A1AA), fontSize = 13.sp)
    }
}

@Composable
fun LeaderboardPlaceholderScreen() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("Tournament Leaderboards and Booyah Winners", color = Color(0xFFA1A1AA), fontSize = 13.sp)
    }
}

@Composable
fun AdminScreen(isAdmin: Boolean) {
    Box(modifier = Modifier.fillMaxSize().padding(16.dp), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("Admin Controls", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                if (isAdmin) "Authorized as ranjeetraj10100@gmail.com" else "Access restricted to ranjeetraj10100@gmail.com",
                color = if (isAdmin) Color(0xFF10B981) else Color(0xFFEF4444),
                fontSize = 12.sp
            )
        }
    }
}

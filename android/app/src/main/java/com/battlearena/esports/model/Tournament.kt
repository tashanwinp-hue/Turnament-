package com.battlearena.esports.model

data class Tournament(
    val id: String = "",
    val title: String = "",
    val game: String = "free_fire",
    val mode: String = "br", // "br" or "cs"
    val format: String = "squad", // "solo", "duo", "squad"
    val map: String = "Bermuda",
    val entryFee: Double = 0.0,
    val prizePool: String = "",
    val maxSlots: Int = 12,
    val registeredCount: Int = 0,
    val scheduleTime: String = "",
    val status: String = "open", // upcoming, open, room_released, live, completed
    val roomId: String? = null,
    val roomPassword: String? = null,
    val rules: String = "",
    val createdBy: String = "",
    val createdAt: String = "",
    val updatedAt: String = ""
)

data class Registration(
    val id: String = "",
    val tournamentId: String = "",
    val userId: String = "",
    val userEmail: String = "",
    val playerName: String = "",
    val freeFireUid: String = "",
    val inGameName: String = "",
    val teamName: String? = null,
    val teammates: String? = null,
    val registeredAt: String = "",
    val slotNumber: Int = 1,
    val status: String = "confirmed"
)

data class MatchResult(
    val id: String = "",
    val tournamentId: String = "",
    val rank: Int = 1,
    val participantName: String = "",
    val teamName: String? = null,
    val freeFireUid: String = "",
    val kills: Int = 0,
    val placementPoints: Int = 0,
    val killPoints: Int = 0,
    val totalPoints: Int = 0,
    val isWinner: Boolean = false
)

data class UserProfile(
    val userId: String = "",
    val email: String = "",
    val displayName: String = "",
    val freeFireUid: String = "",
    val inGameName: String = "",
    val matchesPlayed: Int = 0,
    val totalKills: Int = 0,
    val booyahs: Int = 0
)

package com.battlearena.esports.data

import com.battlearena.esports.model.Tournament
import com.battlearena.esports.model.Registration
import com.battlearena.esports.model.MatchResult
import com.battlearena.esports.model.UserProfile
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class TournamentRepository(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance(),
    private val auth: FirebaseAuth = FirebaseAuth.getInstance()
) {
    companion object {
        const val ADMIN_EMAIL = "ranjeetraj10100@gmail.com"
        const val TOURNAMENTS_COL = "tournaments"
        const val USERS_COL = "users"
    }

    fun isCurrentUserAdmin(): Boolean {
        val email = auth.currentUser?.email ?: return false
        return email.equals(ADMIN_EMAIL, ignoreCase = true)
    }

    fun getTournamentsFlow(): Flow<List<Tournament>> = callbackFlow {
        val listener = firestore.collection(TOURNAMENTS_COL)
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val list = snapshot?.toObjects(Tournament::class.java) ?: emptyList()
                trySend(list)
            }
        awaitClose { listener.remove() }
    }

    suspend fun registerForTournament(
        tournamentId: String,
        playerName: String,
        freeFireUid: String,
        inGameName: String,
        teamName: String?
    ): Result<Registration> {
        val user = auth.currentUser ?: return Result.failure(Exception("User not authenticated"))
        val tournamentRef = firestore.collection(TOURNAMENTS_COL).document(tournamentId)
        val regsRef = tournamentRef.collection("registrations")

        return try {
            firestore.runTransaction { transaction ->
                val snapshot = transaction.get(tournamentRef)
                val currentCount = snapshot.getLong("registeredCount") ?: 0
                val maxSlots = snapshot.getLong("maxSlots") ?: 48
                val status = snapshot.getString("status") ?: "open"

                if (status != "open") throw Exception("Tournament is not open for registration")
                if (currentCount >= maxSlots) throw Exception("Tournament slots are full")

                val regId = "${tournamentId}_${user.uid}"
                val regDoc = regsRef.document(regId)
                val nextSlot = (currentCount + 1).toInt()

                val newReg = Registration(
                    id = regId,
                    tournamentId = tournamentId,
                    userId = user.uid,
                    userEmail = user.email ?: "",
                    playerName = playerName,
                    freeFireUid = freeFireUid,
                    inGameName = inGameName,
                    teamName = teamName,
                    slotNumber = nextSlot,
                    status = "confirmed"
                )

                transaction.set(regDoc, newReg)
                transaction.update(tournamentRef, "registeredCount", nextSlot)
                newReg
            }.await().let { Result.success(it) }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateRoomCredentials(tournamentId: String, roomId: String, roomPass: String): Result<Unit> {
        if (!isCurrentUserAdmin()) return Result.failure(Exception("Unauthorized admin access"))
        return try {
            firestore.collection(TOURNAMENTS_COL).document(tournamentId).update(
                mapOf(
                    "roomId" to roomId,
                    "roomPassword" to roomPass,
                    "status" to "room_released"
                )
            ).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

package com.battlearena.esports

import android.app.Application
import com.google.firebase.FirebaseApp

class BattleArenaApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        FirebaseApp.initializeApp(this)
    }
}

# BATTLE ARENA - Android Esports Tournament App

Complete esports tournament platform for **Free Fire Battle Royale (BR)** and **Clash Squad (CS)**, supporting Solo, Duo, and Squad formats.

---

## 📱 Quick Start on an Android Phone (2 Options)

### Option 1: Instant Android Install (Zero Setup)
You can run Battle Arena directly on your Android phone right now as a Progressive Web App (PWA) with native full-screen experience:
1. Open Google Chrome on your Android phone.
2. Go to your Battle Arena App URL:
   `https://ais-dev-nawfi4j6gw23bapts5bc4q-213601160729.asia-southeast1.run.app`
3. Tap the **Three Dots Menu (⋮)** at the top right of Chrome.
4. Tap **"Install app"** or **"Add to Home screen"**.
5. The Battle Arena icon will appear on your phone's launcher like a native Android app!

---

### Option 2: Build Native APK with Android Studio & Jetpack Compose
The `/android` directory contains the full native Android project built with **Kotlin** and **Jetpack Compose**.

#### Step 1: Open the Project
1. Download or clone this repository to your computer.
2. Open **Android Studio** (recommended: Hedgehog, Iguana, Ladybug or newer).
3. Click **Open** and select the `/android` directory.
4. Wait for Gradle Sync to complete.

#### Step 2: Firebase Configuration
- The `android/app/google-services.json` file is already pre-configured for your active Firebase project (`model-karma-nxjsq`).
- If you use your own Firebase project in the future:
  1. Open [Firebase Console](https://console.firebase.google.com).
  2. Add an Android app with package name: `com.battlearena.esports`.
  3. Download `google-services.json` and replace `android/app/google-services.json`.

#### Step 3: Run on Android Phone
1. On your phone: Go to **Settings > About Phone** and tap **Build Number** 7 times to enable **Developer Options**.
2. Go to **Settings > Developer Options** and enable **USB Debugging**.
3. Plug your phone into your computer via USB.
4. In Android Studio, select your physical phone from the device dropdown at the top toolbar.
5. Click the green **Run (▶)** button. The APK will compile, install, and open on your phone!

---

## 👑 Admin Authorization & Access
- **Authorized Owner-Admin:** `ranjeetraj10100@gmail.com`
- Only this authorized email can create tournaments, change match statuses, release Custom Room IDs and passwords, and submit official match kill/placement points.
- Free entry is enabled by default. Cash deposits and paid entry tournaments remain disabled pending legal and payment gateway compliance.

---

## 🎮 Free Fire Tournament Formats
- **Battle Royale (BR):**
  - Solo: 48 players
  - Duo: 24 teams (48 players)
  - Squad: 12 teams (48 players)
  - Maps: Bermuda, Purgatory, Kalahari, Alpine
  - Points: 1st place Booyah (12 pts), 2nd (9 pts), 3rd (8 pts)... + 1 pt per kill.
- **Clash Squad (CS):**
  - 4v4 Squad, 2v2 Duo, 1v1 Solo
  - Fast-paced round-based matches
  - Match winner: 10 placement points + 1 pt per kill.

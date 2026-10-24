import React from 'react';
import { X, Smartphone, Download, Settings, Key, CheckCircle2, Terminal, Shield } from 'lucide-react';
import { ADMIN_EMAIL } from '../firebase.ts';

interface AndroidSetupGuideModalProps {
  onClose: () => void;
}

export const AndroidSetupGuideModal: React.FC<AndroidSetupGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl text-white font-bold leading-none">
                ANDROID SETUP & INSTALLATION GUIDE
              </h2>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Beginner-friendly steps to run Battle Arena on an Android smartphone
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-zinc-300">
          {/* Method 1: Instant PWA Install on Android Phone */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Download className="w-4 h-4" />
              <span>Option 1: Instant App Install on Android (No Coding Required)</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              You can install and test Battle Arena right now on any Android smartphone:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-zinc-300 pl-1">
              <li>
                Open Chrome or Brave browser on your Android phone and navigate to the application URL:
                <div className="my-1 p-2 bg-zinc-900 rounded font-mono text-[10px] text-amber-300 select-all">
                  https://ais-dev-nawfi4j6gw23bapts5bc4q-213601160729.asia-southeast1.run.app
                </div>
              </li>
              <li>Tap the <strong>three dots menu (⋮)</strong> at the top-right of Chrome.</li>
              <li>Select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</li>
              <li>Battle Arena will appear on your phone home screen with full-screen Android gaming experience!</li>
            </ol>
          </div>

          {/* Method 2: Native Kotlin Jetpack Compose Android Studio Build */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Terminal className="w-4 h-4" />
              <span>Option 2: Native Kotlin Jetpack Compose Build (APK)</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              We have generated the full Kotlin Jetpack Compose Android codebase in the <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-amber-400">/android</code> directory:
            </p>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center shrink-0 text-[10px]">1</span>
                <div>
                  <strong>Open in Android Studio:</strong> Open the <code className="bg-zinc-900 px-1 rounded text-zinc-200">/android</code> project folder in Android Studio (Giraffe, Hedgehog, or newer).
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center shrink-0 text-[10px]">2</span>
                <div>
                  <strong>Firebase Services:</strong> The <code className="bg-zinc-900 px-1 rounded text-zinc-200">google-services.json</code> configuration file is pre-configured for Firebase project <code className="text-amber-400">model-karma-nxjsq</code> under <code className="bg-zinc-900 px-1 rounded text-zinc-200">/android/app/google-services.json</code>.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center shrink-0 text-[10px]">3</span>
                <div>
                  <strong>Build & Run:</strong> Connect your Android phone with a USB cable (enable USB Debugging in Developer Options), then click <strong>Run &gt; Run &apos;app&apos;</strong> in Android Studio.
                </div>
              </div>
            </div>
          </div>

          {/* Testing Credentials Note */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-zinc-200 font-bold text-xs">
              <Shield className="w-4 h-4 text-amber-500" />
              <span>Admin Credentials & Testing Roles</span>
            </div>
            <ul className="space-y-1 text-[11px] text-zinc-400">
              <li>• <strong>Owner-Admin Email:</strong> <code className="text-amber-300">{ADMIN_EMAIL}</code></li>
              <li>• You can use the top-right profile button in the app to switch between <strong>Player</strong> (for slot bookings and room ID reception) and <strong>Owner-Admin</strong> (for tournament creation, room release, and match scoring).</li>
              <li>• <strong>Free Fire UID Format:</strong> Enter any 8 to 12 digit number (e.g. 1098234155).</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all"
          >
            Got it, Let&apos;s Play
          </button>
        </div>
      </div>
    </div>
  );
};

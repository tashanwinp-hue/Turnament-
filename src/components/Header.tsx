import React, { useState } from 'react';
import { Flame, Shield, User, HelpCircle, LogOut, CheckCircle2, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { ADMIN_EMAIL } from '../firebase.ts';

interface HeaderProps {
  onOpenAndroidGuide: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAndroidGuide, onOpenProfile }) => {
  const { currentUser, isAdmin, simulateLoginAs, signOut, signInWithGoogle } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <header className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Flame className="w-5 h-5 text-black fill-black" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-heading text-2xl tracking-wider text-white font-bold leading-none">
              BATTLE ARENA
            </h1>
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded tracking-wider uppercase">
              FF ESPORTS
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-subheading tracking-wide">
            BR & Clash Squad Tournaments
          </p>
        </div>
      </div>

      {/* Right Controls: Android Guide, Role Switcher / Profile */}
      <div className="flex items-center gap-2">
        {/* Android Guide Button */}
        <button
          onClick={onOpenAndroidGuide}
          className="flex items-center gap-1 text-xs bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-zinc-700/60 transition-colors"
          title="Android Phone Installation Guide"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Phone Setup</span>
        </button>

        {/* User / Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-medium ${
              isAdmin
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                : 'bg-zinc-800/90 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            {isAdmin ? (
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            ) : (
              <User className="w-3.5 h-3.5 text-zinc-300" />
            )}
            <span className="max-w-[100px] truncate">
              {currentUser?.displayName || 'Player'}
            </span>
            {isAdmin && (
              <span className="text-[9px] bg-amber-500 text-black font-extrabold px-1 rounded uppercase">
                ADMIN
              </span>
            )}
          </button>

          {/* Quick Dropdown Menu */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl p-2 z-50 text-xs">
              <div className="px-2.5 py-2 border-b border-zinc-800 mb-2">
                <div className="font-semibold text-zinc-100 flex items-center justify-between">
                  <span>{currentUser?.displayName || 'Player'}</span>
                  {isAdmin && <span className="text-[10px] text-amber-400 font-bold">OWNER</span>}
                </div>
                <div className="text-[11px] text-zinc-400 truncate">{currentUser?.email}</div>
              </div>

              {/* Role Toggle Switch for Testing */}
              <div className="px-2 py-1 text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
                Switch Test Role
              </div>

              <button
                onClick={() => {
                  simulateLoginAs(ADMIN_EMAIL, 'Admin Owner');
                  setShowRoleMenu(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                  isAdmin ? 'bg-amber-500/20 text-amber-300' : 'hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <div>
                    <div className="font-semibold">Owner Admin</div>
                    <div className="text-[10px] text-zinc-400">{ADMIN_EMAIL}</div>
                  </div>
                </div>
                {isAdmin && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              <button
                onClick={() => {
                  simulateLoginAs('raistar.ff@battlearena.gg', 'RaiStar_FF');
                  setShowRoleMenu(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors ${
                  !isAdmin ? 'bg-amber-500/20 text-amber-300' : 'hover:bg-zinc-800 text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <div>
                    <div className="font-semibold">Tournament Player</div>
                    <div className="text-[10px] text-zinc-400">RaiStar_FF (UID: 1098234155)</div>
                  </div>
                </div>
                {!isAdmin && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              <div className="border-t border-zinc-800 my-1 pt-1">
                <button
                  onClick={() => {
                    signInWithGoogle().catch(console.error);
                    setShowRoleMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-3.5 h-3.5" />
                  <span>Google Sign-In</span>
                </button>

                <button
                  onClick={() => {
                    onOpenProfile();
                    setShowRoleMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span>View Player Profile</span>
                </button>

                <button
                  onClick={() => {
                    signOut();
                    setShowRoleMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

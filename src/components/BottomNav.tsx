import React from 'react';
import { Swords, Trophy, User, ShieldAlert, CalendarCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export type NavTab = 'tournaments' | 'my_matches' | 'leaderboard' | 'profile' | 'admin';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  registeredCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, registeredCount }) => {
  const { isAdmin } = useAuth();

  const tabs: Array<{ id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; adminOnly?: boolean }> = [
    { id: 'tournaments', label: 'Matches', icon: Swords },
    { id: 'my_matches', label: 'My Matches', icon: CalendarCheck, badge: registeredCount > 0 ? registeredCount : undefined },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'admin', label: 'Admin', icon: ShieldAlert, adminOnly: true },
  ];

  return (
    <nav className="bg-zinc-950/95 border-t border-zinc-800/80 px-2 py-2 flex items-center justify-around sticky bottom-0 z-40 backdrop-blur-md">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        const isSpecialAdmin = tab.id === 'admin';

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive
                ? isSpecialAdmin
                  ? 'text-amber-400 bg-amber-500/15 font-semibold'
                  : 'text-amber-400 bg-zinc-900 font-semibold'
                : isSpecialAdmin
                ? 'text-amber-500/70 hover:text-amber-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              {tab.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-black font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-1 tracking-tight">
              {tab.label}
              {isSpecialAdmin && !isAdmin && ' (Demo)'}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

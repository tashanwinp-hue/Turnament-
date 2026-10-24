import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  signInWithCustomToken,
} from 'firebase/auth';
import { auth, googleProvider, ADMIN_EMAIL } from '../firebase.ts';
import { AuthUser, UserProfile } from '../types/tournament.ts';
import { getUserProfile, upsertUserProfile } from '../services/tournamentService.ts';

interface AuthContextType {
  currentUser: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  simulateLoginAs: (email: string, displayName: string, uid?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync profile when user changes
  const loadProfile = async (uid: string, email: string, name: string) => {
    try {
      let profile = await getUserProfile(uid);
      if (!profile) {
        await upsertUserProfile({
          userId: uid,
          email,
          displayName: name,
          freeFireUid: '1098234155',
          inGameName: name.replace(/\s+/g, '_'),
          matchesPlayed: 4,
          totalKills: 18,
          booyahs: 2,
        });
        profile = await getUserProfile(uid);
      }
      setUserProfile(profile);
    } catch (e) {
      console.warn('Profile sync note:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const isAdmin = (firebaseUser.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();
        const userObj: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Player',
          photoURL: firebaseUser.photoURL,
          isAdmin,
        };
        setCurrentUser(userObj);
        await loadProfile(userObj.uid, userObj.email || '', userObj.displayName || 'Player');
      } else {
        // If not authenticated via real Firebase Auth yet, check if there was a local session saved
        const savedSession = localStorage.getItem('battle_arena_active_user');
        if (savedSession) {
          try {
            const parsed = JSON.parse(savedSession) as AuthUser;
            setCurrentUser(parsed);
            await loadProfile(parsed.uid, parsed.email || '', parsed.displayName || 'Player');
          } catch {
            setCurrentUser(null);
          }
        } else {
          // Default start as authenticated demo gamer for immediate testing
          const defaultUser: AuthUser = {
            uid: 'player_raistar_99',
            email: 'raistar.ff@battlearena.gg',
            displayName: 'RaiStar_FF',
            isAdmin: false,
          };
          setCurrentUser(defaultUser);
          localStorage.setItem('battle_arena_active_user', JSON.stringify(defaultUser));
          await loadProfile(defaultUser.uid, defaultUser.email || '', defaultUser.displayName || 'Player');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      const firebaseUser = res.user;
      const isAdmin = (firebaseUser.email || '').toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const userObj: AuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'Gamer',
        photoURL: firebaseUser.photoURL,
        isAdmin,
      };
      setCurrentUser(userObj);
      localStorage.setItem('battle_arena_active_user', JSON.stringify(userObj));
      await loadProfile(userObj.uid, userObj.email || '', userObj.displayName || 'Gamer');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const simulateLoginAs = async (email: string, displayName: string, customUid?: string) => {
    setLoading(true);
    const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const uid = customUid || (isAdmin ? 'admin_owner_ranjeet' : `player_${displayName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`);
    const userObj: AuthUser = {
      uid,
      email,
      displayName,
      isAdmin,
    };
    setCurrentUser(userObj);
    localStorage.setItem('battle_arena_active_user', JSON.stringify(userObj));
    await loadProfile(uid, email, displayName);
    setLoading(false);
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
    localStorage.removeItem('battle_arena_active_user');
    setCurrentUser(null);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      const p = await getUserProfile(currentUser.uid);
      if (p) setUserProfile(p);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin: !!currentUser?.isAdmin,
        signInWithGoogle,
        signOut,
        simulateLoginAs,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

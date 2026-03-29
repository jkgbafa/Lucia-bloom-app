'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface DayLog {
  date: string;
  flow?: 'spotting' | 'light' | 'medium' | 'heavy';
  symptoms: string[];
  mood: string[];
  pain: string[];
  body: string[];
  discharge: string[];
  activity: string[];
  sleep: string[];
  sexual: string[];
  digestion: string[];
  energy: string[];
  notes: string;
  waterGlasses: number;
  medications: string[];
  isPeriod: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  photoURL: string;
  cycleLength: number;
  periodLength: number;
  lastPeriodStart: string;
  periodDates: string[]; // All logged period dates
  onboardingComplete: boolean;
  notificationsEnabled: boolean;
  hasSeenGuide?: boolean;
  darkMode: boolean;
  createdAt: string;
}

interface AppState {
  user: UserProfile | null;
  logs: Record<string, DayLog>;
  isAuthenticated: boolean;
}

interface AppContextType {
  state: AppState;
  setUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  logDay: (log: DayLog) => void;
  getLog: (date: string) => DayLog | undefined;
  getAllLogs: () => DayLog[];
  toggleDarkMode: () => void;
  logout: () => void;
  exportData: () => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'luvia_app_data';

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function loadState(): AppState {
  if (typeof window === 'undefined') {
    return { user: null, logs: {}, isAuthenticated: false };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }

  return { user: null, logs: {}, isAuthenticated: false };
}

async function syncToCloud(state: AppState) {
  if (!state.isAuthenticated || !state.user || !state.user.email) return;
  try {
    if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      const { db } = await import('@/lib/firebase');
      await setDoc(doc(db, 'users', state.user.email), {
        profile: state.user,
        logs: state.logs,
      }, { merge: true });
      console.log('Synced secure data to cloud securely');
    }
  } catch (e) {
    console.error('Cloud sync failed - data is safe locally:', e);
  }
}

function saveState(state: AppState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    syncToCloud(state); // Fire-and-forget background sync
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({ user: null, logs: {}, isAuthenticated: false });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadedState = loadState();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadedState);
    setLoaded(true);

    // Apply dark mode
    if (loadedState.user?.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    // Try to mount Firebase listener if keys exist
    if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      import('@/lib/firebase').then(({ auth, db }) => {
        onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser && fbUser.email) {
            try {
              const docSnap = await getDoc(doc(db, 'users', fbUser.email));
              if (docSnap.exists()) {
                const cloudData = docSnap.data();
                setState(prev => ({
                  ...prev,
                  user: cloudData.profile || prev.user,
                  logs: cloudData.logs || prev.logs,
                  isAuthenticated: true
                }));
              }
            } catch (e) {
              console.error(e);
            }
          }
        });
      });
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      saveState(state);
    }
  }, [state, loaded]);

  const setUser = useCallback((user: UserProfile) => {
    setState(prev => ({ ...prev, user, isAuthenticated: true }));
  }, []);

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setState(prev => {
      if (!prev.user) return prev;
      return { ...prev, user: { ...prev.user, ...updates } };
    });
  }, []);

  const logDay = useCallback((log: DayLog) => {
    setState(prev => {
      const newLogs = { ...prev.logs, [log.date]: log };

      // Update period dates if this day is marked as period
      let updatedUser = prev.user;
      if (prev.user && log.isPeriod) {
        const periodDates = [...new Set([...(prev.user.periodDates || []), log.date])].sort();
        updatedUser = { ...prev.user, periodDates };
      }

      return { ...prev, logs: newLogs, user: updatedUser };
    });
  }, []);

  const getLog = useCallback((date: string): DayLog | undefined => {
    return state.logs[date];
  }, [state.logs]);

  const getAllLogs = useCallback((): DayLog[] => {
    return Object.values(state.logs).sort((a, b) => b.date.localeCompare(a.date));
  }, [state.logs]);

  const toggleDarkMode = useCallback(() => {
    setState(prev => {
      if (!prev.user) return prev;
      const newDarkMode = !prev.user.darkMode;

      if (newDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }

      return { ...prev, user: { ...prev.user, darkMode: newDarkMode } };
    });
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, logs: {}, isAuthenticated: false });
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const exportData = useCallback((): string => {
    const data = {
      profile: state.user,
      logs: state.logs,
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }, [state]);

  if (!loaded) {
    return null; // or a loading spinner
  }

  return (
    <AppContext.Provider
      value={{
        state,
        setUser,
        updateUser,
        logDay,
        getLog,
        getAllLogs,
        toggleDarkMode,
        logout,
        exportData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

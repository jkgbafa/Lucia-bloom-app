'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/lib/store';
import AuthScreen from '@/components/AuthScreen';
import OnboardingScreen from '@/components/OnboardingScreen';
import Dashboard from '@/components/Dashboard';
import CalendarView from '@/components/CalendarView';
import InsightsView from '@/components/InsightsView';
import SettingsView from '@/components/SettingsView';
import LogScreen from '@/components/LogScreen';
import {
  Home, CalendarDays, BarChart3, Settings, Plus,
  Moon, Sun, User, Flower2
} from 'lucide-react';
import {
  registerServiceWorker,
  requestNotificationPermission,
  requestFCMToken,
} from '@/lib/notifications';

type Tab = 'home' | 'calendar' | 'insights' | 'settings';

export default function AppShell() {
  const { state, toggleDarkMode, updateUser } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showLog, setShowLog] = useState(false);
  const [logDate, setLogDate] = useState<string | undefined>(undefined);
  const [logSection, setLogSection] = useState<string | undefined>(undefined);

  // Register service worker once on mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // Keep the server push channel healthy: fresh FCM token + her timezone,
  // so scheduled notifications arrive at the right local time.
  const notificationsEnabled = state.user?.notificationsEnabled;
  const savedFcmToken = state.user?.fcmToken;
  const savedTimezone = state.user?.timezone;
  useEffect(() => {
    if (!notificationsEnabled) return;

    async function syncNotifications() {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (timezone && timezone !== savedTimezone) {
        updateUser({ timezone });
      }

      const permission = await requestNotificationPermission();
      if (permission !== 'granted' || !('serviceWorker' in navigator)) return;

      const reg = await navigator.serviceWorker.ready;
      const token = await requestFCMToken(reg);
      if (token && token !== savedFcmToken) {
        updateUser({ fcmToken: token });
      }
    }

    syncNotifications();
  }, [notificationsEnabled, savedFcmToken, savedTimezone, updateUser]);

  // Not authenticated
  if (!state.isAuthenticated || !state.user) {
    return <AuthScreen />;
  }

  // Onboarding not complete
  if (!state.user.onboardingComplete) {
    return <OnboardingScreen />;
  }

  const openLog = (date?: string, section?: string) => {
    setLogDate(date);
    setLogSection(section);
    setShowLog(true);
  };

  const closeLog = () => {
    setShowLog(false);
    setLogDate(undefined);
    setLogSection(undefined);
  };

  const handleCalendarDateSelect = (date: string) => {
    openLog(date);
  };

  return (
    <div className="app-container">
      {/* Log screen overlay */}
      {showLog && (
        <LogScreen date={logDate} initialSection={logSection} onClose={closeLog} />
      )}

      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="header-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '10px', background: 'var(--primary)', color: 'white' }}>
            <Flower2 size={18} />
          </div>
          <span className="header-title">Bloom</span>
        </div>
        <div className="header-actions">
          <button
            className="header-btn"
            onClick={toggleDarkMode}
            aria-label={state.user.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={state.user.darkMode ? 'Light Mode' : 'Dark Mode'}
            id="theme-toggle-btn"
          >
            {state.user.darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="header-btn"
            onClick={() => setActiveTab('settings')}
            aria-label="Open settings"
            id="profile-btn"
            style={state.user.photoURL ? { padding: 0, background: 'none' } : undefined}
          >
            {state.user.photoURL ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={state.user.photoURL} alt="" className="user-avatar" />
            ) : (
              <User size={18} />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-content">
        {activeTab === 'home' && <Dashboard onOpenLog={(section?: string) => openLog(undefined, section)} />}
        {activeTab === 'calendar' && <CalendarView onSelectDate={handleCalendarDateSelect} />}
        {activeTab === 'insights' && <InsightsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
          id="nav-home"
        >
          <Home size={22} />
          <span>Home</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
          id="nav-calendar"
        >
          <CalendarDays size={22} />
          <span>Calendar</span>
        </button>

        <button
          className="nav-log-btn"
          onClick={() => openLog()}
          id="nav-log"
          aria-label="Log today"
          title="Log Today"
        >
          <Plus size={24} />
        </button>

        <button
          className={`nav-item ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
          id="nav-insights"
        >
          <BarChart3 size={22} />
          <span>Insights</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          id="nav-settings"
        >
          <Settings size={22} />
          <span>Settings</span>
        </button>
      </nav>
    </div>
  );
}

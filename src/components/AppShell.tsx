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

type Tab = 'home' | 'calendar' | 'insights' | 'settings';

export default function AppShell() {
  const { state, toggleDarkMode } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showLog, setShowLog] = useState(false);
  const [logDate, setLogDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (state.user?.notificationsEnabled && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [state.user?.notificationsEnabled]);

  // Not authenticated
  if (!state.isAuthenticated || !state.user) {
    return <AuthScreen />;
  }

  // Onboarding not complete
  if (!state.user.onboardingComplete) {
    return <OnboardingScreen />;
  }

  const openLog = (date?: string) => {
    setLogDate(date);
    setShowLog(true);
  };

  const closeLog = () => {
    setShowLog(false);
    setLogDate(undefined);
  };

  const handleCalendarDateSelect = (_date: string) => {
    // Could open log for that date
  };

  return (
    <div className="app-container">
      {/* Log screen overlay */}
      {showLog && (
        <LogScreen date={logDate} onClose={closeLog} />
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
            title={state.user.darkMode ? 'Light Mode' : 'Dark Mode'}
            id="theme-toggle-btn"
          >
            {state.user.darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {state.user.photoURL ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={state.user.photoURL}
              alt="Profile"
              className="user-avatar"
              onClick={() => setActiveTab('settings')}
            />
          ) : (
            <button
              className="header-btn"
              onClick={() => setActiveTab('settings')}
              id="profile-btn"
            >
              <User size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="app-content">
        {activeTab === 'home' && <Dashboard onOpenLog={() => openLog()} />}
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

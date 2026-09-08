'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/lib/store';
import {
  Moon, Sun, Bell, BellOff, Download, LogOut, Shield,
  Heart, User, Calendar, Trash2, ChevronRight,
  Settings, CheckCircle, AlertTriangle, CalendarRange, Activity, PenLine
} from 'lucide-react';
import {
  requestNotificationPermission,
  getNotificationPermission,
  scheduleBloomNotifications,
  requestFCMToken,
} from '@/lib/notifications';

export default function SettingsView() {
  const { state, updateUser, toggleDarkMode, logout, deleteAllData, exportData } = useAppContext();
  const user = state.user!;
  const [showExportToast, setShowExportToast] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [editingCycle, setEditingCycle] = useState(false);
  const [cycleLength, setCycleLength] = useState(user.cycleLength);
  const [periodLength, setPeriodLength] = useState(user.periodLength);
  const [notifPermission, setNotifPermission] = useState<string>('default');

  useEffect(() => {
    setNotifPermission(getNotificationPermission());
  }, []);

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === 'granted' && user.notificationsEnabled) {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        const token = await requestFCMToken(reg);
        if (token && token !== user.fcmToken) {
          updateUser({ fcmToken: token });
        }
      }

      await scheduleBloomNotifications({
        notifyPrePeriod: user.notifyPrePeriod,
        notifyPhaseChange: user.notifyPhaseChange,
        notifyLogReminder: user.notifyLogReminder,
        lastPeriodStart: user.lastPeriodStart,
        cycleLength: user.cycleLength,
        periodLength: user.periodLength,
      });
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bloom-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 3000);
  };

  const handleSaveCycle = () => {
    updateUser({ cycleLength, periodLength });
    setEditingCycle(false);
  };

  return (
    <div className="page-enter">
      {/* Toast */}
      {showExportToast && (
        <div className="toast toast-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} /> Data exported successfully!
        </div>
      )}

      <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Settings size={24} /> Settings
      </h2>

      {/* Profile */}
      <div className="settings-group">
        <div className="settings-group-title">Profile</div>
        <div className="settings-item" style={{ cursor: 'default' }}>
          <div className="settings-item-left">
            <div className="settings-item-icon" style={{ background: 'var(--phase-menstrual-bg)' }}>
              <User size={20} color="var(--phase-menstrual)" />
            </div>
            <div className="settings-item-text">
              <h3>{user.name}</h3>
              <p>{user.email}</p>
            </div>
          </div>
          {user.photoURL && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={user.photoURL}
              alt="Profile"
              className="user-avatar"
              style={{ width: '40px', height: '40px' }}
            />
          )}
        </div>
      </div>

      {/* Appearance */}
      <div className="settings-group">
        <div className="settings-group-title">Appearance</div>
        <div className="settings-item" onClick={toggleDarkMode}>
          <div className="settings-item-left">
            <div className="settings-item-icon" style={{ background: 'var(--phase-luteal-bg)' }}>
              {user.darkMode ? <Moon size={20} color="var(--phase-luteal)" /> : <Sun size={20} color="var(--phase-follicular)" />}
            </div>
            <div className="settings-item-text">
              <h3>{user.darkMode ? 'Dark Mode' : 'Light Mode'}</h3>
              <p>Toggle between light and dark themes</p>
            </div>
          </div>
          <button className={`toggle ${user.darkMode ? 'active' : ''}`} id="dark-mode-toggle" />
        </div>
      </div>

      {/* Notifications */}
      <div className="settings-group">
        <div className="settings-group-title">Notifications</div>

        {/* Permission status banner */}
        {notifPermission !== 'granted' && (
          <div style={{
            background: notifPermission === 'denied' ? 'rgba(255,82,82,0.08)' : 'rgba(255,193,7,0.1)',
            border: `1px solid ${notifPermission === 'denied' ? 'rgba(255,82,82,0.3)' : 'rgba(255,193,7,0.3)'}`,
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <AlertTriangle size={18} color={notifPermission === 'denied' ? 'var(--error)' : '#f59e0b'} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                {notifPermission === 'denied'
                  ? 'Notifications blocked'
                  : 'Permission needed'}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {notifPermission === 'denied'
                  ? 'Go to Chrome Settings → Site Settings → Notifications and allow this site.'
                  : 'Tap below to allow Bloom to send you reminders.'}
              </p>
            </div>
            {notifPermission !== 'denied' && (
              <button
                onClick={handleRequestPermission}
                style={{
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                Allow
              </button>
            )}
          </div>
        )}

        {notifPermission === 'granted' && (
          <div style={{
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: '12px',
            padding: '10px 16px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <CheckCircle size={16} color="var(--success)" />
            <p style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 500 }}>
              Notifications are allowed on this device ✓
            </p>
          </div>
        )}

        <div
          className="settings-item"
          onClick={() => {
            const newVal = !user.notificationsEnabled;
            updateUser({ 
              notificationsEnabled: newVal,
              notifyPrePeriod: newVal,
              notifyPhaseChange: newVal,
              notifyLogReminder: newVal
            });
            if (newVal && notifPermission !== 'granted') {
              handleRequestPermission();
            }
          }}
        >
          <div className="settings-item-left">
            <div className="settings-item-icon" style={{ background: 'var(--phase-ovulation-bg)' }}>
              {user.notificationsEnabled
                ? <Bell size={20} color="var(--phase-ovulation)" />
                : <BellOff size={20} color="var(--text-tertiary)" />}
            </div>
            <div className="settings-item-text">
              <h3>Enable All Notifications</h3>
              <p>Period reminders, phase changes, wellness tips</p>
            </div>
          </div>
          <button className={`toggle ${user.notificationsEnabled ? 'active' : ''}`} id="notifications-toggle" />
        </div>

        {user.notificationsEnabled && (
          <div style={{ paddingLeft: '16px', paddingTop: '8px', borderTop: '1px solid var(--divider)', marginTop: '4px' }}>
            <div className="settings-item" style={{ border: 'none', padding: '12px 0' }} onClick={() => updateUser({ notifyPrePeriod: !user.notifyPrePeriod })}>
              <div className="settings-item-left">
                <div className="settings-item-icon" style={{ width: '32px', height: '32px', background: 'transparent' }}>
                  <CalendarRange size={18} color="var(--phase-menstrual)" />
                </div>
                <div className="settings-item-text">
                  <h3 style={{ fontSize: '14px' }}>Pre-Period Alerts</h3>
                  <p style={{ fontSize: '12px' }}>Your period is arriving in 2 days</p>
                </div>
              </div>
              <button className={`toggle ${user.notifyPrePeriod ? 'active' : ''}`} style={{ transform: 'scale(0.8)' }} />
            </div>

            <div className="settings-item" style={{ border: 'none', padding: '12px 0' }} onClick={() => updateUser({ notifyPhaseChange: !user.notifyPhaseChange })}>
              <div className="settings-item-left">
                <div className="settings-item-icon" style={{ width: '32px', height: '32px', background: 'transparent' }}>
                  <Activity size={18} color="var(--phase-ovulation)" />
                </div>
                <div className="settings-item-text">
                  <h3 style={{ fontSize: '14px' }}>Phase Shifts</h3>
                  <p style={{ fontSize: '12px' }}>Entering Follicular, Luteal, etc.</p>
                </div>
              </div>
              <button className={`toggle ${user.notifyPhaseChange ? 'active' : ''}`} style={{ transform: 'scale(0.8)' }} />
            </div>

            <div className="settings-item" style={{ border: 'none', padding: '12px 0' }} onClick={() => updateUser({ notifyLogReminder: !user.notifyLogReminder })}>
              <div className="settings-item-left">
                <div className="settings-item-icon" style={{ width: '32px', height: '32px', background: 'transparent' }}>
                  <PenLine size={18} color="var(--phase-luteal)" />
                </div>
                <div className="settings-item-text">
                  <h3 style={{ fontSize: '14px' }}>Daily Check-In</h3>
                  <p style={{ fontSize: '12px' }}>Did you notice any symptoms?</p>
                </div>
              </div>
              <button className={`toggle ${user.notifyLogReminder ? 'active' : ''}`} style={{ transform: 'scale(0.8)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Cycle Settings */}
      <div className="settings-group">
        <div className="settings-group-title">Cycle Settings</div>

        {!editingCycle ? (
          <>
            <div className="settings-item" onClick={() => setEditingCycle(true)}>
              <div className="settings-item-left">
                <div className="settings-item-icon" style={{ background: 'var(--phase-follicular-bg)' }}>
                  <Calendar size={20} color="var(--phase-follicular)" />
                </div>
                <div className="settings-item-text">
                  <h3>Cycle Length</h3>
                  <p>{user.cycleLength} days</p>
                </div>
              </div>
              <ChevronRight size={18} color="var(--text-tertiary)" />
            </div>
            <div className="settings-item" onClick={() => setEditingCycle(true)}>
              <div className="settings-item-left">
                <div className="settings-item-icon" style={{ background: 'var(--phase-menstrual-bg)' }}>
                  <Heart size={20} color="var(--phase-menstrual)" />
                </div>
                <div className="settings-item-text">
                  <h3>Period Length</h3>
                  <p>{user.periodLength} days</p>
                </div>
              </div>
              <ChevronRight size={18} color="var(--text-tertiary)" />
            </div>
          </>
        ) : (
          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: 'var(--space-sm)' }}>
                Cycle Length (days)
              </label>
              <input
                type="number"
                className="onboarding-input"
                value={cycleLength}
                min={21}
                max={45}
                onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)}
                style={{ textAlign: 'center', fontSize: '20px', fontWeight: 700 }}
              />
            </div>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: 'var(--space-sm)' }}>
                Period Length (days)
              </label>
              <input
                type="number"
                className="onboarding-input"
                value={periodLength}
                min={1}
                max={10}
                onChange={(e) => setPeriodLength(parseInt(e.target.value) || 5)}
                style={{ textAlign: 'center', fontSize: '20px', fontWeight: 700 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button
                className="onboarding-btn onboarding-btn-secondary"
                onClick={() => setEditingCycle(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                className="onboarding-btn onboarding-btn-primary"
                onClick={handleSaveCycle}
                style={{ flex: 1 }}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Data & Privacy */}
      <div className="settings-group">
        <div className="settings-group-title">Data & Privacy</div>

        <div className="settings-item" onClick={() => setShowSecurity(!showSecurity)}>
          <div className="settings-item-left">
            <div className="settings-item-icon" style={{ background: 'var(--phase-follicular-bg)' }}>
              <Shield size={20} color="var(--phase-follicular)" />
            </div>
            <div className="settings-item-text">
              <h3>Privacy Promise & Security</h3>
              <p>Your data is never sold or shared. Period.</p>
            </div>
          </div>
          <ChevronRight 
            size={18} 
            color="var(--text-tertiary)" 
            style={{ transform: showSecurity ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} 
          />
        </div>

        {showSecurity && (
          <div className="card" style={{ padding: 'var(--space-md)', marginTop: '-8px', marginBottom: 'var(--space-md)', background: 'var(--bg-tertiary)', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--phase-follicular)' }}>
              <Shield size={16} /> Private &amp; Backed Up
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>
              Your data lives on this device and is <strong>backed up to your own private account</strong>, so it survives phone changes and app updates.
            </p>
            <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '16px', lineHeight: 1.5 }}>
              <li>Only you can access your backup — it&apos;s locked to your Google sign-in.</li>
              <li>No third parties, advertisers, or analytics companies can see your data.</li>
              <li>You can export or permanently delete everything at any time below.</li>
            </ul>
          </div>
        )}

        <button className="export-btn" onClick={handleExport} id="export-data-btn" style={{ marginBottom: 'var(--space-sm)' }}>
          <Download size={18} />
          Export My Data (JSON)
        </button>

        <button
          className="export-btn"
          onClick={() => setShowDeleteConfirm(true)}
          style={{ color: 'var(--error)', borderColor: 'rgba(255, 82, 82, 0.3)' }}
          id="delete-data-btn"
        >
          <Trash2 size={18} />
          Delete All Data
        </button>

        {showDeleteConfirm && (
          <div className="card" style={{
            marginTop: 'var(--space-md)',
            border: '1px solid var(--error)',
            padding: 'var(--space-lg)',
          }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, marginBottom: 'var(--space-sm)', color: 'var(--error)' }}>
              <AlertTriangle size={18} /> Are you sure?
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
              This will permanently delete all your data. This action cannot be undone.
              We recommend exporting your data first.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button
                className="onboarding-btn onboarding-btn-secondary"
                onClick={() => setShowDeleteConfirm(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                className="onboarding-btn"
                onClick={() => {
                  deleteAllData().catch(err => {
                    console.error(err);
                    alert('Could not delete the cloud backup — check your connection and try again. Nothing was deleted.');
                  });
                }}
                style={{
                  flex: 1,
                  background: 'var(--error)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-xl)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Delete Everything
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="settings-group">
        <div className="settings-item" onClick={logout} style={{ borderColor: 'rgba(255, 82, 82, 0.2)' }}>
          <div className="settings-item-left">
            <div className="settings-item-icon">
              <LogOut size={20} color="var(--error)" />
            </div>
            <div className="settings-item-text">
              <h3 style={{ color: 'var(--error)' }}>Log Out</h3>
              <p>Sign out of your account</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: 'var(--space-xl) 0',
        color: 'var(--text-tertiary)',
        fontSize: '12px',
      }}>
        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          Made with <Heart size={12} fill="currentColor" /> for Lucia
        </p>
        <p style={{ marginTop: '4px' }}>v1.0.0 · Your data, your control</p>
        <p style={{ marginTop: '24px', opacity: 0.4 }}>Made by Joshua</p>
      </div>
    </div>
  );
}

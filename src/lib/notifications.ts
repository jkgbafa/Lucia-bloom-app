'use client';

/**
 * Notification utilities for Bloom
 * Handles browser permission requests, service worker registration,
 * and scheduling of local notifications based on cycle data.
 */

import { getToken } from 'firebase/messaging';
import { getMessagingInstance } from './firebase';

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
    console.log('[Bloom] Service worker registered:', reg.scope);
    return reg;
  } catch (e) {
    console.error('[Bloom] SW registration failed:', e);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') return 'granted';
  const permission = await Notification.requestPermission();
  return permission;
}

export async function requestFCMToken(reg: ServiceWorkerRegistration): Promise<string | null> {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return null;
    
    const token = await getToken(messaging, {
      vapidKey: 'BJ31oPWRpXQuK8DMcOS-k5EC5APS4wJfAWMCub0pPHvtexzVAa91psUdIqYAS1VHUXkTWJOOjgPZgXfIk-t8oNQ',
      serviceWorkerRegistration: reg
    });
    
    return token;
  } catch (err) {
    console.error('[Bloom] Failed to get FCM token:', err);
    return null;
  }
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export interface NotificationSchedule {
  title: string;
  body: string;
  timestamp: number; // ms since epoch
}

/**
 * Calculates and schedules local notifications based on cycle data.
 * Called whenever notification prefs change or on app load.
 */
export async function scheduleBloomNotifications(options: {
  notifyPrePeriod: boolean;
  notifyPhaseChange: boolean;
  notifyLogReminder: boolean;
  lastPeriodStart: string;
  cycleLength: number;
  periodLength: number;
}) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  if (Notification.permission !== 'granted') return;

  const reg = await navigator.serviceWorker.ready;
  const notifications: NotificationSchedule[] = [];
  const now = Date.now();

  // --- Pre-Period Alert (2 days before predicted period) ---
  if (options.notifyPrePeriod && options.lastPeriodStart) {
    const lastStart = new Date(options.lastPeriodStart + 'T08:00:00').getTime();
    const cycleLengthMs = options.cycleLength * 24 * 60 * 60 * 1000;
    let nextPeriod = lastStart + cycleLengthMs;
    // Advance to future
    while (nextPeriod < now) nextPeriod += cycleLengthMs;

    const twoDaysBefore = nextPeriod - 2 * 24 * 60 * 60 * 1000;
    if (twoDaysBefore > now) {
      notifications.push({
        title: '🌸 Period coming soon',
        body: 'Your period is predicted in about 2 days. Stock up on your essentials! 💕',
        timestamp: twoDaysBefore,
      });
    }
  }

  // --- Daily Check-In Reminder (every day at 8pm) ---
  if (options.notifyLogReminder) {
    const todayAt8pm = new Date();
    todayAt8pm.setHours(20, 0, 0, 0);
    if (todayAt8pm.getTime() < now) todayAt8pm.setDate(todayAt8pm.getDate() + 1);
    notifications.push({
      title: '📋 How are you feeling today, Lucia?',
      body: 'Take a moment to log your symptoms and mood in Bloom.',
      timestamp: todayAt8pm.getTime(),
    });
  }

  // --- Phase Shift notification (beginning of new phase) ---
  if (options.notifyPhaseChange && options.lastPeriodStart) {
    const lastStart = new Date(options.lastPeriodStart + 'T08:00:00').getTime();
    const cycleLengthMs = options.cycleLength * 24 * 60 * 60 * 1000;
    let cycleStart = lastStart;
    while (cycleStart + cycleLengthMs < now) cycleStart += cycleLengthMs;

    const ovulationDay = options.cycleLength - 14;
    const phaseMessages = [
      { day: options.periodLength + 1, title: '🌱 Follicular Phase begins!', body: 'Your energy is rising. Great time to try something new!' },
      { day: ovulationDay, title: '✨ Ovulation Phase — peak energy!', body: 'You\'re at your most vibrant. Embrace it!' },
      { day: ovulationDay + 2, title: '🍂 Luteal Phase begins', body: 'Time to slow down and nourish yourself. Check your food tips in Bloom.' },
    ];

    phaseMessages.forEach(({ day, title, body }) => {
      const phaseTimestamp = cycleStart + day * 24 * 60 * 60 * 1000;
      const phaseAt9am = new Date(phaseTimestamp);
      phaseAt9am.setHours(9, 0, 0, 0);
      if (phaseAt9am.getTime() > now) {
        notifications.push({ title, body, timestamp: phaseAt9am.getTime() });
      }
    });
  }

  // Send to service worker to schedule
  if (reg.active && notifications.length > 0) {
    reg.active.postMessage({ type: 'SCHEDULE_NOTIFICATIONS', notifications });
  }
}

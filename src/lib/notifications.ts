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
    const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const reg = await navigator.serviceWorker.register(`${base}/firebase-messaging-sw.js`, { scope: `${base}/` });
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

// Scheduled notifications are sent server-side (see functions/src/index.ts) so they
// arrive even when the app is closed — service-worker setTimeout dies when the phone sleeps.

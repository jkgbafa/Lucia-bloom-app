'use client';

import React from 'react';
import { useAppContext, UserProfile } from '@/lib/store';
import { Shield, Heart, Bell, BarChart3, Flower2 } from 'lucide-react';

export default function AuthScreen() {
  const { setUser } = useAppContext();

  const handleGoogleSignIn = async () => {
    // For now, we'll use a demo mode that simulates Google sign-in
    // In production, this would use Firebase Auth
    try {
      const { auth, googleProvider } = await import('@/lib/firebase');
      const { signInWithPopup } = await import('firebase/auth');
      
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      const user: UserProfile = {
        name: firebaseUser.displayName || 'Lucia',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || '',
        cycleLength: 28,
        periodLength: 5,
        lastPeriodStart: '',
        periodDates: [],
        onboardingComplete: false,
        notificationsEnabled: false,
        darkMode: false,
        createdAt: new Date().toISOString(),
      };
      
      setUser(user);
    } catch (error: unknown) {
      console.log('Firebase auth not configured, using demo mode');
      // Demo mode for development
      const user: UserProfile = {
        name: 'Lucia',
        email: 'lucia@example.com',
        photoURL: '',
        cycleLength: 28,
        periodLength: 5,
        lastPeriodStart: '',
        periodDates: [],
        onboardingComplete: false,
        notificationsEnabled: false,
        darkMode: false,
        createdAt: new Date().toISOString(),
      };
      
      setUser(user);
      void error;
    }
  };

  return (
    <div className="auth-screen">
      
      <div className="auth-content">
        <div className="auth-logo">
          <Flower2 size={32} color="white" />
        </div>
        
        <h1 className="auth-title">Bloom</h1>
        <p className="auth-subtitle">
          Your personal cycle companion.<br/>
          Beautiful, private, and made just for you.
        </p>

        <div className="auth-features">
          <div className="auth-feature">
            <div className="auth-feature-icon" style={{ background: 'var(--phase-menstrual-bg)' }}>
              <Heart size={20} color="var(--phase-menstrual)" />
            </div>
            <div className="auth-feature-text">
              Complete Cycle Tracking
              <span>Period, ovulation, phases & symptoms</span>
            </div>
          </div>
          
          <div className="auth-feature">
            <div className="auth-feature-icon" style={{ background: 'var(--phase-ovulation-bg)' }}>
              <BarChart3 size={20} color="var(--phase-ovulation)" />
            </div>
            <div className="auth-feature-text">
              Smart Insights & Analytics
              <span>All free — no paywalls, ever</span>
            </div>
          </div>
          
          <div className="auth-feature">
            <div className="auth-feature-icon" style={{ background: 'var(--phase-luteal-bg)' }}>
              <Bell size={20} color="var(--phase-luteal)" />
            </div>
            <div className="auth-feature-text">
              Gentle Reminders
              <span>Customizable, never invasive</span>
            </div>
          </div>
          
          <div className="auth-feature">
            <div className="auth-feature-icon" style={{ background: 'var(--phase-follicular-bg)' }}>
              <Shield size={20} color="var(--phase-follicular)" />
            </div>
            <div className="auth-feature-text">
              100% Private
              <span>Your data stays yours. Always.</span>
            </div>
          </div>
        </div>

        <button className="auth-google-btn" onClick={handleGoogleSignIn} id="google-sign-in-btn">
          <svg className="auth-google-icon" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <p className="auth-privacy">
          <span className="auth-privacy-highlight">🔒 Privacy Promise:</span> Your data is encrypted and never shared with third parties. Unlike other apps, we will <strong>never</strong> sell your information.
        </p>
      </div>
    </div>
  );
}

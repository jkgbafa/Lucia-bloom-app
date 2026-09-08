'use client';

import React, { useState } from 'react';
import {
  computeCycleStats,
  calculateCycleDay,
  getCurrentPhase,
  formatDisplayDate,
  formatShortDate,
  getSymptomLabelText,
  type CycleStats,
  type PhaseInfo,
} from '@/lib/cycle-utils';
import type { UserProfile, DayLog } from '@/lib/store';
import { Heart, Flower2, CalendarDays, Flame, Lightbulb, ShieldAlert, LogOut } from 'lucide-react';

// Only these accounts can open this page; Firestore rules enforce the same
// list server-side, so even someone who finds the URL sees nothing.
const ADMIN_EMAILS = ['joshuagbafa108@gmail.com'];
const PARTNER_EMAIL = 'ladusei60@gmail.com';

// Extra gate before the sign-in screen. SHA-256 hash so the password isn't
// readable in the bundle; the real security is still Google sign-in + rules.
const PASSWORD_HASH = 'fe6b024a1eee7205f990a2cdd06fe86a8fc8a54d0a572f0b12b821bd5257af9e';

async function checkPassword(input: string): Promise<boolean> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  const hex = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  return hex === PASSWORD_HASH;
}

interface PartnerPhaseGuide {
  vibe: string;
  libido: string;
  whatHelps: string[];
  avoid: string[];
  dateIdea: string;
}

const PARTNER_GUIDE: Record<PhaseInfo['name'], PartnerPhaseGuide> = {
  menstrual: {
    vibe: 'Her energy is at its lowest. Cramps, fatigue, and wanting comfort are all normal. She may be more inward and quiet — it\'s not about you.',
    libido: 'Usually lower, though every woman is different. Follow her lead and don\'t take a "not tonight" personally.',
    whatHelps: [
      'A heating pad, warm tea, or offering a back rub without being asked',
      'Take chores off her plate — cook or order her comfort food',
      'Iron-rich meals help: think steak, spinach dishes, dark chocolate for dessert',
      'Low-key evenings: blanket, movie, no big plans',
      'Small gestures land huge right now — her favorite snack on the way home',
    ],
    avoid: ['Scheduling big social events', 'Suggesting intense activities', 'Commenting on mood or appetite'],
    dateIdea: 'Cozy night in: her comfort food, her show, zero pressure.',
  },
  follicular: {
    vibe: 'Estrogen is climbing — she\'s waking back up. More energy, more optimism, more open to plans and new things. This is her "let\'s do something" week.',
    libido: 'Rising steadily. Playfulness and flirting land well now.',
    whatHelps: [
      'Say yes to her ideas — this is when she wants novelty and adventure',
      'Plan things together: trips, projects, goals — her planning brain is sharp',
      'Compliment her energy and initiative, not just her looks',
      'Active dates work great — she has the stamina and the mood for them',
      'Great week for important conversations you\'ve been putting off',
    ],
    avoid: ['Being a homebody all week while she\'s buzzing to go out'],
    dateIdea: 'Something new neither of you has done — new restaurant, day trip, activity date.',
  },
  ovulation: {
    vibe: 'Peak everything: energy, confidence, sociability, glow. She feels her best and is at her most outgoing.',
    libido: 'Typically the highest of the whole cycle — biology is doing you a favor. Also her most fertile window, so be intentional either way.',
    whatHelps: [
      'Prioritize couple time these few days — connection comes easiest now',
      'Dress up and take her somewhere; she\'ll want to feel seen',
      'Deep conversations flow — her communication skills peak here',
      'If you\'re trying (or avoiding) pregnancy, this window is the one that counts',
      'Match her social energy — say yes to the dinner with friends',
    ],
    avoid: ['Wasting this window on routine nights and phones on the couch'],
    dateIdea: 'A proper date night out — dress up, dinner, dancing, the works.',
  },
  luteal: {
    vibe: 'Winding down. Progesterone rises, energy dips, and in the last few days PMS can bring irritability, cravings, and sensitivity. She needs steadiness from you.',
    libido: 'Variable — often gradually lower, sometimes a spike early in the phase. Extra affection without expectations goes a long way.',
    whatHelps: [
      'Patience. If she\'s snappy near the end, it\'s hormones talking — don\'t escalate',
      'Have her cravings on hand: chocolate, salty snacks, whatever her thing is',
      'Lighten her load proactively — dishes done before she asks',
      'Earlier, calmer nights; protect her sleep',
      'Reassurance beats problem-solving: "I\'ve got you" > "have you tried…"',
    ],
    avoid: ['Taking irritability personally', 'Big decisions or heavy talks in the last 3-4 days', 'Joking about PMS'],
    dateIdea: 'Low-effort comfort: takeout, dessert run, couch fort. Save adventures for next week.',
  },
};

interface PartnerData {
  profile: UserProfile;
  logs: Record<string, DayLog>;
}

export default function PartnerPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [data, setData] = useState<PartnerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [unlocked, setUnlocked] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem('bloom_partner_ok') === '1'
  );
  const [password, setPassword] = useState('');

  const tryUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await checkPassword(password)) {
      sessionStorage.setItem('bloom_partner_ok', '1');
      setUnlocked(true);
      setError(null);
    } else {
      setError('Wrong password.');
    }
  };

  const signIn = async () => {
    setBusy(true);
    setError(null);
    try {
      const { auth, googleProvider, db } = await import('@/lib/firebase');
      const { signInWithPopup } = await import('firebase/auth');
      const { doc, getDoc } = await import('firebase/firestore');

      const result = await signInWithPopup(auth, googleProvider);
      const userEmail = result.user.email || '';
      setEmail(userEmail);

      if (!ADMIN_EMAILS.includes(userEmail)) {
        setError('This account is not authorized for this page.');
        return;
      }

      const snap = await getDoc(doc(db, 'users', PARTNER_EMAIL));
      if (!snap.exists()) {
        setError('No data found yet.');
        return;
      }
      setData(snap.data() as PartnerData);
    } catch (e) {
      console.error(e);
      setError('Sign-in failed or access denied.');
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    const { auth } = await import('@/lib/firebase');
    const { signOut: fbSignOut } = await import('firebase/auth');
    await fbSignOut(auth);
    setEmail(null);
    setData(null);
  };

  if (!unlocked) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)' }}>
        <form onSubmit={tryUnlock} style={{ textAlign: 'center', maxWidth: '300px', width: '100%' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, marginBottom: 'var(--space-md)' }}>🔒</h1>
          {error && <p role="alert" style={{ color: 'var(--error)', fontSize: '13px', marginBottom: 'var(--space-sm)' }}>{error}</p>}
          <input
            type="password"
            className="onboarding-input"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            aria-label="Password"
            autoFocus
          />
          <button type="submit" className="onboarding-btn onboarding-btn-primary" style={{ width: '100%', marginTop: 'var(--space-md)' }}>
            Enter
          </button>
        </form>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-xl)' }}>
        <div style={{ textAlign: 'center', maxWidth: '320px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', background: 'var(--primary)', color: 'white', marginBottom: 'var(--space-md)' }}>
            <Heart size={28} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Bloom Partner</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 'var(--space-lg)' }}>
            Cycle awareness for a supportive husband.
          </p>
          {error && <p role="alert" style={{ color: 'var(--error)', fontSize: '13px', marginBottom: 'var(--space-md)' }}>{error}</p>}
          <button className="auth-google-btn" onClick={signIn} disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Signing in…' : 'Sign in with Google'}
          </button>
        </div>
      </div>
    );
  }

  const { profile, logs } = data;
  const stats: CycleStats = computeCycleStats(profile);
  const anchor = stats.episodes.length > 0 ? stats.episodes[stats.episodes.length - 1].start : profile.lastPeriodStart;
  const rawCycleDay = anchor ? calculateCycleDay(anchor) : 0;
  // If she's past the predicted date, treat it as late luteal rather than wrapping
  const cycleDay = Math.min(rawCycleDay, stats.avgCycleLength);
  const phase = getCurrentPhase(cycleDay, stats.avgCycleLength, stats.avgPeriodLength);
  const guide = PARTNER_GUIDE[phase.name];

  // Freshness: how recently has anything been logged?
  const logDates = Object.keys(logs || {}).sort();
  const lastLogDate = logDates[logDates.length - 1];
  const staleData = !lastLogDate || (Date.now() - new Date(lastLogDate + 'T12:00:00').getTime()) > 14 * 86400000;

  // Recent mood/pain/energy only — journal entries stay private to her
  const recentLogs = logDates.slice(-3).reverse().map(d => logs[d]);

  const phaseColor = `var(--phase-${phase.name})`;

  return (
    <div className="app-container" style={{ paddingBottom: 'var(--space-2xl)' }}>
      <header className="app-header">
        <div className="header-brand">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '10px', background: 'var(--primary)', color: 'white' }}>
            <Heart size={18} />
          </div>
          <span className="header-title">Bloom Partner</span>
        </div>
        <button className="header-btn" onClick={signOut} aria-label="Sign out" title="Sign out">
          <LogOut size={18} />
        </button>
      </header>

      <main className="app-content" style={{ paddingBottom: 'var(--space-lg)' }}>
        {staleData && (
          <div className="card" role="status" style={{ border: '1px solid var(--warning)', background: 'var(--phase-luteal-bg)' }}>
            <p style={{ fontSize: '13px' }}>
              <ShieldAlert size={14} style={{ verticalAlign: 'text-bottom', marginRight: '6px' }} />
              {lastLogDate
                ? `Her last log was ${formatDisplayDate(new Date(lastLogDate + 'T12:00:00'))} — everything below is projected and may be off.`
                : 'No logs synced yet — everything below is projected from her settings.'}
            </p>
          </div>
        )}

        {stats.overdueDays >= 1 && (
          <div className="card" style={{ border: '1px solid var(--phase-menstrual)', background: 'var(--phase-menstrual-bg)' }}>
            <p style={{ fontSize: '14px', fontWeight: 600 }}>
              Her period was expected {stats.overdueDays === 1 ? 'yesterday' : `${stats.overdueDays} days ago`}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Either it hasn&apos;t started (be extra gentle — late-cycle days are the hardest) or she forgot to log it.
            </p>
          </div>
        )}

        {/* Current phase */}
        <div className="card" style={{ borderLeft: `4px solid ${phaseColor}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Flower2 size={18} color={phaseColor} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>{phase.label}</span>
            <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-tertiary)' }}>Day {rawCycleDay} of ~{stats.avgCycleLength}</span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{guide.vibe}</p>
        </div>

        {/* Libido */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: '8px' }}>
            <span className="card-title"><Flame size={18} color="var(--phase-menstrual)" /> Libido right now</span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{guide.libido}</p>
        </div>

        {/* Key dates */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 'var(--space-sm)' }}>
            <span className="card-title"><CalendarDays size={18} color="var(--text-secondary)" /> Heads up</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Next period expected</span>
              <strong style={{ color: 'var(--phase-menstrual)' }}>
                {formatShortDate(stats.nextPeriodDate)}{stats.learned ? ` ±${stats.confidence}d` : ''}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Fertile window</span>
              <strong style={{ color: 'var(--phase-ovulation)' }}>
                {formatShortDate(stats.fertileWindowStart)} – {formatShortDate(stats.fertileWindowEnd)}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Stock up / plan comfort by</span>
              <strong>{formatShortDate(new Date(stats.nextPeriodDate.getTime() - 2 * 86400000))}</strong>
            </div>
          </div>
        </div>

        {/* How to be great this week */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 'var(--space-sm)' }}>
            <span className="card-title"><Lightbulb size={18} color="var(--phase-luteal)" /> How to be great this week</span>
          </div>
          <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
            {guide.whatHelps.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
          <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
            <strong>Date idea:</strong> {guide.dateIdea}
          </div>
          {guide.avoid.length > 0 && (
            <p style={{ marginTop: 'var(--space-md)', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <strong>Best avoided:</strong> {guide.avoid.join(' · ')}
            </p>
          )}
        </div>

        {/* Recent check-ins (mood/pain/energy only — her journal stays hers) */}
        {recentLogs.length > 0 && (
          <div className="card">
            <div className="card-header" style={{ marginBottom: 'var(--space-sm)' }}>
              <span className="card-title">Recent check-ins</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {recentLogs.map(log => {
                const chips = [...(log.mood || []), ...(log.pain || []), ...(log.energy || [])].map(getSymptomLabelText);
                return (
                  <div key={log.date} style={{ fontSize: '13px' }}>
                    <strong>{formatShortDate(new Date(log.date + 'T12:00:00'))}</strong>
                    {log.isPeriod && <span style={{ color: 'var(--phase-menstrual)' }}> · period day</span>}
                    <span style={{ color: 'var(--text-secondary)' }}>{chips.length > 0 ? ` — ${chips.join(', ')}` : ' — logged, no symptoms noted'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: 'var(--space-lg)' }}>
          Signed in as {email} · read-only
        </p>
      </main>
    </div>
  );
}

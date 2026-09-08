'use client';

import React from 'react';
import { useAppContext } from '@/lib/store';
import {
  calculateCycleDay,
  getCurrentPhase,
  getDaysUntilPeriod,
  getDailyTip,
  formatShortDate,
  getPredictedPeriodDate,
  getOvulationDate,
} from '@/lib/cycle-utils';
import { Droplets, Smile, Zap, Moon } from 'lucide-react';
import * as Icons from 'lucide-react';
import PhaseModal from './PhaseModal';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderIcon = (name: string, props: any = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) return null;
  return <IconComponent {...props} />;
};

interface DashboardProps {
  onOpenLog: () => void;
}

export default function Dashboard({ onOpenLog }: DashboardProps) {
  const { state, updateUser } = useAppContext();
  const user = state.user!;
  const [showWelcomeGuide, setShowWelcomeGuide] = React.useState(!user.hasSeenGuide);
  const [showPhaseModal, setShowPhaseModal] = React.useState(false);

  const dismissGuide = () => {
    setShowWelcomeGuide(false);
    updateUser({ hasSeenGuide: true });
  };

  const cycleDay = calculateCycleDay(user.lastPeriodStart);
  const phase = getCurrentPhase(cycleDay, user.cycleLength, user.periodLength);
  const daysUntil = getDaysUntilPeriod(user.lastPeriodStart, user.cycleLength);
  const dailyTip = getDailyTip(phase.name);
  const nextPeriod = getPredictedPeriodDate(user.lastPeriodStart, user.cycleLength);
  const ovulationDate = getOvulationDate(user.lastPeriodStart, user.cycleLength);

  const progress = cycleDay / user.cycleLength;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress);

  const getPhaseColor = () => {
    switch (phase.name) {
      case 'menstrual': return 'var(--phase-menstrual)';
      case 'follicular': return 'var(--phase-follicular)';
      case 'ovulation': return 'var(--phase-ovulation)';
      case 'luteal': return 'var(--phase-luteal)';
    }
  };

  return (
    <div className="page-enter">
      {/* Welcome Guide Modal */}
      {showWelcomeGuide && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999, 
          background: 'var(--bg-overlay)', 
          padding: 'var(--space-xl)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{ 
            width: '100%', maxWidth: '400px', margin: 0,
            animation: 'slideUp 0.3s ease-out'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px', color: 'var(--primary)' }}>
              {renderIcon('Flower2', { size: 24, style: { verticalAlign: 'middle', marginRight: '8px' } })}
              Welcome to Bloom
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              I&apos;m your new cycle companion! Here&apos;s a quick guide on how to get started:
            </p>
            <ul style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '24px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Track Today:</strong> Tap the big + button at the bottom to log your symptoms, flow, and journal for the day.</li>
              <li><strong>See Insights:</strong> Check the Insights tab for patterns in your cycle length, mood, and common symptoms.</li>
              <li><strong>Private &amp; Safe:</strong> Everything you enter is saved on this device and backed up to your own private account — only you can see it, and it survives phone changes.</li>
            </ul>
            <button 
              className="onboarding-btn onboarding-btn-primary" 
              style={{ width: '100%' }}
              onClick={dismissGuide}
            >
              Got it, let&apos;s go!
            </button>
          </div>
        </div>
      )}

      {/* Greeting */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700 }}>
          Hi, {user.name.split(' ')[0]}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Here&apos;s your cycle overview for today
        </p>
      </div>

      {/* Cycle Ring */}
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
        <div className="cycle-ring-container">
          <div className="cycle-ring">
            <svg viewBox="0 0 200 200">
              <circle className="cycle-ring-bg" cx="100" cy="100" r="90" />
              <circle
                className="cycle-ring-progress"
                cx="100"
                cy="100"
                r="90"
                stroke={getPhaseColor()}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="cycle-ring-inner">
              <div className="cycle-day-number">{cycleDay}</div>
              <div className="cycle-day-label">of {user.cycleLength} days</div>
            </div>
          </div>

          <div className={`cycle-phase-badge phase-${phase.name}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {renderIcon(phase.icon, { size: 16 })}
            <span>{phase.label}</span>
          </div>

          <div className="cycle-prediction">
            {phase.name === 'menstrual' ? (
              <>Your period is here. Take care of yourself.</>
            ) : (
              <>
                Period in <strong>{daysUntil} days</strong> · {formatShortDate(nextPeriod)}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="quick-action-btn" onClick={onOpenLog}>
          <div className="quick-action-icon" style={{ background: 'var(--phase-menstrual-bg)' }}>
            <Droplets size={18} color="var(--phase-menstrual)" />
          </div>
          <span className="quick-action-label">Log Period</span>
        </button>

        <button className="quick-action-btn" onClick={onOpenLog}>
          <div className="quick-action-icon" style={{ background: 'var(--phase-follicular-bg)' }}>
            <Smile size={18} color="var(--phase-follicular)" />
          </div>
          <span className="quick-action-label">Mood</span>
        </button>

        <button className="quick-action-btn" onClick={onOpenLog}>
          <div className="quick-action-icon" style={{ background: 'var(--phase-ovulation-bg)' }}>
            <Zap size={18} color="var(--phase-ovulation)" />
          </div>
          <span className="quick-action-label">Symptoms</span>
        </button>

        <button className="quick-action-btn" onClick={onOpenLog}>
          <div className="quick-action-icon" style={{ background: 'var(--phase-luteal-bg)' }}>
            <Moon size={18} color="var(--phase-luteal)" />
          </div>
          <span className="quick-action-label">Sleep</span>
        </button>
      </div>

      {/* Phase Info Card (Tappable for Modal) */}
      <div 
        className="card clickable-card" 
        style={{ borderLeft: `4px solid ${getPhaseColor()}`, borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
        onClick={() => setShowPhaseModal(true)}
      >
        <div className="phase-info-title" style={{ color: getPhaseColor(), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {renderIcon(phase.icon, { size: 18, color: getPhaseColor() })} {phase.label}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '12px' }}>Foods & Tips</span>
        </div>
        <div className="phase-info-desc" style={{ color: 'var(--text-primary)' }}>
          {phase.description}
        </div>
        <div className="phase-tips">
          {phase.tips.slice(0, 3).map((tip, i) => (
            <div className="phase-tip" key={i}>
              <span className="phase-tip-icon" style={{ marginTop: '2px', color: 'var(--text-tertiary)' }}>
                {renderIcon('Lightbulb', { size: 14 })}
              </span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Tip */}
      <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: 'var(--bg-tertiary)' }}>
        <div style={{ color: 'var(--primary)', background: 'var(--bg-card)', padding: '12px', borderRadius: '50%' }}>
          {renderIcon(dailyTip.icon, { size: 24 })}
        </div>
        <div className="daily-tip-content">
          <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{dailyTip.title}</h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{dailyTip.text}</p>
        </div>
      </div>

      {/* Key Dates */}
      <div className="card" style={{ marginTop: 'var(--space-md)' }}>
        <div className="card-header">
          <span className="card-title">
            {renderIcon('Calendar', { size: 18, color: 'var(--text-secondary)' })} Key Dates
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-sm) 0',
            borderBottom: '1px solid var(--divider)',
          }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Next Period</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--phase-menstrual)' }}>
              {formatShortDate(nextPeriod)}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-sm) 0',
            borderBottom: '1px solid var(--divider)',
          }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Ovulation</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--phase-ovulation)' }}>
              {formatShortDate(ovulationDate)}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-sm) 0',
          }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Cycle Length</span>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              {user.cycleLength} days
            </span>
          </div>
        </div>
      </div>

      {/* Made by Joshua Footer */}
      <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0', opacity: 0.4 }}>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Made by Joshua</p>
      </div>

      {/* Popups */}
      {showPhaseModal && (
        <PhaseModal phase={phase} onClose={() => setShowPhaseModal(false)} />
      )}
    </div>
  );
}

'use client';

import React from 'react';
import { useAppContext } from '@/lib/store';
import { calculateCycleDay, getCurrentPhase, computeCycleStats, getDayInfo, SYMPTOM_CATEGORIES } from '@/lib/cycle-utils';
import { BarChart2, Droplet, Smile, Activity, Map, PenTool, Calendar } from 'lucide-react';
import * as Icons from 'lucide-react';
import PhaseModal from './PhaseModal';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderIcon = (name: string, props: any = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) return null;
  return <IconComponent {...props} />;
};

export default function InsightsView() {
  const { state } = useAppContext();
  const user = state.user!;
  const logs = Object.values(state.logs);
  const [showPhaseModal, setShowPhaseModal] = React.useState(false);

  // Calculate stats
  const stats = computeCycleStats(user);
  const totalLogs = logs.length;
  const periodDays = logs.filter(l => l.isPeriod).length;
  // Only average over days where water was actually tracked
  const waterDays = logs.filter(l => (l.waterGlasses || 0) > 0);
  const avgWater = waterDays.length > 0 ? Math.round(waterDays.reduce((acc, l) => acc + l.waterGlasses, 0) / waterDays.length) : 0;

  // Symptoms by phase: which symptoms show up most in each phase of her cycle.
  // ponytail: past days are phase-classified by projecting the average cycle backwards
  // (modulo), not by which real cycle they fell in; close enough for patterns, upgrade
  // path is per-episode classification.
  const phaseSymptoms: Record<string, Record<string, number>> = { menstrual: {}, follicular: {}, ovulation: {}, luteal: {} };
  if (user.lastPeriodStart) {
    logs.forEach(log => {
      const info = getDayInfo(log.date, user.lastPeriodStart, stats.avgCycleLength, stats.avgPeriodLength, user.periodDates);
      [...log.pain, ...log.body, ...log.mood].forEach(s => {
        phaseSymptoms[info.phase][s] = (phaseSymptoms[info.phase][s] || 0) + 1;
      });
    });
  }
  const phasePatterns = Object.entries(phaseSymptoms)
    .map(([phaseName, counts]) => ({
      phaseName,
      top: Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 3),
    }))
    .filter(p => p.top.length > 0);

  // Mood frequency
  const moodCounts: Record<string, number> = {};
  logs.forEach(log => {
    log.mood.forEach(m => {
      moodCounts[m] = (moodCounts[m] || 0) + 1;
    });
  });
  const topMoods = Object.entries(moodCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Symptom frequency
  const symptomCounts: Record<string, number> = {};
  logs.forEach(log => {
    [...log.pain, ...log.body].forEach(s => {
      symptomCounts[s] = (symptomCounts[s] || 0) + 1;
    });
  });
  const topSymptoms = Object.entries(symptomCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Get symptom label from ID
  const getSymptomLabel = (id: string) => {
    for (const category of Object.values(SYMPTOM_CATEGORIES)) {
      const option = category.options.find(o => o.id === id);
      if (option) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {renderIcon(option.icon, { size: 14, color: 'var(--text-secondary)' })}
            <span>{option.label}</span>
          </div>
        );
      }
    }
    return <span>{id}</span>;
  };

  const cycleDay = user.lastPeriodStart ? calculateCycleDay(user.lastPeriodStart) : 0;
  const phase = user.lastPeriodStart
    ? getCurrentPhase(Math.min(cycleDay, stats.avgCycleLength), stats.avgCycleLength, stats.avgPeriodLength)
    : null;

  // Real cycle lengths from her logged history (most recent last)
  const cycleLengths = stats.recentCycleLengths;
  const maxLength = Math.max(...cycleLengths, 1);

  const cycleHistory = [...stats.episodes].reverse(); // newest first

  return (
    <div className="page-enter">
      <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BarChart2 size={24} /> Insights
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 'var(--space-lg)', marginTop: '-8px' }}>
        All your patterns and trends — completely free.
      </p>

      {/* Quick Stats */}
      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-value">{stats.avgCycleLength}</div>
          <div className="insight-label">{stats.learned ? 'Avg. Cycle Length' : 'Cycle Length (goal)'}</div>
        </div>
        <div className="insight-card">
          <div className="insight-value">{stats.avgPeriodLength}</div>
          <div className="insight-label">Avg. Period Length</div>
        </div>
        <div className="insight-card">
          <div className="insight-value">{totalLogs}</div>
          <div className="insight-label">Days Logged</div>
        </div>
        <div className="insight-card">
          <div className="insight-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            {avgWater} <Droplet size={18} color="var(--info)" />
          </div>
          <div className="insight-label">Avg. Water/Day</div>
        </div>
      </div>

      {/* Cycle Length Chart — real history only */}
      <div className="insight-chart">
        <div className="card-header" style={{ marginBottom: 0 }}>
          <span className="card-title">Cycle Length Trend</span>
          <span className="card-subtitle" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            Your last {cycleLengths.length} {cycleLengths.length === 1 ? 'cycle' : 'cycles'}
          </span>
        </div>
        {cycleLengths.length >= 2 ? (
          <div className="chart-bars">
            {cycleLengths.map((length, i) => (
              <div className="chart-bar-wrapper" key={i}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{length}</span>
                <div
                  className="chart-bar"
                  style={{
                    height: `${(length / maxLength) * 100}%`,
                    background: i === cycleLengths.length - 1
                      ? 'var(--primary)'
                      : 'var(--border-color-strong)',
                  }}
                />
                <span className="chart-bar-label" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  {i === cycleLengths.length - 1 ? 'Latest' : `−${cycleLengths.length - 1 - i}`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
              Log at least two periods and your real trend will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Current Phase Detail */}
      {phase && (
        <div 
          className="card clickable-card" 
          style={{ marginBottom: 'var(--space-md)', marginTop: 'var(--space-md)', cursor: 'pointer' }}
          onClick={() => setShowPhaseModal(true)}
        >
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
              {renderIcon(phase.icon, { size: 18, color: 'var(--text-primary)' })} Current Phase
              <span style={{ fontSize: '11px', color: 'var(--primary)', marginLeft: 'auto', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '12px' }}>Learn More</span>
            </span>
          </div>
          <div className={`cycle-phase-badge phase-${phase.name}`} style={{ marginTop: 0, marginBottom: 'var(--space-md)' }}>
            Day {phase.dayInPhase} of {phase.totalDaysInPhase} · {phase.label}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {phase.description}
          </p>
        </div>
      )}

      {/* Top Moods */}
      <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="card-header">
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smile size={18} /> Mood Patterns
          </span>
        </div>
        {topMoods.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {topMoods.map(([mood, count]) => {
              const maxCount = topMoods[0][1] as number;
              const percentage = (count / (maxCount as number)) * 100;
              return (
                <div key={mood} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <div style={{ fontSize: '13px', minWidth: '100px', fontWeight: 500 }}>
                    {getSymptomLabel(mood)}
                  </div>
                  <div style={{
                    flex: 1,
                    height: '8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-tertiary)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${percentage}%`,
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--primary-gradient)',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', minWidth: '24px', textAlign: 'right' }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-sm)' }}>
              <PenTool size={32} color="var(--border-color-strong)" />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
              Start logging your mood to see patterns!
            </p>
          </div>
        )}
      </div>

      {/* Top Symptoms */}
      <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="card-header">
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} /> Common Symptoms
          </span>
        </div>
        {topSymptoms.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {topSymptoms.map(([symptom, count]) => {
              const maxCount = topSymptoms[0][1] as number;
              const percentage = (count / (maxCount as number)) * 100;
              return (
                <div key={symptom} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <div style={{ fontSize: '13px', minWidth: '120px', fontWeight: 500 }}>
                    {getSymptomLabel(symptom)}
                  </div>
                  <div style={{
                    flex: 1,
                    height: '8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-tertiary)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${percentage}%`,
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--primary-light)',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', minWidth: '24px', textAlign: 'right' }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-sm)' }}>
              <Map size={32} color="var(--border-color-strong)" />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
              Log symptoms to discover your patterns!
            </p>
          </div>
        )}
      </div>

      {/* Patterns by phase */}
      {phasePatterns.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Map size={18} /> Your Patterns by Phase
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {phasePatterns.map(({ phaseName, top }) => (
              <div key={phaseName}>
                <div className={`cycle-phase-badge phase-${phaseName}`} style={{ marginBottom: '6px', fontSize: '12px' }}>
                  {phaseName.charAt(0).toUpperCase() + phaseName.slice(1)} phase
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {top.map(([symptomId, count]) => (
                    <span key={symptomId} style={{ fontSize: '13px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', padding: '4px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {getSymptomLabel(symptomId)}
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>×{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Period Stats */}
      <div className="card" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="card-header">
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplet size={18} color="var(--phase-menstrual)" /> Period Summary
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: 'var(--space-sm) 0',
            borderBottom: '1px solid var(--divider)',
          }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Period days logged</span>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--phase-menstrual)' }}>{periodDays}</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: 'var(--space-sm) 0',
            borderBottom: '1px solid var(--divider)',
          }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Average period length</span>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{stats.avgPeriodLength} days</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: 'var(--space-sm) 0',
          }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Average cycle length</span>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              {stats.avgCycleLength} days{stats.learned ? ` (±${stats.confidence})` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Cycle History */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)' }}>
        <div className="card-header" style={{ marginBottom: 'var(--space-md)' }}>
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--primary)" /> Cycle History
          </span>
        </div>
        
        {cycleHistory.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {cycleHistory.map((cycle, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-md) 0',
                borderBottom: i < cycleHistory.length - 1 ? '1px solid var(--divider)' : 'none'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {new Date(cycle.start + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {cycle.start !== cycle.end && ` - ${new Date(cycle.end + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Period length: {cycle.periodLength} {cycle.periodLength === 1 ? 'day' : 'days'}
                  </div>
                </div>
                
                {cycle.cycleLength ? (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {cycle.cycleLength} days
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cycle length</div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                    Current<br/>cycle
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 'var(--space-md)', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
              No complete cycles logged yet.
            </p>
          </div>
        )}
      </div>

      {showPhaseModal && phase && (
        <PhaseModal phase={phase} onClose={() => setShowPhaseModal(false)} />
      )}
    </div>
  );
}

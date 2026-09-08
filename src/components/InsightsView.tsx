'use client';

import React from 'react';
import { useAppContext } from '@/lib/store';
import { calculateCycleDay, getCurrentPhase, SYMPTOM_CATEGORIES } from '@/lib/cycle-utils';
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

const groupPeriodDates = (dates: string[]) => {
  if (!dates || dates.length === 0) return [];
  const sorted = [...new Set(dates)].sort();
  const periods = [];
  let currentPeriod = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1]);
    const currDate = new Date(sorted[i]);
    const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 10) {
      currentPeriod.push(sorted[i]);
    } else {
      periods.push(currentPeriod);
      currentPeriod = [sorted[i]];
    }
  }
  periods.push(currentPeriod);
  
  return periods.reverse().map((period, index, arr) => {
    const startDate = period[0];
    const endDate = period[period.length - 1];
    const length = period.length;
    
    // Calculate cycle length based on previous chronological period
    const prevChronologicalPeriod = arr[index + 1];
    let cycleLength = null;
    if (prevChronologicalPeriod) {
      const prevStart = new Date(prevChronologicalPeriod[0]);
      const currStart = new Date(startDate);
      cycleLength = Math.ceil(Math.abs(currStart.getTime() - prevStart.getTime()) / (1000 * 60 * 60 * 24));
    }
    
    return { startDate, endDate, length, cycleLength };
  });
};

export default function InsightsView() {
  const { state } = useAppContext();
  const user = state.user!;
  const logs = Object.values(state.logs);
  const [showPhaseModal, setShowPhaseModal] = React.useState(false);

  // Calculate stats
  const totalLogs = logs.length;
  const periodDays = logs.filter(l => l.isPeriod).length;
  const avgWater = totalLogs > 0 ? Math.round(logs.reduce((acc, l) => acc + (l.waterGlasses || 0), 0) / totalLogs) : 0;

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

  // Cycle visualization data (last 6 cycles)
  const cycleDay = user.lastPeriodStart ? calculateCycleDay(user.lastPeriodStart) : 0;
  const phase = user.lastPeriodStart ? getCurrentPhase(cycleDay, user.cycleLength, user.periodLength) : null;

  // Generate mock cycle length data for chart
  const cycleLengths = [user.cycleLength - 1, user.cycleLength, user.cycleLength + 2, user.cycleLength - 2, user.cycleLength, user.cycleLength + 1];
  const maxLength = Math.max(...cycleLengths);

  const cycleHistory = groupPeriodDates(user.periodDates);

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
          <div className="insight-value">{user.cycleLength}</div>
          <div className="insight-label">Avg. Cycle Length</div>
        </div>
        <div className="insight-card">
          <div className="insight-value">{user.periodLength}</div>
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

      {/* Cycle Length Chart */}
      <div className="insight-chart">
        <div className="card-header" style={{ marginBottom: 0 }}>
          <span className="card-title">Cycle Length Trend</span>
          <span className="card-subtitle" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Last 6 cycles</span>
        </div>
        <div className="chart-bars">
          {cycleLengths.map((length, i) => (
            <div className="chart-bar-wrapper" key={i}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{length}</span>
              <div
                className="chart-bar"
                style={{
                  height: `${(length / maxLength) * 100}%`,
                  background: i === cycleLengths.length - 1
                    ? 'var(--primary-gradient)'
                    : 'var(--border-color-strong)',
                }}
              />
              <span className="chart-bar-label" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>C{i + 1}</span>
            </div>
          ))}
        </div>
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
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{user.periodLength} days</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: 'var(--space-sm) 0',
          }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Average cycle length</span>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{user.cycleLength} days</span>
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
                    {new Date(cycle.startDate + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {cycle.startDate !== cycle.endDate && ` - ${new Date(cycle.endDate + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Period length: {cycle.length} {cycle.length === 1 ? 'day' : 'days'}
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
                    First logged<br/>cycle
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

import React from 'react';
import { PhaseInfo } from '@/lib/cycle-utils';
import { Utensils, Activity, Heart } from 'lucide-react';
import * as Icons from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderIcon = (name: string, props: any = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) return null;
  return <IconComponent {...props} />;
};

interface PhaseModalProps {
  phase: PhaseInfo;
  onClose: () => void;
}

export default function PhaseModal({ phase, onClose }: PhaseModalProps) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'var(--bg-overlay)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className="card" style={{
        margin: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
        maxHeight: '90vh', overflowY: 'auto', padding: 'var(--space-xl)',
        animation: 'slideUp 0.3s ease-out', boxShadow: '0 -10px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className={`cycle-phase-badge phase-${phase.name}`} style={{ margin: 0 }}>
              {renderIcon(phase.icon, { size: 16 })} {phase.label}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="log-close-btn"
            style={{ background: 'var(--bg-tertiary)', border: 'none', width: '32px', height: '32px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            {renderIcon('X', { size: 18, color: 'var(--text-secondary)' })}
          </button>
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
          Your Body Right Now
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-xl)' }}>
          {phase.description}
        </p>

        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)' }}>
            <Utensils size={18} color="var(--primary)" /> 
            Foods to Eat
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {phase.nutritionTips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ marginTop: '2px' }}>{renderIcon('CheckCircle2', { size: 16, color: 'var(--success)' })}</div>
                <span style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--text-primary)' }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)' }}>
            <Activity size={18} color="var(--info)" /> 
            Suggested Movement
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {phase.exerciseTips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ marginTop: '2px' }}>{renderIcon('PlaySquare', { size: 16, color: 'var(--info)' })}</div>
                <span style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--text-primary)' }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-md)' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-md)' }}>
            <Heart size={18} color="var(--phase-menstrual)" /> 
            Self-Care & Wellness
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {phase.tips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '12px' }}>
                <div style={{ minWidth: '4px', height: '4px', background: 'var(--text-tertiary)', borderRadius: '50%' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

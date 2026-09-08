'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppContext, DayLog } from '@/lib/store';
import { SYMPTOM_CATEGORIES, formatDate } from '@/lib/cycle-utils';
import { X, Droplets, Plus, Minus, CheckCircle, Droplet } from 'lucide-react';
import { renderIcon } from '@/lib/icons';

interface LogScreenProps {
  date?: string;
  initialSection?: string; // 'period', a symptom category key, 'water', or 'journal'
  onClose: () => void;
}

const FLOW_OPTIONS = [
  { id: 'spotting', label: 'Spotting', drops: 1 },
  { id: 'light', label: 'Light', drops: 2 },
  { id: 'medium', label: 'Medium', drops: 3 },
  { id: 'heavy', label: 'Heavy', drops: 4 },
] as const;

export default function LogScreen({ date, initialSection, onClose }: LogScreenProps) {
  const { logDay, getLog } = useAppContext();
  const logDate = date || formatDate(new Date());

  const existingLog = getLog(logDate);

  // Opening via "Log Period" pre-selects period mode
  const [isPeriod, setIsPeriod] = useState(existingLog?.isPeriod || initialSection === 'period');
  const [flow, setFlow] = useState<DayLog['flow']>(existingLog?.flow);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, string[]>>({
    mood: existingLog?.mood || [],
    pain: existingLog?.pain || [],
    body: existingLog?.body || [],
    discharge: existingLog?.discharge || [],
    activity: existingLog?.activity || [],
    sleep: existingLog?.sleep || [],
    sexual: existingLog?.sexual || [],
    digestion: existingLog?.digestion || [],
    energy: existingLog?.energy || [],
  });
  const [notes, setNotes] = useState(existingLog?.notes || '');
  const [waterGlasses, setWaterGlasses] = useState(existingLog?.waterGlasses || 0);
  const [showToast, setShowToast] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // Scroll to the section she tapped (e.g. "Mood" from the dashboard)
  useEffect(() => {
    if (initialSection && initialSection !== 'period') {
      document.getElementById(`log-section-${initialSection}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [initialSection]);

  const toggleSymptom = (category: string, symptomId: string) => {
    setSelectedSymptoms(prev => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const current = (prev as any)[category] || [];
      const isSelected = current.includes(symptomId);
      return {
        ...prev,
        [category]: isSelected
          ? current.filter((s: string) => s !== symptomId)
          : [...current, symptomId],
      };
    });
  };

  const handleSave = () => {
    const log: DayLog = {
      date: logDate,
      isPeriod,
      flow: isPeriod ? flow : undefined,
      symptoms: [
        ...selectedSymptoms.pain,
        ...selectedSymptoms.body,
      ],
      mood: selectedSymptoms.mood,
      pain: selectedSymptoms.pain,
      body: selectedSymptoms.body,
      discharge: selectedSymptoms.discharge,
      activity: selectedSymptoms.activity,
      sleep: selectedSymptoms.sleep,
      sexual: selectedSymptoms.sexual,
      digestion: selectedSymptoms.digestion,
      energy: selectedSymptoms.energy,
      notes,
      waterGlasses,
      medications: [],
    };

    logDay(log);
    setShowToast(true);
    closeTimer.current = setTimeout(() => {
      setShowToast(false);
      onClose();
    }, 1500);
  };

  const displayDate = new Date(logDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="log-screen">
      {/* Toast */}
      {showToast && (
        <div className="toast toast-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} /> Saved successfully!
        </div>
      )}

      {/* Header */}
      <div className="log-header">
        <button className="log-close-btn" onClick={onClose} id="log-close-btn">
          <X size={18} />
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '16px' }}>
          {displayDate}
        </span>
        <button className="log-save-btn" onClick={handleSave} id="log-save-btn">
          Save
        </button>
      </div>

      {/* Quick jump between sections — the form is long */}
      <nav className="log-quick-nav" aria-label="Log sections">
        {[
          { id: 'period', label: 'Period' },
          ...Object.entries(SYMPTOM_CATEGORIES).map(([key, category]) => ({ id: key, label: category.label })),
          { id: 'water', label: 'Water' },
          { id: 'journal', label: 'Journal' },
        ].map(section => (
          <button
            key={section.id}
            className="log-quick-nav-chip"
            onClick={() => document.getElementById(`log-section-${section.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            {section.label}
          </button>
        ))}
      </nav>

      <div className="log-content">
        {/* Period Toggle */}
        <div className="log-section" id="log-section-period">
          <h3 className="log-section-title">
            <Droplets size={18} color="var(--phase-menstrual)" />
            Period
          </h3>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <button
              className={`log-option ${isPeriod ? 'selected' : ''}`}
              onClick={() => setIsPeriod(true)}
              style={isPeriod ? { background: 'var(--phase-menstrual)', borderColor: 'var(--phase-menstrual)', color: 'white' } : {}}
            >
              {renderIcon('Droplet', { size: 16, color: isPeriod ? 'white' : 'var(--text-secondary)' })} Yes, on my period
            </button>
            <button
              className={`log-option ${!isPeriod ? 'selected' : ''}`}
              onClick={() => setIsPeriod(false)}
            >
              {renderIcon('X', { size: 16 })} No
            </button>
          </div>

          {/* Flow intensity */}
          {isPeriod && (
            <div className="flow-selector">
              {FLOW_OPTIONS.map(option => (
                <button
                  key={option.id}
                  className={`flow-option ${flow === option.id ? 'selected' : ''}`}
                  onClick={() => setFlow(option.id)}
                >
                  <div className="flow-drops">
                    {Array.from({ length: option.drops }, (_, i) => (
                      <span key={i}><Droplet size={14} fill="currentColor" /></span>
                    ))}
                  </div>
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Symptom Categories */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {Object.entries(SYMPTOM_CATEGORIES).map(([key, category]: [string, any]) => (
          <div className="log-section" key={key} id={`log-section-${key}`}>
            <h3 className="log-section-title">
              {renderIcon(category.icon, { size: 18, color: 'var(--text-secondary)' })}
              {category.label}
            </h3>
            <div className="log-options">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {category.options.map((option: any) => (
                <button
                  key={option.id}
                  className={`log-option ${(selectedSymptoms[key] || []).includes(option.id) ? 'selected' : ''}`}
                  onClick={() => toggleSymptom(key, option.id)}
                >
                  {renderIcon(option.icon, { size: 16, className: 'option-icon' })}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Water Intake */}
        <div className="log-section" id="log-section-water">
          <h3 className="log-section-title">
            {renderIcon('Droplet', { size: 18, color: 'var(--info)' })}
            Water Intake
          </h3>
          <div className="tracker-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
            <span style={{ flex: 1, fontSize: '14px', color: 'var(--text-secondary)' }}>Glasses of water</span>
            <div className="tracker-count" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                className="tracker-btn"
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setWaterGlasses(prev => Math.max(0, prev - 1))}
              >
                <Minus size={16} color="var(--text-primary)" />
              </button>
              <span className="tracker-value" style={{ fontSize: '20px', fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>
                {waterGlasses}
              </span>
              <button
                className="tracker-btn"
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setWaterGlasses(prev => prev + 1)}
              >
                <Plus size={16} color="var(--text-primary)" />
              </button>
            </div>
          </div>
        </div>

        {/* Notes / Journal */}
        <div className="log-section" id="log-section-journal">
          <h3 className="log-section-title">
            {renderIcon('PenTool', { size: 18, color: 'var(--text-secondary)' })}
            Journal
          </h3>
          <textarea
            className="journal-textarea"
            placeholder="How are you feeling today? Write anything you'd like to remember about today..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            id="journal-textarea"
          />
        </div>
        
        {/* Bottom padding for the save button area */}
        <div style={{ height: '40px' }} />
      </div>
    </div>
  );
}

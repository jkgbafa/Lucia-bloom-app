'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/lib/store';
import { Bell, Heart, Sparkles } from 'lucide-react';

const ONBOARDING_STEPS = [
  {
    question: "Hi Lucia!",
    description: "Joshua built this app just for Lucia because he loves you and has been thinking about you. He took the time to create this completely from scratch so you never have to be surprised by your cycle again, and can always be prepared. Let's set it up together!",
    type: 'welcome',
  },
  {
    question: "When did your last period start?",
    description: "If you're not sure of the exact date, your best guess works perfectly.",
    type: 'date',
    field: 'lastPeriodStart',
  },
  {
    question: "How long is your typical cycle?",
    description: "Count from the first day of one period to the first day of the next. Most cycles are 21-35 days. The average is 28.",
    type: 'number',
    field: 'cycleLength',
    min: 21,
    max: 45,
    default: 28,
    unit: 'days',
  },
  {
    question: "How long does your period usually last?",
    description: "This is how many days you typically bleed. Most periods last 3-7 days.",
    type: 'number',
    field: 'periodLength',
    min: 1,
    max: 10,
    default: 5,
    unit: 'days',
  },
  {
    question: "Would you like gentle reminders?",
    description: "I can notify you when your period is approaching, when you enter a new phase, and more. You can customize these anytime.",
    type: 'toggle',
    field: 'notificationsEnabled',
  },
  {
    question: "You're all set!",
    description: "I've personalized everything based on your cycle. Your dashboard is ready — let's take care of you, Lucia.",
    type: 'complete',
  },
];

export default function OnboardingScreen() {
  const { updateUser } = useAppContext();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string | number | boolean>>({
    lastPeriodStart: '',
    cycleLength: 28,
    periodLength: 5,
    notificationsEnabled: true,
  });

  const currentStep = ONBOARDING_STEPS[step];
  const totalSteps = ONBOARDING_STEPS.length;

  const handleNext = () => {
    if (step === totalSteps - 1) {
      // Complete onboarding
      updateUser({
        lastPeriodStart: values.lastPeriodStart as string,
        cycleLength: values.cycleLength as number,
        periodLength: values.periodLength as number,
        notificationsEnabled: values.notificationsEnabled as boolean,
        onboardingComplete: true,
      });
      return;
    }
    setStep(prev => Math.min(prev + 1, totalSteps - 1));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 0));
  };

  const canProceed = () => {
    if (currentStep.type === 'date' && currentStep.field) {
      return !!values[currentStep.field];
    }
    if (currentStep.type === 'number' && currentStep.field) {
      const val = values[currentStep.field] as number;
      return val >= (currentStep.min || 1) && val <= (currentStep.max || 99);
    }
    return true;
  };

  return (
    <div className="onboarding-screen">
      {/* Progress dots */}
      <div className="onboarding-progress">
        {ONBOARDING_STEPS.map((_, i) => (
          <div
            key={i}
            className={`onboarding-dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
          />
        ))}
      </div>

      <div className="page-enter" key={step}>
        <h2 className="onboarding-question">{currentStep.question}</h2>
        <p className="onboarding-desc">{currentStep.description}</p>

        {/* Date input */}
        {currentStep.type === 'date' && currentStep.field && (
          <input
            type="date"
            className="onboarding-input"
            value={values[currentStep.field] as string}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setValues(prev => ({ ...prev, [currentStep.field!]: e.target.value }))}
            id="onboarding-date-input"
          />
        )}

        {/* Number input */}
        {currentStep.type === 'number' && currentStep.field && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <input
              type="number"
              className="onboarding-input"
              value={values[currentStep.field] as number}
              min={currentStep.min}
              max={currentStep.max}
              onChange={(e) => setValues(prev => ({ ...prev, [currentStep.field!]: parseInt(e.target.value) || currentStep.default || 0 }))}
              style={{ textAlign: 'center', fontSize: '24px', fontWeight: 700 }}
              id={`onboarding-${currentStep.field}-input`}
            />
            <span style={{ color: 'var(--text-secondary)', fontSize: '16px', fontWeight: 500 }}>
              {currentStep.unit}
            </span>
          </div>
        )}

        {/* Toggle */}
        {currentStep.type === 'toggle' && currentStep.field && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div className="settings-item" onClick={() => setValues(prev => ({ ...prev, [currentStep.field!]: !prev[currentStep.field!] }))}>
              <div className="settings-item-left">
                <div className="settings-item-icon">
                  <Bell size={20} />
                </div>
                <div className="settings-item-text">
                  <h3>Enable Notifications</h3>
                  <p>Period reminders, phase changes, and wellness tips</p>
                </div>
              </div>
              <button className={`toggle ${values[currentStep.field!] ? 'active' : ''}`} />
            </div>
          </div>
        )}

        {/* Welcome illustration */}
        {currentStep.type === 'welcome' && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            margin: 'var(--space-2xl) 0',
            animation: 'fadeIn 1s ease-in-out',
          }}>
            <Heart size={80} color="var(--primary)" />
          </div>
        )}

        {/* Complete illustration */}
        {currentStep.type === 'complete' && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            margin: 'var(--space-2xl) 0',
            animation: 'fadeIn 1s ease-in-out',
          }}>
            <Sparkles size={80} color="var(--primary)" />
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="onboarding-buttons" style={{ marginTop: 'auto', display: 'flex', gap: '16px' }}>
        {step > 0 && (
          <button className="onboarding-btn onboarding-btn-secondary" onClick={handleBack} style={{ flex: 1 }}>
            Back
          </button>
        )}
        <button
          className="onboarding-btn onboarding-btn-primary"
          onClick={handleNext}
          disabled={!canProceed()}
          style={{ opacity: canProceed() ? 1 : 0.5, flex: 2 }}
          id="onboarding-next-btn"
        >
          {step === totalSteps - 1 ? "Let's Go!" : 'Continue'}
        </button>
      </div>
    </div>
  );
}

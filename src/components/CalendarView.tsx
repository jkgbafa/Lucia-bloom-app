'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/lib/store';
import { getDayInfo, formatDate, getMonthDays } from '@/lib/cycle-utils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarProps {
  onSelectDate: (date: string) => void;
}

export default function CalendarView({ onSelectDate }: CalendarProps) {
  const { state } = useAppContext();
  const user = state.user!;
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getMonthDays(currentYear, currentMonth);
  const firstDayOfWeek = days[0].getDay();
  const todayStr = formatDate(new Date());

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    onSelectDate(dateStr);
  };

  const getDayClassName = (date: Date): string => {
    if (!user.lastPeriodStart) return '';

    const dateStr = formatDate(date);
    const dayInfo = getDayInfo(
      dateStr,
      user.lastPeriodStart,
      user.cycleLength,
      user.periodLength,
      user.periodDates || []
    );

    const classes: string[] = [];

    if (dateStr === todayStr) classes.push('today');
    if (dateStr === selectedDate) classes.push('selected');

    // Check if this day has a log
    const hasLog = state.logs[dateStr];

    if (dayInfo.isPeriod) {
      classes.push('period');
    } else if (dayInfo.isPredictedPeriod) {
      classes.push('predicted-period');
    } else if (dayInfo.isOvulation) {
      classes.push('ovulation');
    } else if (dayInfo.isFertile) {
      classes.push('fertile');
    } else if (dayInfo.phase === 'luteal') {
      classes.push('luteal');
    } else if (dayInfo.phase === 'follicular') {
      classes.push('follicular');
    }

    if (hasLog) classes.push('has-log');

    return classes.join(' ');
  };

  // Get selected day details
  const selectedDayInfo = selectedDate && user.lastPeriodStart
    ? getDayInfo(selectedDate, user.lastPeriodStart, user.cycleLength, user.periodLength, user.periodDates || [])
    : null;

  const selectedLog = selectedDate ? state.logs[selectedDate] : null;

  return (
    <div className="page-enter">
      <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CalendarIcon size={24} /> Calendar
      </h2>

      <div className="calendar-container">
        <div className="calendar-header">
          <button className="calendar-nav-btn" onClick={prevMonth} id="calendar-prev-btn">
            <ChevronLeft size={18} />
          </button>
          <span className="calendar-month-year">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button className="calendar-nav-btn" onClick={nextMonth} id="calendar-next-btn">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="calendar-weekdays">
          {weekDays.map(day => (
            <div key={day} className="calendar-weekday">{day}</div>
          ))}
        </div>

        <div className="calendar-days">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} className="calendar-day empty" />
          ))}

          {/* Calendar days */}
          {days.map((date) => {
            const dateStr = formatDate(date);
            const hasLog = !!state.logs[dateStr];
            return (
              <button
                key={dateStr}
                className={`calendar-day ${getDayClassName(date)}`}
                onClick={() => handleDayClick(dateStr)}
              >
                {date.getDate()}
                {hasLog && <span className="day-dot" />}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--phase-menstrual)' }} />
            <span>Period</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--phase-ovulation)' }} />
            <span>Ovulation</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--phase-ovulation)', opacity: 0.4 }} />
            <span>Fertile</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ border: '2px dashed var(--phase-menstrual)', background: 'transparent' }} />
            <span>Predicted</span>
          </div>
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDate && (
        <div className="card" style={{ marginTop: 'var(--space-md)', animation: 'fadeInUp 0.3s ease' }}>
          <div className="card-header">
            <span className="card-title">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {selectedDayInfo && (
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <div className={`cycle-phase-badge phase-${selectedDayInfo.phase}`} style={{ marginTop: 0 }}>
                Day {selectedDayInfo.cycleDay} · {selectedDayInfo.phase.charAt(0).toUpperCase() + selectedDayInfo.phase.slice(1)} Phase
              </div>
            </div>
          )}

          {selectedLog ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {selectedLog.isPeriod && selectedLog.flow && (
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <strong>Flow:</strong> {selectedLog.flow}
                </div>
              )}
              {selectedLog.mood.length > 0 && (
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <strong>Mood:</strong> {selectedLog.mood.join(', ')}
                </div>
              )}
              {selectedLog.symptoms.length > 0 && (
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <strong>Symptoms:</strong> {selectedLog.symptoms.join(', ')}
                </div>
              )}
              {selectedLog.notes && (
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  &quot;{selectedLog.notes}&quot;
                </div>
              )}
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
              No data logged for this day. Tap the + button to log.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

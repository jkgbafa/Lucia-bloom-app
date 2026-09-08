// Self-check for the cycle prediction logic.
// Run: node --experimental-strip-types tests/cycle-utils.check.ts
import assert from 'node:assert';
import {
  groupPeriodEpisodes,
  computeCycleStats,
  calculateCycleDay,
  formatDate,
  parseLocalDate,
} from '../src/lib/cycle-utils.ts';

// --- groupPeriodEpisodes: three periods, one with a 1-day logging gap inside it
const episodes = groupPeriodEpisodes([
  '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-05', // one period (small gap = same episode)
  '2026-01-29', '2026-01-30', '2026-01-31', '2026-02-01', '2026-02-02',
  '2026-02-26', '2026-02-27', '2026-02-28',
]);
assert.strictEqual(episodes.length, 3, 'should find 3 periods');
assert.strictEqual(episodes[0].start, '2026-01-01');
assert.strictEqual(episodes[0].end, '2026-01-05');
assert.strictEqual(episodes[0].cycleLength, 28, 'Jan 1 -> Jan 29');
assert.strictEqual(episodes[1].cycleLength, 28, 'Jan 29 -> Feb 26');
assert.strictEqual(episodes[2].cycleLength, null, 'last episode has no next start');

// --- computeCycleStats learns from history, ignoring the onboarding constant
const profile = {
  periodDates: [
    '2026-01-01', '2026-01-02', '2026-01-03',
    '2026-01-27', '2026-01-28', '2026-01-29', // 26-day cycle
    '2026-02-22', '2026-02-23', '2026-02-24', // 26-day cycle
  ],
  lastPeriodStart: '2026-02-22',
  cycleLength: 99, // wrong on purpose: learned value must win
  periodLength: 5,
};
const stats = computeCycleStats(profile, parseLocalDate('2026-03-01'));
assert.strictEqual(stats.learned, true);
assert.strictEqual(stats.avgCycleLength, 26, 'median of [26, 26]');
assert.strictEqual(stats.avgPeriodLength, 3, 'mean of logged period lengths');
assert.strictEqual(formatDate(stats.nextPeriodDate), '2026-03-20', 'Feb 22 + 26 days');
assert.strictEqual(stats.daysUntilPeriod, 19);
assert.strictEqual(stats.overdueDays, 0);

// --- outlier resistance: one 45-day gap (missed logging) doesn't wreck the median
const outlierStats = computeCycleStats({
  periodDates: ['2025-10-01', '2025-10-27', '2025-11-22', '2026-01-06', '2026-02-01'],
  lastPeriodStart: '2026-02-01',
  cycleLength: 28,
  periodLength: 5,
}, parseLocalDate('2026-02-10'));
assert.strictEqual(outlierStats.avgCycleLength, 26, 'median [26,26,45,26] -> 26');

// --- overdue detection: predicted Feb 27, nothing logged, today Mar 3 = 4 days overdue
const overdue = computeCycleStats({
  periodDates: ['2026-01-06', '2026-02-01'], // 26-day cycle... but only 1 gap -> falls back
  lastPeriodStart: '2026-02-01',
  cycleLength: 26,
  periodLength: 5,
}, parseLocalDate('2026-03-03'));
assert.strictEqual(overdue.learned, false, 'one completed cycle is not enough to learn');
assert.strictEqual(formatDate(overdue.nextPeriodDate), '2026-02-27');
assert.strictEqual(overdue.overdueDays, 4);
assert.strictEqual(overdue.daysUntilPeriod, -4);

// --- no history at all: falls back to onboarding settings
const fresh = computeCycleStats(
  { periodDates: [], lastPeriodStart: '2026-04-09', cycleLength: 26, periodLength: 5 },
  parseLocalDate('2026-04-20')
);
assert.strictEqual(fresh.learned, false);
assert.strictEqual(fresh.avgCycleLength, 26);
assert.strictEqual(formatDate(fresh.nextPeriodDate), '2026-05-05', 'Apr 9 + 26');

// --- calculateCycleDay counts real days, no 28-day wraparound
assert.strictEqual(calculateCycleDay('2026-01-01', parseLocalDate('2026-01-01')), 1);
assert.strictEqual(calculateCycleDay('2026-01-01', parseLocalDate('2026-01-31')), 31, 'day 31, not wrapped to 3');

// --- formatDate is local, parseLocalDate roundtrips
assert.strictEqual(formatDate(parseLocalDate('2026-03-05')), '2026-03-05');
assert.strictEqual(formatDate(new Date(2026, 0, 1, 0, 30)), '2026-01-01', 'half past midnight local stays Jan 1');

console.log('cycle-utils: all checks passed');

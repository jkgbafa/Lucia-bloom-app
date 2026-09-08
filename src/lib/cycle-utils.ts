// Cycle calculation utilities

export interface CycleData {
  periodStartDates: string[]; // ISO date strings
  periodEndDates: string[];
  cycleLength: number;
  periodLength: number;
  lastPeriodStart: string;
  lastPeriodEnd: string;
}

export interface PhaseInfo {
  name: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  label: string;
  dayInPhase: number;
  totalDaysInPhase: number;
  description: string;
  tips: string[];
  icon: string;
  color: string;
  nutritionTips: string[];
  exerciseTips: string[];
}

export interface DayInfo {
  date: string;
  cycleDay: number;
  phase: PhaseInfo['name'];
  isPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  isPredictedPeriod: boolean;
}

const PHASE_DATA: Record<string, Omit<PhaseInfo, 'dayInPhase' | 'totalDaysInPhase' | 'name'>> = {
  menstrual: {
    label: 'Menstrual Phase',
    description: 'Your body is shedding the uterine lining. It\'s normal to feel more tired and introspective during this time. Listen to your body and rest when needed.',
    tips: [
      'Stay hydrated — aim for at least 8 glasses of water',
      'Gentle stretches or yoga can help ease cramps',
      'Iron-rich foods help replenish what you lose',
      'A warm compress on your lower abdomen soothes cramps',
      'It\'s okay to slow down and rest more',
    ],
    icon: 'Moon',
    color: 'var(--phase-menstrual)',
    nutritionTips: [
      'Eat iron-rich foods to replenish what you lose: spinach, lentils, dark chocolate, and red meat.',
      'Increase omega-3 fatty acids to reduce inflammation: wild-caught salmon, walnuts, flaxseeds.',
      'Enjoy warm, comforting meals like bone broth soups and root vegetable stews.',
      'Avoid excessive caffeine, which can exacerbate cramps and anxiety.',
      'Minimize salty foods to reduce natural period bloating.',
      'Drink ginger or peppermint tea to intensely soothe uterine cramps.',
      'Eat Vitamin C rich foods (citrus, bell peppers) to help your body absorb iron better.',
      'Stay extremely hydrated! Water flushes out sodium and reduces bloating significantly.',
    ],
    exerciseTips: [
      'Gentle yoga and restorative stretching',
      'Light, unhurried walking outdoors',
      'Restorative activities and deliberate rest',
      'Skip high-intensity workouts if you feel fatigued',
      'Focus strictly on mobility and easing pelvic pressure',
    ],
  },
  follicular: {
    label: 'Follicular Phase',
    description: 'Estrogen is rising! You may feel more energetic, creative, and social. This is a great time to start new projects and try new things.',
    tips: [
      'Energy levels are climbing — great time for new challenges',
      'Your skin may look clearer during this phase',
      'Social activities feel more enjoyable now',
      'Try planning creative projects for this phase',
      'This is a good time to increase exercise intensity',
    ],
    icon: 'Leaf',
    color: 'var(--phase-follicular)',
    nutritionTips: [
      'Eat light, fresh, vibrant foods: raw salads, fermented foods like kimchi or sauerkraut.',
      'Lean proteins (chicken, turkey, tofu) to support your rapidly growing energy.',
      'Sprouted grains, seeds, and nuts for sustained, even energy.',
      'Probiotic-rich foods (kombucha, yogurt) to support gut health as estrogen rises.',
      'Cruciferous vegetables (broccoli, cauliflower, kale) help your body naturally metabolize estrogen.',
      'Oats and complex carbs provide the fuel your body needs for its new high-energy state.',
      'Add pumpkin seeds and flaxseeds to support estrogen production naturally.',
      'Hydrate with fresh juices or infused waters to match your refreshing internal energy.',
    ],
    exerciseTips: [
      'Cardio and high-energy workouts are perfect now',
      'Try totally new exercise classes to match your high curiosity',
      'Strength training and lifting weights',
      'Running, cycling, or intense hiking',
      'Your physical endurance starts peaking here',
    ],
  },
  ovulation: {
    label: 'Ovulation Phase',
    description: 'Peak fertility window! Estrogen peaks and you may feel confident, energetic, and social. Your body temperature slightly increases.',
    tips: [
      'This is your most fertile window',
      'You might notice thin, stretchy cervical mucus',
      'Energy and libido tend to be at their highest',
      'Communication skills peak — great for important conversations',
      'Your skin may have a natural glow',
    ],
    icon: 'Sparkles',
    color: 'var(--phase-ovulation)',
    nutritionTips: [
      'Load up on antioxidant-rich foods: blueberries, raspberries, and dark leafy greens.',
      'High-fiber vegetables (asparagus, Brussels sprouts) prevent estrogen dominance.',
      'Whole grains (quinoa, brown rice) support sustained, high-vibration energy.',
      'Eat light, frequent meals that don\'t weigh your digestive system down.',
      'Incorporate raw foods and smoothies; your digestion is very strong right now.',
      'Maca root powder can be added to your diet to support peak libido and stamina.',
      'Healthy fats (avocado, olive oil) keep your skin glowing at its peak.',
      'Zinc-rich foods (oysters, hemp seeds, pumpkin seeds) support a healthy egg release.',
    ],
    exerciseTips: [
      'Absolute peak physical performance time — go for personal bests!',
      'HIIT (High-Intensity Interval Training) workouts',
      'Group fitness classes and highly social sports',
      'Competitive activities or marathons',
      'You have the most natural stamina right now than any other time of the month.',
    ],
  },
  luteal: {
    label: 'Luteal Phase',
    description: 'Progesterone rises as your body prepares for a potential pregnancy. You may feel more introverted. PMS symptoms can appear in the late luteal phase.',
    tips: [
      'Cravings are normal — satisfy them mindfully',
      'Prioritize sleep — aim for 7-9 hours',
      'Magnesium-rich foods may ease irritability',
      'Gentle self-care activities help manage PMS',
      'Bloating is normal — loose clothing can help',
    ],
    icon: 'Feather',
    color: 'var(--phase-luteal)',
    nutritionTips: [
      'Focus heavily on complex carbs (sweet potatoes, root vegetables, brown rice) to natively boost serotonin and fight mood dips.',
      'Eat Magnesium-rich foods daily (dark chocolate, almonds, bananas) to reduce irritability and prevent upcoming cramps.',
      'B6-rich foods (chickpeas, avocado, salmon) naturally support mood stability.',
      'Strictly reduce caffeine and alcohol, as both dramatically worsen PMS symptoms.',
      'Eat foods high in calcium (yogurt, leafy greens) which has been medically shown to reduce PMS mood swings.',
      'Warm up your digestion: switch from raw salads to roasted vegetables as your core temperature rises.',
      'Drink dandelion root tea or eat asparagus to naturally reduce excess water weight and bloating.',
      'Satisfy your cravings mindfully, but pair sugars with proteins and healthy fats to prevent blood sugar spikes and crashes.',
    ],
    exerciseTips: [
      'Moderate exercise: walking, swimming, light jogging',
      'Pilates, barre, and core-focused workouts early on',
      'Gradually reduce workout intensity as your actual period approaches',
      'Focus heavily on stretching, foam rolling, and mobility',
      'Listen closely to your body—if you feel tired, swap the run for a walk.',
    ],
  },
};

// Parse 'YYYY-MM-DD' as local midnight (new Date('YYYY-MM-DD') is UTC midnight,
// which shifts the day for anyone west of Greenwich).
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(a: Date, b: Date): number {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / (1000 * 60 * 60 * 24));
}

export interface PeriodEpisode {
  start: string;
  end: string;
  periodLength: number;
  cycleLength: number | null; // days from this start to the next episode's start
}

// Group individually logged period dates into distinct periods.
// A gap of more than 10 days between logged dates starts a new period.
export function groupPeriodEpisodes(periodDates: string[]): PeriodEpisode[] {
  const dates = [...new Set(periodDates)].sort();
  const episodes: PeriodEpisode[] = [];
  let start: string | null = null;
  let prev: string | null = null;

  for (const date of dates) {
    if (start === null || prev === null || daysBetween(parseLocalDate(prev), parseLocalDate(date)) > 10) {
      if (start !== null && prev !== null) {
        episodes.push({ start, end: prev, periodLength: daysBetween(parseLocalDate(start), parseLocalDate(prev)) + 1, cycleLength: null });
      }
      start = date;
    }
    prev = date;
  }
  if (start !== null && prev !== null) {
    episodes.push({ start, end: prev, periodLength: daysBetween(parseLocalDate(start), parseLocalDate(prev)) + 1, cycleLength: null });
  }

  for (let i = 0; i < episodes.length - 1; i++) {
    episodes[i].cycleLength = daysBetween(parseLocalDate(episodes[i].start), parseLocalDate(episodes[i + 1].start));
  }
  return episodes;
}

export interface CycleStats {
  avgCycleLength: number;
  avgPeriodLength: number;
  confidence: number; // predictions are "± confidence days"
  learned: boolean; // true when based on at least 2 completed real cycles
  episodes: PeriodEpisode[];
  recentCycleLengths: number[]; // most recent last, plausible values only
  nextPeriodDate: Date;
  daysUntilPeriod: number; // negative when the predicted date has passed
  overdueDays: number; // days past the predicted start with no period logged (0 if none)
  ovulationDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

// Predict from her real logged history instead of the onboarding constants.
// Median of the last 6 plausible cycle lengths resists one-off outliers
// (a skipped month or forgotten log won't wreck predictions).
export function computeCycleStats(
  profile: { periodDates?: string[]; lastPeriodStart: string; cycleLength: number; periodLength: number },
  today: Date = new Date()
): CycleStats {
  const episodes = groupPeriodEpisodes(profile.periodDates || []);

  const plausible = episodes
    .map(e => e.cycleLength)
    .filter((len): len is number => len !== null && len >= 15 && len <= 60);
  const recentCycleLengths = plausible.slice(-6);
  const learned = recentCycleLengths.length >= 2;

  const avgCycleLength = learned ? median(recentCycleLengths) : (profile.cycleLength || 28);

  const periodLengths = episodes.map(e => e.periodLength).filter(len => len >= 1 && len <= 10);
  const avgPeriodLength = periodLengths.length >= 2
    ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
    : (profile.periodLength || 5);

  // Spread of recent cycles → how much the prediction can wobble
  let confidence = 2;
  if (learned) {
    const dev = recentCycleLengths.map(len => Math.abs(len - avgCycleLength));
    confidence = Math.max(1, Math.min(7, median(dev) || 1));
  }

  const lastStart = episodes.length > 0
    ? episodes[episodes.length - 1].start
    : profile.lastPeriodStart;

  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let nextPeriodDate: Date;
  let overdueDays = 0;

  if (lastStart) {
    const anchor = parseLocalDate(lastStart);
    nextPeriodDate = new Date(anchor);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + avgCycleLength);

    if (nextPeriodDate < todayMid) {
      // Prediction passed with nothing logged: she's overdue (or forgot to log)
      overdueDays = daysBetween(nextPeriodDate, todayMid);
    }
  } else {
    nextPeriodDate = new Date(todayMid);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + avgCycleLength);
  }

  const daysUntilPeriod = daysBetween(todayMid, nextPeriodDate);

  // If overdue, ovulation/fertile projections roll forward to the next expected cycle
  const projectionAnchor = overdueDays > 0 ? new Date(nextPeriodDate.getTime()) : nextPeriodDate;
  while (overdueDays > 0 && projectionAnchor < todayMid) {
    projectionAnchor.setDate(projectionAnchor.getDate() + avgCycleLength);
  }
  const ovulationDate = new Date(projectionAnchor);
  ovulationDate.setDate(ovulationDate.getDate() - 14);
  const fertileWindowStart = new Date(ovulationDate);
  fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);
  const fertileWindowEnd = new Date(ovulationDate);
  fertileWindowEnd.setDate(fertileWindowEnd.getDate() + 1);

  return {
    avgCycleLength,
    avgPeriodLength,
    confidence,
    learned,
    episodes,
    recentCycleLengths,
    nextPeriodDate,
    daysUntilPeriod,
    overdueDays,
    ovulationDate,
    fertileWindowStart,
    fertileWindowEnd,
  };
}

export function calculateCycleDay(lastPeriodStart: string, today?: Date): number {
  const start = parseLocalDate(lastPeriodStart);
  const current = today || new Date();
  // Real day count since the period started — no artificial 28-day wraparound
  return daysBetween(start, current) + 1;
}

export function getCurrentPhase(cycleDay: number, cycleLength: number = 28, periodLength: number = 5): PhaseInfo {
  const ovulationDay = Math.max(1, cycleLength - 14);
  const follicularEnd = ovulationDay - 2;
  const ovulationEnd = ovulationDay + 1;

  let phaseName: PhaseInfo['name'];
  let dayInPhase: number;
  let totalDaysInPhase: number;

  if (cycleDay <= periodLength) {
    phaseName = 'menstrual';
    dayInPhase = cycleDay;
    totalDaysInPhase = periodLength;
  } else if (cycleDay <= follicularEnd) {
    phaseName = 'follicular';
    dayInPhase = cycleDay - periodLength;
    totalDaysInPhase = follicularEnd - periodLength;
  } else if (cycleDay <= ovulationEnd) {
    phaseName = 'ovulation';
    dayInPhase = cycleDay - follicularEnd;
    totalDaysInPhase = ovulationEnd - follicularEnd;
  } else {
    phaseName = 'luteal';
    dayInPhase = cycleDay - ovulationEnd;
    totalDaysInPhase = cycleLength - ovulationEnd;
  }

  const phaseData = PHASE_DATA[phaseName];
  return {
    name: phaseName,
    dayInPhase,
    totalDaysInPhase,
    ...phaseData,
  };
}

export function getPredictedPeriodDate(lastPeriodStart: string, cycleLength: number = 28): Date {
  const start = parseLocalDate(lastPeriodStart);
  const nextPeriod = new Date(start);
  nextPeriod.setDate(nextPeriod.getDate() + cycleLength);

  // If the predicted date is in the past, keep adding cycle lengths
  const today = new Date();
  while (nextPeriod < today) {
    nextPeriod.setDate(nextPeriod.getDate() + cycleLength);
  }

  return nextPeriod;
}

export function getOvulationDate(lastPeriodStart: string, cycleLength: number = 28): Date {
  const nextPeriod = getPredictedPeriodDate(lastPeriodStart, cycleLength);
  const ovulation = new Date(nextPeriod);
  ovulation.setDate(ovulation.getDate() - 14); // Ovulation typically 14 days before next period
  return ovulation;
}

export function getFertileWindow(lastPeriodStart: string, cycleLength: number = 28): { start: Date; end: Date } {
  const ovulation = getOvulationDate(lastPeriodStart, cycleLength);
  const start = new Date(ovulation);
  start.setDate(start.getDate() - 5);
  const end = new Date(ovulation);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export function getDaysUntilPeriod(lastPeriodStart: string, cycleLength: number = 28): number {
  const nextPeriod = getPredictedPeriodDate(lastPeriodStart, cycleLength);
  const today = new Date();
  const diffMs = nextPeriod.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function getDayInfo(
  dateStr: string,
  lastPeriodStart: string,
  cycleLength: number = 28,
  periodLength: number = 5,
  loggedPeriodDates: string[] = []
): DayInfo {
  const date = parseLocalDate(dateStr);
  const start = parseLocalDate(lastPeriodStart);
  const diffDays = daysBetween(start, date);

  let cycleDay = ((diffDays % cycleLength) + cycleLength) % cycleLength;
  if (cycleDay === 0) cycleDay = cycleLength;

  const phase = getCurrentPhase(cycleDay, cycleLength, periodLength);
  const ovulationDay = Math.max(1, cycleLength - 14);

  const isLoggedPeriod = loggedPeriodDates.includes(dateStr);
  const isPeriod = isLoggedPeriod || (cycleDay <= periodLength && diffDays >= 0);
  const isOvulation = cycleDay === ovulationDay;
  const isFertile = cycleDay >= ovulationDay - 5 && cycleDay <= ovulationDay + 1;

  // Check if it's a predicted period (future, not logged)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPredictedPeriod = !isLoggedPeriod && date > today && cycleDay <= periodLength;

  return {
    date: dateStr,
    cycleDay,
    phase: phase.name,
    isPeriod,
    isFertile,
    isOvulation,
    isPredictedPeriod,
  };
}

export function formatDate(date: Date): string {
  // Local calendar date — toISOString would shift the day near midnight in her timezone
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

// Daily tips based on phase
export function getDailyTip(phase: PhaseInfo['name']): { title: string; text: string; icon: string } {
  const tips: Record<string, { title: string; text: string; icon: string }[]> = {
    menstrual: [
      { title: 'Rest & Restore', text: 'Your body is working hard right now. Allow yourself extra rest without guilt.', icon: 'Battery' },
      { title: 'Warm Comfort', text: 'A warm bath or heating pad can ease cramps naturally.', icon: 'Thermometer' },
      { title: 'Iron Boost', text: 'Try adding spinach, lentils, or dark chocolate to replenish iron.', icon: 'Heart' },
      { title: 'Gentle Movement', text: 'Light yoga or stretching can actually help reduce cramp pain.', icon: 'Activity' },
    ],
    follicular: [
      { title: 'Energy Rising', text: 'Your energy is naturally increasing! Great time to start a new project.', icon: 'Zap' },
      { title: 'Social Butterfly', text: 'You may feel more outgoing. Schedule social plans this week!', icon: 'Users' },
      { title: 'Creative Peak', text: 'Estrogen supports creativity. Try brainstorming or creative activities.', icon: 'PenTool' },
      { title: 'Fresh Start', text: 'Your body responds well to new foods and exercise routines now.', icon: 'Leaf' },
    ],
    ovulation: [
      { title: 'Peak Energy', text: 'You\'re at your most energetic! Make the most of this vibrant phase.', icon: 'Sun' },
      { title: 'Natural Glow', text: 'Estrogen peaks give your skin a natural radiance right now.', icon: 'Sparkles' },
      { title: 'Communication Power', text: 'Studies show verbal skills peak during ovulation. Speak up!', icon: 'MessageCircle' },
      { title: 'Fertility Window', text: 'This is your most fertile time. Keep this in mind for planning.', icon: 'Flower2' },
    ],
    luteal: [
      { title: 'Nourish Yourself', text: 'Cravings are normal. Choose dark chocolate and complex carbs.', icon: 'Coffee' },
      { title: 'Prioritize Sleep', text: 'Progesterone makes you sleepier. Honor your body\'s need for rest.', icon: 'Moon' },
      { title: 'Self-Care Time', text: 'Your body is preparing. Gentle skincare and baths feel extra good now.', icon: 'Heart' },
      { title: 'Magnesium Magic', text: 'Magnesium-rich foods like almonds can help reduce PMS symptoms.', icon: 'Target' },
    ],
  };

  const phaseTips = tips[phase] || tips.menstrual;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return phaseTips[dayOfYear % phaseTips.length];
}

// Symptom categories
export const SYMPTOM_CATEGORIES = {
  mood: {
    label: 'Mood',
    icon: 'Smile',
    options: [
      { id: 'happy', label: 'Happy', icon: 'Smile' },
      { id: 'calm', label: 'Calm', icon: 'Sun' },
      { id: 'energetic', label: 'Energetic', icon: 'Zap' },
      { id: 'anxious', label: 'Anxious', icon: 'Wind' },
      { id: 'irritable', label: 'Irritable', icon: 'CloudLightning' },
      { id: 'sad', label: 'Sad', icon: 'CloudRain' },
      { id: 'sensitive', label: 'Sensitive', icon: 'Heart' },
      { id: 'confident', label: 'Confident', icon: 'Award' },
      { id: 'moody', label: 'Mood swings', icon: 'Repeat' },
      { id: 'foggy', label: 'Brain fog', icon: 'Cloud' },
    ],
  },
  pain: {
    label: 'Pain',
    icon: 'Activity',
    options: [
      { id: 'cramps', label: 'Cramps', icon: 'Activity' },
      { id: 'headache', label: 'Headache', icon: 'Brain' },
      { id: 'backPain', label: 'Back pain', icon: 'Activity' },
      { id: 'breastPain', label: 'Breast tenderness', icon: 'Heart' },
      { id: 'jointPain', label: 'Joint pain', icon: 'Activity' },
      { id: 'migraine', label: 'Migraine', icon: 'AlertTriangle' },
      { id: 'noPain', label: 'No pain', icon: 'CheckCircle' },
    ],
  },
  body: {
    label: 'Body',
    icon: 'User',
    options: [
      { id: 'bloating', label: 'Bloating', icon: 'Circle' },
      { id: 'fatigue', label: 'Fatigue', icon: 'BatteryMoon' },
      { id: 'nausea', label: 'Nausea', icon: 'AlertCircle' },
      { id: 'acne', label: 'Acne', icon: 'Target' },
      { id: 'clearSkin', label: 'Clear skin', icon: 'Sparkles' },
      { id: 'hotFlashes', label: 'Hot flashes', icon: 'Flame' },
      { id: 'nightSweats', label: 'Night sweats', icon: 'Droplets' },
      { id: 'cravings', label: 'Cravings', icon: 'Coffee' },
      { id: 'appetite', label: 'Appetite change', icon: 'ArrowUpRight' },
      { id: 'insomnia', label: 'Insomnia', icon: 'EyeOff' },
    ],
  },
  discharge: {
    label: 'Discharge',
    icon: 'Droplets',
    options: [
      { id: 'none', label: 'None', icon: 'XCircle' },
      { id: 'dry', label: 'Dry', icon: 'Sun' },
      { id: 'sticky', label: 'Sticky', icon: 'MoreHorizontal' },
      { id: 'creamy', label: 'Creamy', icon: 'Cloud' },
      { id: 'watery', label: 'Watery', icon: 'Droplet' },
      { id: 'eggWhite', label: 'Egg white', icon: 'Circle' },
    ],
  },
  activity: {
    label: 'Activity',
    icon: 'Dumbbell',
    options: [
      { id: 'exercise', label: 'Exercise', icon: 'Dumbbell' },
      { id: 'yoga', label: 'Yoga', icon: 'Activity' },
      { id: 'walking', label: 'Walking', icon: 'Footprints' },
      { id: 'running', label: 'Running', icon: 'Wind' },
      { id: 'swimming', label: 'Swimming', icon: 'Waves' },
      { id: 'rest', label: 'Rest day', icon: 'BatteryCharging' },
    ],
  },
  sleep: {
    label: 'Sleep Quality',
    icon: 'Moon',
    options: [
      { id: 'excellent', label: 'Excellent', icon: 'Star' },
      { id: 'good', label: 'Good', icon: 'Check' },
      { id: 'fair', label: 'Fair', icon: 'Minus' },
      { id: 'poor', label: 'Poor', icon: 'AlertCircle' },
      { id: 'terrible', label: 'Terrible', icon: 'XOctagon' },
    ],
  },
  sexual: {
    label: 'Sexual Activity',
    icon: 'Heart',
    options: [
      { id: 'protected', label: 'Protected', icon: 'ShieldCheck' },
      { id: 'unprotected', label: 'Unprotected', icon: 'ShieldAlert' },
      { id: 'highLibido', label: 'High libido', icon: 'ArrowUp' },
      { id: 'lowLibido', label: 'Low libido', icon: 'ArrowDown' },
    ],
  },
  digestion: {
    label: 'Digestion',
    icon: 'Coffee',
    options: [
      { id: 'normal', label: 'Normal', icon: 'CheckCircle' },
      { id: 'constipation', label: 'Constipation', icon: 'MinusCircle' },
      { id: 'diarrhea', label: 'Diarrhea', icon: 'Wind' },
      { id: 'gas', label: 'Gas', icon: 'Cloud' },
      { id: 'stomachAche', label: 'Stomach ache', icon: 'AlertCircle' },
    ],
  },
  energy: {
    label: 'Energy Level',
    icon: 'Battery',
    options: [
      { id: 'veryHigh', label: 'Very high', icon: 'Zap' },
      { id: 'high', label: 'High', icon: 'BatteryFull' },
      { id: 'normal', label: 'Normal', icon: 'BatteryMedium' },
      { id: 'low', label: 'Low', icon: 'BatteryLow' },
      { id: 'exhausted', label: 'Exhausted', icon: 'Battery' },
    ],
  },
};

export type SymptomCategory = keyof typeof SYMPTOM_CATEGORIES;

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
      'Eat iron-rich foods: spinach, lentils, dark chocolate',
      'Increase omega-3: salmon, walnuts, flaxseeds',
      'Warm, comforting meals like soups and stews',
      'Avoid excessive caffeine and salt',
    ],
    exerciseTips: [
      'Gentle yoga and stretching',
      'Light walking',
      'Restorative activities',
      'Skip high-intensity workouts if you feel fatigued',
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
      'Light, fresh foods: salads, fermented foods',
      'Lean proteins to support growing energy',
      'Sprouted grains and seeds',
      'Probiotic-rich foods for gut health',
    ],
    exerciseTips: [
      'Cardio and high-energy workouts',
      'Try new exercise classes',
      'Strength training',
      'Running or cycling',
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
      'Antioxidant-rich foods: berries, leafy greens',
      'Fiber-rich vegetables',
      'Whole grains to support sustained energy',
      'Light meals that don\'t weigh you down',
    ],
    exerciseTips: [
      'Peak performance time — go for personal bests',
      'HIIT workouts',
      'Group fitness classes',
      'Competitive sports',
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
      'Complex carbs: sweet potatoes, brown rice',
      'Magnesium-rich: dark chocolate, almonds, bananas',
      'B6-rich foods to support mood: chickpeas, avocado',
      'Reduce caffeine and alcohol to ease PMS',
    ],
    exerciseTips: [
      'Moderate exercise: walking, swimming',
      'Pilates and barre',
      'Gradually reduce intensity as period approaches',
      'Stretching and foam rolling',
    ],
  },
};

export function calculateCycleDay(lastPeriodStart: string, today?: Date): number {
  const start = new Date(lastPeriodStart);
  const current = today || new Date();
  const diffMs = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return (diffDays % 28) + 1; // Default 28-day cycle
}

export function getCurrentPhase(cycleDay: number, cycleLength: number = 28, periodLength: number = 5): PhaseInfo {
  const ovulationDay = Math.round(cycleLength / 2);
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
  const start = new Date(lastPeriodStart);
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
  const date = new Date(dateStr);
  const start = new Date(lastPeriodStart);
  const diffMs = date.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let cycleDay = ((diffDays % cycleLength) + cycleLength) % cycleLength;
  if (cycleDay === 0) cycleDay = cycleLength;

  const phase = getCurrentPhase(cycleDay, cycleLength, periodLength);
  const ovulationDay = Math.round(cycleLength / 2);

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
  return date.toISOString().split('T')[0];
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

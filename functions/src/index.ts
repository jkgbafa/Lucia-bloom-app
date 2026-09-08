import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

admin.initializeApp();

// ---------------------------------------------------------------------------
// Cycle prediction — mirrors src/lib/cycle-utils.ts (keep the two in sync)
// ---------------------------------------------------------------------------

interface Episode {
  start: string;
  end: string;
  periodLength: number;
  cycleLength: number | null;
}

function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

function groupPeriodEpisodes(periodDates: string[]): Episode[] {
  const dates = [...new Set(periodDates)].sort();
  const episodes: Episode[] = [];
  let start: string | null = null;
  let prev: string | null = null;
  for (const date of dates) {
    if (start === null || prev === null || daysBetween(prev, date) > 10) {
      if (start !== null && prev !== null) {
        episodes.push({ start, end: prev, periodLength: daysBetween(start, prev) + 1, cycleLength: null });
      }
      start = date;
    }
    prev = date;
  }
  if (start !== null && prev !== null) {
    episodes.push({ start, end: prev, periodLength: daysBetween(start, prev) + 1, cycleLength: null });
  }
  for (let i = 0; i < episodes.length - 1; i++) {
    episodes[i].cycleLength = daysBetween(episodes[i].start, episodes[i + 1].start);
  }
  return episodes;
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

interface Profile {
  name?: string;
  email?: string;
  cycleLength?: number;
  periodLength?: number;
  lastPeriodStart?: string;
  periodDates?: string[];
  timezone?: string;
  fcmToken?: string;
  notificationsEnabled?: boolean;
  notifyPrePeriod?: boolean;
  notifyPhaseChange?: boolean;
  notifyLogReminder?: boolean;
}

function computeStats(profile: Profile, todayLocal: string) {
  const episodes = groupPeriodEpisodes(profile.periodDates || []);
  const plausible = episodes
    .map((e) => e.cycleLength)
    .filter((len): len is number => len !== null && len >= 15 && len <= 60)
    .slice(-6);
  const avgCycleLength = plausible.length >= 2 ? median(plausible) : (profile.cycleLength || 28);
  const periodLengths = episodes.map((e) => e.periodLength).filter((len) => len >= 1 && len <= 10);
  const avgPeriodLength = periodLengths.length >= 2
    ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
    : (profile.periodLength || 5);

  const lastStart = episodes.length > 0 ? episodes[episodes.length - 1].start : profile.lastPeriodStart;
  if (!lastStart) return null;

  const nextPeriodDate = addDays(lastStart, avgCycleLength);
  const daysUntil = daysBetween(todayLocal, nextPeriodDate);
  const cycleDay = daysBetween(lastStart, todayLocal) + 1;
  return { avgCycleLength, avgPeriodLength, nextPeriodDate, daysUntil, overdueDays: Math.max(0, -daysUntil), cycleDay };
}

// Current date + hour in the user's own timezone
function localNow(timezone: string): { date: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")) % 24,
  };
}

// ---------------------------------------------------------------------------
// Hourly scheduler: each user gets messages at *her* local 9am / 8pm
// ---------------------------------------------------------------------------

const MORNING_HOUR = 9;
const EVENING_HOUR = 20;
const OVERDUE_NUDGE_DAYS = [1, 3, 5, 7]; // strong reminders without daily nagging

export const bloomNotifications = onSchedule("0 * * * *", async () => {
  const usersSnapshot = await admin.firestore().collection("users").get();
  let sent = 0;

  for (const docSnap of usersSnapshot.docs) {
    const data = docSnap.data();
    const profile: Profile = data.profile || {};
    const logs: Record<string, unknown> = data.logs || {};

    if (!profile.notificationsEnabled || !profile.fcmToken) continue;

    const timezone = profile.timezone || "UTC";
    let now;
    try {
      now = localNow(timezone);
    } catch {
      now = localNow("UTC");
    }

    const firstName = (profile.name || "there").split(" ")[0];
    const stats = computeStats(profile, now.date);
    const messages: { title: string; body: string }[] = [];

    if (now.hour === MORNING_HOUR && stats) {
      if (profile.notifyPrePeriod) {
        if (OVERDUE_NUDGE_DAYS.includes(stats.overdueDays)) {
          messages.push({
            title: `🌸 ${firstName}, your period was expected ${stats.overdueDays === 1 ? "yesterday" : `${stats.overdueDays} days ago`}`,
            body: "Did it start? Open Bloom and log it so your predictions stay accurate 💕",
          });
        } else if (stats.daysUntil === 2) {
          messages.push({
            title: "🌸 Period coming soon",
            body: `Your period is expected in about 2 days, ${firstName}. Stock up on your essentials! 💕`,
          });
        } else if (stats.daysUntil === 0) {
          messages.push({
            title: "🌸 Your period is expected today",
            body: "Be gentle with yourself today. Log it in Bloom when it starts 💕",
          });
        }
      }

      if (profile.notifyPhaseChange && stats.overdueDays === 0) {
        const ovulationDay = Math.max(1, stats.avgCycleLength - 14);
        if (stats.cycleDay === stats.avgPeriodLength + 1) {
          messages.push({ title: "🌱 Follicular phase begins!", body: "Your energy is rising — a great time to try something new." });
        } else if (stats.cycleDay === ovulationDay) {
          messages.push({ title: "✨ Ovulation phase — peak energy!", body: "You're at your most vibrant. Embrace it!" });
        } else if (stats.cycleDay === ovulationDay + 2) {
          messages.push({ title: "🍂 Luteal phase begins", body: "Time to slow down and nourish yourself. Check your food tips in Bloom." });
        }
      }
    }

    if (now.hour === EVENING_HOUR && profile.notifyLogReminder && !logs[now.date]) {
      messages.push({
        title: `📋 How are you feeling today, ${firstName}?`,
        body: "You haven't logged today yet — take a minute to note your mood and symptoms in Bloom.",
      });
    }

    for (const message of messages) {
      try {
        await admin.messaging().send({
          token: profile.fcmToken,
          notification: message,
          webpush: {
            fcmOptions: { link: "/" },
            notification: { icon: "/icons/icon-192.png", badge: "/icons/icon-192.png", vibrate: [200, 100, 200] },
          },
        });
        sent++;
      } catch (error) {
        const code = (error as { code?: string })?.code;
        if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token") {
          // Stale token (she reinstalled or cleared data) — drop it so the app fetches a fresh one
          await docSnap.ref.update({ "profile.fcmToken": admin.firestore.FieldValue.delete() });
        } else {
          console.error(`Failed to notify ${profile.email}:`, error);
        }
      }
    }
  }

  console.log(`Sent ${sent} notifications.`);
});

import { SessionDoc, SessionExercise } from "./repos/sessions";
import { formatLocalDate } from "./utils";

export type TransformedSession = {
  _id: string;
  date: string;
  workoutType: string;
  bodyWeight: number | null;
  workout: SessionExercise[];
};

/**
 * Transforms a MongoDB session document to API response format
 */
export function transformSession(doc: SessionDoc): TransformedSession {
  return {
    _id: String(doc._id),
    date: formatLocalDate(doc.date),
    workoutType: doc.workoutType,
    bodyWeight:
      typeof doc.bodyWeight === "number"
        ? doc.bodyWeight
        : doc.bodyWeight ?? null,
    workout: doc.workout,
  };
}

/**
 * Formats a date to YYYY-MM-DD string
 */
export function formatDateToString(date: Date): string {
  return formatLocalDate(date);
}

/**
 * Calculates current workout streak from sorted dates
 */
export function calculateCurrentStreak(uniqueDates: string[]): number {
  let currentStreak = 0;
  const today = formatLocalDate(new Date());

  // Check if worked out today or yesterday (to handle time zones)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterday);

  const hasWorkedOutToday = uniqueDates.includes(today);
  const hasWorkedOutYesterday = uniqueDates.includes(yesterdayStr);

  if (hasWorkedOutToday || hasWorkedOutYesterday) {
    currentStreak = 1;
    let consecutiveDate = hasWorkedOutToday ? today : yesterdayStr;

    while (true) {
      const prevDay = new Date(consecutiveDate);
      prevDay.setDate(prevDay.getDate() - 1);
      const prevDayStr = formatLocalDate(prevDay);

      if (uniqueDates.includes(prevDayStr)) {
        currentStreak++;
        consecutiveDate = prevDayStr;
      } else {
        break;
      }
    }
  }

  return currentStreak;
}

/**
 * Gets date range for current week (Sunday to Saturday)
 */
export function getCurrentWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
  endOfWeek.setHours(23, 59, 59, 999);

  return { start: startOfWeek, end: endOfWeek };
}

/**
 * Gets date range for current month
 */
export function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  return { start: startOfMonth, end: endOfMonth };
}

/**
 * Gets date range for previous month
 */
export function getPreviousMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
    999
  );

  return { start: startOfLastMonth, end: endOfLastMonth };
}

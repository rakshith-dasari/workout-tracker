import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import {
  calculateCurrentStreak,
  getCurrentWeekRange,
  getCurrentMonthRange,
  getPreviousMonthRange,
} from "@/lib/api-utils";
import { cache, CACHE_KEYS } from "@/lib/cache";

export async function GET() {
  try {
    // Check cache first (5 minute TTL for stats)
    const cachedStats = cache.get(CACHE_KEYS.STATS);
    if (cachedStats) {
      return NextResponse.json(cachedStats, { status: 200 });
    }

    const db = await getDb();
    const sessions = db.collection("sessions");
    const exercises = db.collection("excercises");

    // Get current date ranges for streak and count calculations
    const weekRange = getCurrentWeekRange();
    const monthRange = getCurrentMonthRange();
    const prevMonthRange = getPreviousMonthRange();

    // Single aggregation pipeline using $facet for all stats
    const [statsResult] = await sessions
      .aggregate([
        {
          $facet: {
            // Summary stats
            summary: [
              { $sort: { date: -1 } },
              {
                $group: {
                  _id: null,
                  totalSessions: { $sum: 1 },
                  latestBodyWeight: { $first: "$bodyWeight" },
                },
              },
              {
                $project: {
                  _id: 0,
                  totalSessions: 1,
                  latestBodyWeight: 1,
                },
              },
            ],

            // Body weight series
            bodyWeightSeries: [
              {
                $project: {
                  _id: 0,
                  date: {
                    $dateToString: { format: "%Y-%m-%d", date: "$date" },
                  },
                  value: "$bodyWeight",
                },
              },
              { $sort: { date: 1 } },
            ],

            // Volume by date
            volumeByDate: [
              { $unwind: "$workout" },
              { $unwind: "$workout.sets" },
              {
                $project: {
                  date: {
                    $dateToString: { format: "%Y-%m-%d", date: "$date" },
                  },
                  volume: {
                    $multiply: ["$workout.sets.weight", "$workout.sets.reps"],
                  },
                },
              },
              { $group: { _id: "$date", value: { $sum: "$volume" } } },
              { $project: { _id: 0, date: "$_id", value: 1 } },
              { $sort: { date: 1 } },
            ],

            // Unique workout dates for streak calculation
            workoutDates: [
              {
                $project: {
                  _id: 0,
                  date: {
                    $dateToString: { format: "%Y-%m-%d", date: "$date" },
                  },
                },
              },
              { $sort: { date: -1 } },
            ],

            // This week's sessions count
            thisWeekSessions: [
              {
                $match: {
                  date: {
                    $gte: weekRange.start,
                    $lte: weekRange.end,
                  },
                },
              },
              { $count: "count" },
            ],

            // This month's sessions count
            thisMonthSessions: [
              {
                $match: {
                  date: {
                    $gte: monthRange.start,
                    $lte: monthRange.end,
                  },
                },
              },
              { $count: "count" },
            ],

            // Last month's sessions count
            lastMonthSessions: [
              {
                $match: {
                  date: {
                    $gte: prevMonthRange.start,
                    $lte: prevMonthRange.end,
                  },
                },
              },
              { $count: "count" },
            ],
          },
        },
      ])
      .toArray();

    // Get top exercises separately (from exercises collection)
    const topExercises = await exercises
      .aggregate([
        {
          $project: {
            _id: 0,
            name: 1,
            maxWeight: 1,
            maxReps: 1,
          },
        },
        { $sort: { maxWeight: -1 } },
        { $limit: 10 },
      ])
      .toArray();

    // Extract data from facet results
    const summaryAgg = statsResult.summary[0] || {};
    const bodyWeightSeries = statsResult.bodyWeightSeries;
    const volumeByDate = statsResult.volumeByDate;

    // Process workout dates for streak calculation
    const workoutDates = statsResult.workoutDates.map(
      (doc: { date: string }) => doc.date
    );
    const uniqueDatesSet = new Set(workoutDates);
    const uniqueDates = Array.from(uniqueDatesSet).sort((a, b) =>
      (b as string).localeCompare(a as string)
    ) as string[];
    const currentStreak = calculateCurrentStreak(uniqueDates);

    // Extract session counts
    const thisWeekSessions = statsResult.thisWeekSessions[0]?.count || 0;
    const thisMonthSessions = statsResult.thisMonthSessions[0]?.count || 0;
    const lastMonthSessions = statsResult.lastMonthSessions[0]?.count || 0;

    // Calculate average body weight for the last 30 entries
    const last30 = bodyWeightSeries.slice(-30);
    const avgBodyWeight30d =
      last30.length > 0
        ? last30.reduce(
            (sum: number, p: { value: number | null }) =>
              sum + (typeof p.value === "number" ? p.value : 0),
            0
          ) / last30.length
        : null;

    const payload = {
      summary: {
        totalSessions: summaryAgg.totalSessions ?? 0,
        latestBodyWeight: summaryAgg.latestBodyWeight ?? null,
        avgBodyWeight30d,
      },
      bodyWeightSeries,
      volumeByDate,
      topExercises,
      // Quick stats now included
      currentStreak,
      thisWeekSessions,
      thisMonthSessions,
      lastMonthSessions,
      workoutDates: uniqueDates, // Also include dates for frontend use
    };

    // Cache the result for 5 minutes
    cache.set(CACHE_KEYS.STATS, payload, 300);

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("/api/stats error", error);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }
}

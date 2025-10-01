import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";

type DatePoint = { date: string; value: number };

export async function GET() {
  try {
    const db = await getDb();

    const sessions = db.collection("sessions");
    const excercises = db.collection("excercises");

    const [summaryAgg, bodyWeightSeries, volumeByDate, topExercises] =
      await Promise.all([
        sessions
          .aggregate([
            {
              $sort: { date: -1 },
            },
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
          ])
          .toArray(),

        sessions
          .aggregate<DatePoint>([
            {
              $project: {
                _id: 0,
                date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                value: "$bodyWeight",
              },
            },
            { $sort: { date: 1 } },
          ])
          .toArray(),

        sessions
          .aggregate<DatePoint>([
            { $unwind: "$workout" },
            { $unwind: "$workout.sets" },
            {
              $project: {
                date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                volume: {
                  $multiply: ["$workout.sets.weight", "$workout.sets.reps"],
                },
              },
            },
            { $group: { _id: "$date", value: { $sum: "$volume" } } },
            { $project: { _id: 0, date: "$_id", value: 1 } },
            { $sort: { date: 1 } },
          ])
          .toArray(),

        excercises
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
          .toArray(),
      ]);

    // Calculate average body weight for the last 30 entries
    const last30 = bodyWeightSeries.slice(-30);
    const avgBodyWeight30d =
      last30.length > 0
        ? last30.reduce(
            (sum, p) => sum + (typeof p.value === "number" ? p.value : 0),
            0
          ) / last30.length
        : null;

    const payload = {
      summary: {
        totalSessions: summaryAgg[0]?.totalSessions ?? 0,
        latestBodyWeight: summaryAgg[0]?.latestBodyWeight ?? null,
        avgBodyWeight30d,
      },
      bodyWeightSeries,
      volumeByDate,
      topExercises,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error("/api/stats error", error);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }
}

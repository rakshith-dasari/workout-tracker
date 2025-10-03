import { Db } from "mongodb";

export type ExerciseTrendPoint = {
  date: string;
  maxWeight: number;
  maxReps: number;
};

export async function getExerciseTrend(
  db: Db,
  name: string
): Promise<ExerciseTrendPoint[]> {
  // Trend across sessions: max weight and reps per date for a given exercise name
  const cursor = db.collection("sessions").aggregate<ExerciseTrendPoint>([
    { $unwind: "$workout" },
    { $match: { "workout.name": name } },
    { $unwind: "$workout.sets" },
    {
      $group: {
        _id: { date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } },
        maxWeight: { $max: "$workout.sets.weight" },
        maxReps: { $max: "$workout.sets.reps" },
      },
    },
    { $project: { _id: 0, date: "$_id.date", maxWeight: 1, maxReps: 1 } },
    { $sort: { date: 1 } },
  ]);

  return cursor.toArray();
}

export type ExerciseStats = {
  maxWeight: number | null;
  maxReps: number | null;
  lastWeight: number | null;
  lastReps: number | null;
};

export async function getExerciseStats(
  db: Db,
  name: string
): Promise<ExerciseStats> {
  // Get overall max weight and reps for the exercise
  const overallStatsResult = await db
    .collection("sessions")
    .aggregate([
      { $unwind: "$workout" },
      { $match: { "workout.name": name } },
      { $unwind: "$workout.sets" },
      {
        $group: {
          _id: null,
          maxWeight: { $max: "$workout.sets.weight" },
          allSets: {
            $push: {
              weight: "$workout.sets.weight",
              reps: "$workout.sets.reps",
            },
          },
        },
      },
      {
        $project: {
          maxWeight: 1,
          maxReps: {
            $max: {
              $map: {
                input: {
                  $filter: {
                    input: "$allSets",
                    cond: { $eq: ["$$this.weight", "$maxWeight"] },
                  },
                },
                as: "set",
                in: "$$set.reps",
              },
            },
          },
        },
      },
    ])
    .toArray();

  const maxWeight =
    overallStatsResult.length > 0 ? overallStatsResult[0].maxWeight : null;
  const maxReps =
    overallStatsResult.length > 0 ? overallStatsResult[0].maxReps : null;

  // Get last session date for this exercise
  const lastSessionResult = await db
    .collection("sessions")
    .aggregate([
      { $unwind: "$workout" },
      { $match: { "workout.name": name } },
      {
        $group: {
          _id: null,
          lastDate: { $max: "$date" },
        },
      },
    ])
    .toArray();

  let lastWeight: number | null = null;
  let lastReps: number | null = null;
  if (lastSessionResult.length > 0 && lastSessionResult[0].lastDate) {
    // Get the max weight and reps from the last session date
    const lastSessionStatsResult = await db
      .collection("sessions")
      .aggregate([
        { $match: { date: lastSessionResult[0].lastDate } },
        { $unwind: "$workout" },
        { $match: { "workout.name": name } },
        { $unwind: "$workout.sets" },
        {
          $group: {
            _id: null,
            maxWeight: { $max: "$workout.sets.weight" },
            allSets: {
              $push: {
                weight: "$workout.sets.weight",
                reps: "$workout.sets.reps",
              },
            },
          },
        },
        {
          $project: {
            maxWeight: 1,
            maxReps: {
              $max: {
                $map: {
                  input: {
                    $filter: {
                      input: "$allSets",
                      cond: { $eq: ["$$this.weight", "$maxWeight"] },
                    },
                  },
                  as: "set",
                  in: "$$set.reps",
                },
              },
            },
          },
        },
      ])
      .toArray();

    lastWeight =
      lastSessionStatsResult.length > 0
        ? lastSessionStatsResult[0].maxWeight
        : null;
    lastReps =
      lastSessionStatsResult.length > 0
        ? lastSessionStatsResult[0].maxReps
        : null;
  }

  return {
    maxWeight,
    maxReps,
    lastWeight,
    lastReps,
  };
}

export async function getAllExerciseNames(db: Db): Promise<string[]> {
  // Directly read distinct names from the dedicated collection
  const names = (await db
    .collection("excercises")
    .distinct("name")) as string[];
  return (names ?? []).filter(Boolean).sort((a, b) => a.localeCompare(b));
}

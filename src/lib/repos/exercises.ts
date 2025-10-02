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

export async function getAllExerciseNames(db: Db): Promise<string[]> {
  // Directly read distinct names from the dedicated collection
  const names = (await db
    .collection("excercises")
    .distinct("name")) as string[];
  return (names ?? []).filter(Boolean).sort((a, b) => a.localeCompare(b));
}

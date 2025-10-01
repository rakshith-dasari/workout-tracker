import { Db, ObjectId } from "mongodb";

export type SessionSet = { weight: number; reps: number };
export type SessionExercise = { name: string; sets: SessionSet[] };
export type SessionDoc = {
  _id: ObjectId;
  date: Date;
  bodyWeight?: number | null;
  workoutType: string;
  workout: SessionExercise[];
};

export async function getLastSessionByType(
  db: Db,
  type: string
): Promise<SessionDoc | null> {
  const doc = await db
    .collection<SessionDoc>("sessions")
    .find({ workoutType: type })
    .sort({ date: -1 })
    .limit(1)
    .next();

  return doc ?? null;
}

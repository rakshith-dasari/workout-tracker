import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getAllExerciseNames, getExerciseStats } from "@/lib/repos/exercises";
import { cache, CACHE_KEYS } from "@/lib/cache";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    if (name) {
      // Get stats for a specific exercise
      const cacheKey = CACHE_KEYS.EXERCISE_STATS(name);
      const cachedStats = cache.get(cacheKey);
      if (cachedStats) {
        return NextResponse.json({ stats: cachedStats }, { status: 200 });
      }

      const db = await getDb();
      const stats = await getExerciseStats(db, name);

      // Cache the result for 5 minutes
      cache.set(cacheKey, stats, 300);

      return NextResponse.json({ stats }, { status: 200 });
    } else {
      // Get all exercise names
      const cachedNames = cache.get(CACHE_KEYS.EXERCISE_NAMES);
      if (cachedNames) {
        return NextResponse.json({ names: cachedNames }, { status: 200 });
      }

      const db = await getDb();
      const names = await getAllExerciseNames(db);

      // Cache the result for 10 minutes
      cache.set(CACHE_KEYS.EXERCISE_NAMES, names, 600);

      return NextResponse.json({ names }, { status: 200 });
    }
  } catch (error) {
    console.error("/api/exercises error", error);
    return NextResponse.json(
      { error: "Failed to load exercises" },
      { status: 500 }
    );
  }
}

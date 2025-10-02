import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getAllExerciseNames } from "@/lib/repos/exercises";
import { cache, CACHE_KEYS } from "@/lib/cache";

export async function GET() {
  try {
    // Check cache first (10 minute TTL for exercise names as they change infrequently)
    const cachedNames = cache.get(CACHE_KEYS.EXERCISE_NAMES);
    if (cachedNames) {
      return NextResponse.json({ names: cachedNames }, { status: 200 });
    }

    const db = await getDb();
    const names = await getAllExerciseNames(db);

    // Cache the result for 10 minutes
    cache.set(CACHE_KEYS.EXERCISE_NAMES, names, 600);

    return NextResponse.json({ names }, { status: 200 });
  } catch (error) {
    console.error("/api/exercises error", error);
    return NextResponse.json(
      { error: "Failed to load exercises" },
      { status: 500 }
    );
  }
}

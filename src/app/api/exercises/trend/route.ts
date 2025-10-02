import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getExerciseTrend } from "@/lib/repos/exercises";
import { cache, CACHE_KEYS } from "@/lib/cache";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    if (!name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    // Check cache first (5 minute TTL for exercise trends)
    const cacheKey = CACHE_KEYS.EXERCISE_TREND(name);
    const cachedSeries = cache.get(cacheKey);
    if (cachedSeries) {
      return NextResponse.json({ series: cachedSeries }, { status: 200 });
    }

    const db = await getDb();
    const series = await getExerciseTrend(db, name);

    // Cache the result for 5 minutes
    cache.set(cacheKey, series, 300);

    return NextResponse.json({ series }, { status: 200 });
  } catch (error) {
    console.error("/api/exercises/trend error", error);
    return NextResponse.json(
      { error: "Failed to load trend" },
      { status: 500 }
    );
  }
}

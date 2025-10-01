import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getExerciseTrend } from "@/lib/repos/exercises";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    if (!name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }
    const db = await getDb();
    const series = await getExerciseTrend(db, name);
    return NextResponse.json({ series }, { status: 200 });
  } catch (error) {
    console.error("/api/exercises/trend error", error);
    return NextResponse.json(
      { error: "Failed to load trend" },
      { status: 500 }
    );
  }
}

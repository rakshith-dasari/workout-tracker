import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getAllExerciseNames } from "@/lib/repos/exercises";

export async function GET() {
  try {
    const db = await getDb();
    const names = await getAllExerciseNames(db);
    return NextResponse.json({ names }, { status: 200 });
  } catch (error) {
    console.error("/api/exercises error", error);
    return NextResponse.json(
      { error: "Failed to load exercises" },
      { status: 500 }
    );
  }
}

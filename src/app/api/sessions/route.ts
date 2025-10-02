import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { SessionDoc } from "@/lib/repos/sessions";
import { transformSession } from "@/lib/api-utils";
import { cache } from "@/lib/cache";

export async function GET() {
  try {
    const db = await getDb();
    const docs = (await db
      .collection<SessionDoc>("sessions")
      .find({})
      .project({ date: 1, workoutType: 1, bodyWeight: 1, workout: 1 })
      .sort({ date: -1 })
      .toArray()) as SessionDoc[];

    const sessions = docs.map(transformSession);

    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error) {
    console.error("/api/sessions GET error", error);
    return NextResponse.json(
      { error: "Failed to load sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, bodyWeight, workoutType, workout } = body ?? {};

    if (!date || !workoutType || !Array.isArray(workout)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const session: Omit<SessionDoc, "_id"> = {
      date: new Date(date),
      bodyWeight: typeof bodyWeight === "number" ? bodyWeight : null,
      workoutType,
      workout,
    };

    const db = await getDb();
    await db
      .collection<SessionDoc>("sessions")
      .insertOne(session as SessionDoc);

    // Invalidate cache since stats have changed
    cache.invalidate("stats");
    cache.invalidate("exercise_trend");

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("/api/sessions POST error", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

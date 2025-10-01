import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { SessionDoc } from "@/lib/repos/sessions";

export async function GET() {
  try {
    const db = await getDb();
    const docs = await db
      .collection<SessionDoc>("sessions")
      .find({})
      .project({ date: 1, workoutType: 1, bodyWeight: 1, workout: 1 })
      .sort({ date: -1 })
      .toArray();

    const sessions = docs.map((d) => ({
      _id: String((d as any)._id),
      date:
        d.date instanceof Date
          ? d.date.toISOString()
          : new Date((d as any).date).toISOString(),
      workoutType: d.workoutType,
      bodyWeight:
        typeof d.bodyWeight === "number" ? d.bodyWeight : d.bodyWeight ?? null,
      workout: Array.isArray(d.workout) ? d.workout : [],
    }));

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
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("/api/sessions POST error", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

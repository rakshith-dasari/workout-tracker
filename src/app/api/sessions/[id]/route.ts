import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { SessionDoc } from "@/lib/repos/sessions";
import { ObjectId } from "mongodb";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const db = await getDb();
    const doc = await db
      .collection<SessionDoc>("sessions")
      .findOne({ _id: new ObjectId(id) });

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const session = {
      _id: String((doc as any)._id),
      date:
        doc.date instanceof Date
          ? doc.date.toISOString()
          : new Date((doc as any).date).toISOString(),
      workoutType: doc.workoutType,
      bodyWeight:
        typeof doc.bodyWeight === "number"
          ? doc.bodyWeight
          : doc.bodyWeight ?? null,
      workout: Array.isArray(doc.workout) ? doc.workout : [],
    };

    return NextResponse.json({ session }, { status: 200 });
  } catch (error) {
    console.error("/api/sessions/[id] GET error", error);
    return NextResponse.json(
      { error: "Failed to load session" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const body = await req.json();
    const { date, bodyWeight, workoutType, workout } = body ?? {};

    if (!date || !workoutType || !Array.isArray(workout)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const updateDoc: Partial<Omit<SessionDoc, "_id">> = {
      date: new Date(date),
      bodyWeight:
        typeof bodyWeight === "number" && !Number.isNaN(bodyWeight)
          ? bodyWeight
          : null,
      workoutType,
      workout,
    };

    const db = await getDb();
    const result = await db
      .collection<SessionDoc>("sessions")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateDoc });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("/api/sessions/[id] PUT error", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

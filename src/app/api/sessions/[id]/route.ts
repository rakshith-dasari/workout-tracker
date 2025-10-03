import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getDb } from "@/lib/mongo";
import { SessionDoc } from "@/lib/repos/sessions";
import { ObjectId } from "mongodb";
import { transformSession } from "@/lib/api-utils";
import { cache } from "@/lib/cache";
import { authOptions } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  context: RouteContext<"/api/sessions/[id]">
) {
  try {
    const { id } = await context.params;
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

    const session = transformSession(doc);

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
  context: RouteContext<"/api/sessions/[id]">
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
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

    // Invalidate cache since stats have changed
    cache.invalidate("stats");
    cache.invalidate("exercise_trend");

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("/api/sessions/[id] PUT error", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: RouteContext<"/api/sessions/[id]">
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const db = await getDb();
    const result = await db
      .collection<SessionDoc>("sessions")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Invalidate cache since stats have changed
    cache.invalidate("stats");
    cache.invalidate("exercise_trend");

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("/api/sessions/[id] DELETE error", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { getLastSessionByType } from "@/lib/repos/sessions";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    if (!type) {
      return NextResponse.json({ error: "Missing type" }, { status: 400 });
    }
    const db = await getDb();
    const session = await getLastSessionByType(db, type);
    return NextResponse.json({ session }, { status: 200 });
  } catch (error) {
    console.error("/api/sessions/last error", error);
    return NextResponse.json(
      { error: "Failed to load last session" },
      { status: 500 }
    );
  }
}

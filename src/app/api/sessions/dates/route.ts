import { NextResponse } from "next/server";

// This endpoint is now deprecated. Dates are available from /api/stats
export async function GET() {
  try {
    // Fetch from the main stats API to maintain compatibility
    const statsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/stats`,
      {
        cache: "no-cache",
      }
    );

    if (!statsResponse.ok) {
      throw new Error("Failed to fetch stats");
    }

    const statsData = await statsResponse.json();
    return NextResponse.json({ dates: statsData.workoutDates });
  } catch (error) {
    console.error("/api/sessions/dates GET error", error);
    return NextResponse.json(
      { error: "Failed to load session dates" },
      { status: 500 }
    );
  }
}

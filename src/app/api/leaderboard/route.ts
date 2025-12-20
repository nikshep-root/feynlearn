import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/db";

// GET - Get leaderboard
export async function GET() {
  try {
    const leaderboard = await getLeaderboard(50);
    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

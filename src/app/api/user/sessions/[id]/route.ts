import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getSession,
  updateSession,
  completeSession,
  addMessageToSession,
  updateStreak,
} from "@/lib/db";

// GET - Get a specific session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const sessionData = await getSession(session.user.id, id);

    if (!sessionData) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

// PATCH - Update a session
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Handle completing a session
    if (body.complete) {
      await completeSession(
        session.user.id,
        id,
        body.score || 0,
        body.xpEarned || 0
      );
      // Update daily streak when completing a session
      await updateStreak(session.user.id);
      return NextResponse.json({ success: true });
    }

    // Handle adding a message
    if (body.message) {
      await addMessageToSession(session.user.id, id, body.message);
      return NextResponse.json({ success: true });
    }

    // General update
    await updateSession(session.user.id, id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

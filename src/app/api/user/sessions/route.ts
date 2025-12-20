import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getUserSessions,
  getRecentSessions,
  createSession,
} from "@/lib/db";

// GET - Get user sessions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const recent = searchParams.get("recent");

    const limit = limitParam ? parseInt(limitParam) : 50;

    const sessions =
      recent === "true"
        ? await getRecentSessions(session.user.id, limit)
        : await getUserSessions(session.user.id, limit);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// POST - Create a new session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, subject, content } = await request.json();

    if (!topic || !subject) {
      return NextResponse.json(
        { error: "Topic and subject are required" },
        { status: 400 }
      );
    }

    const sessionId = await createSession(
      session.user.id,
      topic,
      subject,
      content || ""
    );

    return NextResponse.json({ sessionId }, { status: 201 });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

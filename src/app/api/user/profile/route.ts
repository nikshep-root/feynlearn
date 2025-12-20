import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  updateUserPreferences,
  updateNotificationSettings,
} from "@/lib/db";

// GET - Get user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let profile = await getUserProfile(session.user.id);

    // If no profile exists, create one
    if (!profile) {
      profile = await createUserProfile(
        session.user.id,
        session.user.email || "",
        session.user.name || "User",
        session.user.image || undefined
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PATCH - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { preferences, notifications, ...profileUpdates } = body;

    // Update profile fields
    if (Object.keys(profileUpdates).length > 0) {
      await updateUserProfile(session.user.id, profileUpdates);
    }

    // Update preferences if provided
    if (preferences) {
      await updateUserPreferences(session.user.id, preferences);
    }

    // Update notifications if provided
    if (notifications) {
      await updateNotificationSettings(session.user.id, notifications);
    }

    const updatedProfile = await getUserProfile(session.user.id);
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  updateUserPreferences,
  updateNotificationSettings,
  recalculateUserStats,
  updateStreak,
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
      try {
        profile = await createUserProfile(
          session.user.id,
          session.user.email || "",
          session.user.name || "User",
          session.user.image || undefined
        );
      } catch (createError) {
        console.error("Error creating profile:", createError);
        // Return a minimal profile if creation fails
        return NextResponse.json({
          uid: session.user.id,
          email: session.user.email || "",
          name: session.user.name || "User",
          avatar: session.user.image || undefined,
          xp: 0,
          level: 1,
          streak: 0,
          totalSessions: 0,
          totalPoints: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          preferences: {
            defaultPersona: "curious",
            questionsPerSession: 7,
            autoPlayNext: true,
            showHints: true,
            darkMode: true,
            language: "en",
          },
          notifications: {
            email: true,
            push: true,
            reviewReminders: true,
            streakReminders: true,
            weeklyDigest: false,
          },
        });
      }
    } else {
      // Check and update streak on profile fetch (daily login check)
      try {
        const newStreak = await updateStreak(session.user.id);
        profile = { ...profile, streak: newStreak };
      } catch (streakError) {
        console.error("Error updating streak:", streakError);
        // Continue with existing profile data
      }
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
    const { preferences, notifications, recalculate, ...profileUpdates } = body;

    // Recalculate stats from sessions if requested
    if (recalculate) {
      await recalculateUserStats(session.user.id);
      const updatedProfile = await getUserProfile(session.user.id);
      return NextResponse.json(updatedProfile);
    }

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

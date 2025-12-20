import { NextRequest, NextResponse } from "next/server";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // Update display name if provided
    if (name) {
      await updateProfile(user, { displayName: name });
    }

    // Create user document in Firestore
    await adminDb.collection("users").doc(user.uid).set({
      email: user.email,
      name: name || null,
      image: null,
      provider: "credentials",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Add any additional default user fields
      totalPoints: 0,
      sessionsCompleted: 0,
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.uid,
          email: user.email,
          name: name || null,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);

    const firebaseError = error as { code?: string };

    if (firebaseError.code === "auth/email-already-in-use") {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 409 }
      );
    }

    if (firebaseError.code === "auth/invalid-email") {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (firebaseError.code === "auth/weak-password") {
      return NextResponse.json(
        { error: "Password is too weak" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

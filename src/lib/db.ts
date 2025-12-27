import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

// ==================== USER PROFILE ====================

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  totalSessions: number;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
  preferences: UserPreferences;
  notifications: NotificationSettings;
}

export interface UserPreferences {
  defaultPersona: "curious" | "challenging" | "supportive";
  questionsPerSession: number;
  autoPlayNext: boolean;
  showHints: boolean;
  darkMode: boolean;
  language: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  reviewReminders: boolean;
  streakReminders: boolean;
  weeklyDigest: boolean;
}

// Get user profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;
  return userSnap.data() as UserProfile;
}

// Create new user profile
export async function createUserProfile(
  uid: string,
  email: string,
  name: string,
  image?: string
): Promise<UserProfile> {
  const now = new Date().toISOString();

  const newProfile: UserProfile = {
    uid,
    email,
    name,
    avatar: image || undefined,
    bio: "",
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: now,
    totalSessions: 0,
    totalPoints: 0,
    createdAt: now,
    updatedAt: now,
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
  };

  const userRef = doc(db, "users", uid);
  await setDoc(userRef, newProfile);

  // Welcome notification for new users (don't await to avoid blocking)
  createNotification(
    uid,
    "system",
    "👋 Welcome to FeynLearn!",
    "Start your learning journey by creating your first study session. We're excited to have you!",
    "/upload"
  ).catch((err) => console.error("Failed to create welcome notification:", err));

  return newProfile;
}

// Update user profile
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

// Update user preferences
export async function updateUserPreferences(
  uid: string,
  preferences: Partial<UserPreferences>
): Promise<void> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const currentPrefs = userSnap.data().preferences || {};
    await updateDoc(userRef, {
      preferences: { ...currentPrefs, ...preferences },
      updatedAt: new Date().toISOString(),
    });
  }
}

// Update notification settings
export async function updateNotificationSettings(
  uid: string,
  notifications: Partial<NotificationSettings>
): Promise<void> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const currentNotifs = userSnap.data().notifications || {};
    await updateDoc(userRef, {
      notifications: { ...currentNotifs, ...notifications },
      updatedAt: new Date().toISOString(),
    });
  }
}

// ==================== SESSIONS ====================

export interface Session {
  id?: string;
  uid: string;
  topic: string;
  subject: string;
  content: string;
  score: number;
  duration: number; // in minutes
  questionsAsked: number;
  questionsAnswered: number;
  xpEarned: number;
  createdAt: string;
  completedAt?: string;
  status: "in-progress" | "completed" | "abandoned";
  messages: ChatMessage[];
}

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
  timestamp: string;
}

// Create a new session
export async function createSession(
  uid: string,
  topic: string,
  subject: string,
  content: string
): Promise<string> {
  const sessionsRef = collection(db, "users", uid, "sessions");

  const newSession: Omit<Session, "id"> = {
    uid,
    topic,
    subject,
    content,
    score: 0,
    duration: 0,
    questionsAsked: 0,
    questionsAnswered: 0,
    xpEarned: 0,
    createdAt: new Date().toISOString(),
    status: "in-progress",
    messages: [],
  };

  const docRef = await addDoc(sessionsRef, newSession);
  return docRef.id;
}

// Get session by ID
export async function getSession(
  uid: string,
  sessionId: string
): Promise<Session | null> {
  const sessionRef = doc(db, "users", uid, "sessions", sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) return null;
  return { id: sessionSnap.id, ...sessionSnap.data() } as Session;
}

// Get all sessions for a user
export async function getUserSessions(
  uid: string,
  limitCount: number = 50
): Promise<Session[]> {
  const sessionsRef = collection(db, "users", uid, "sessions");
  const q = query(sessionsRef, orderBy("createdAt", "desc"), limit(limitCount));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Session));
}

// Get recent sessions
export async function getRecentSessions(
  uid: string,
  limitCount: number = 5
): Promise<Session[]> {
  return getUserSessions(uid, limitCount);
}

// Update session
export async function updateSession(
  uid: string,
  sessionId: string,
  updates: Partial<Session>
): Promise<void> {
  const sessionRef = doc(db, "users", uid, "sessions", sessionId);
  await updateDoc(sessionRef, updates);
}

// Complete session
export async function completeSession(
  uid: string,
  sessionId: string,
  score: number,
  xpEarned: number
): Promise<void> {
  const sessionRef = doc(db, "users", uid, "sessions", sessionId);
  await updateDoc(sessionRef, {
    status: "completed",
    score,
    xpEarned,
    completedAt: new Date().toISOString(),
  });

  // Update user stats
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    const oldXp = userData.xp || 0;
    const oldLevel = userData.level || 1;
    const oldTotalSessions = userData.totalSessions || 0;
    
    const newXp = oldXp + xpEarned;
    const newLevel = Math.floor(newXp / 500) + 1;
    const newTotalSessions = oldTotalSessions + 1;

    await updateDoc(userRef, {
      xp: newXp,
      level: newLevel,
      totalSessions: newTotalSessions,
      totalPoints: (userData.totalPoints || 0) + score,
      lastActiveDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // === AUTOMATIC NOTIFICATIONS ===
    
    // Session milestone notifications
    const sessionMilestones = [1, 5, 10, 25, 50, 100];
    if (sessionMilestones.includes(newTotalSessions)) {
      const milestoneMessages: Record<number, { title: string; message: string }> = {
        1: { title: "🎉 First Session Complete!", message: "You've completed your first learning session. Great start!" },
        5: { title: "🌟 5 Sessions Done!", message: "You're building a great learning habit. Keep it up!" },
        10: { title: "📚 10 Sessions Milestone!", message: "Double digits! You're becoming a dedicated learner." },
        25: { title: "🏆 25 Sessions!", message: "Quarter century of sessions! You're on fire!" },
        50: { title: "⭐ 50 Sessions!", message: "Halfway to 100! Your dedication is inspiring." },
        100: { title: "💎 100 Sessions!", message: "Triple digits! You're a true learning champion!" },
      };
      const milestone = milestoneMessages[newTotalSessions];
      await createNotification(uid, "achievement", milestone.title, milestone.message, "/dashboard");
    }

    // Level up notification
    if (newLevel > oldLevel) {
      await createNotification(
        uid,
        "achievement",
        `🎮 Level ${newLevel} Reached!`,
        `Congratulations! You've leveled up to Level ${newLevel}. Keep learning to reach even higher!`,
        "/dashboard"
      );
    }

    // XP milestone notifications
    const xpMilestones = [100, 500, 1000, 2500, 5000, 10000];
    for (const milestone of xpMilestones) {
      if (oldXp < milestone && newXp >= milestone) {
        await createNotification(
          uid,
          "achievement",
          `💰 ${milestone} XP Earned!`,
          `You've accumulated ${milestone} XP! Your hard work is paying off.`,
          "/dashboard"
        );
        break; // Only one XP notification at a time
      }
    }
  }
}

// Add message to session
export async function addMessageToSession(
  uid: string,
  sessionId: string,
  message: ChatMessage
): Promise<void> {
  const sessionRef = doc(db, "users", uid, "sessions", sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (sessionSnap.exists()) {
    const messages = sessionSnap.data().messages || [];
    await updateDoc(sessionRef, {
      messages: [...messages, message],
    });
  }
}

// ==================== NOTIFICATIONS ====================

export interface Notification {
  id?: string;
  uid: string;
  type: "streak" | "achievement" | "reminder" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Create notification
export async function createNotification(
  uid: string,
  type: Notification["type"],
  title: string,
  message: string,
  actionUrl?: string
): Promise<string> {
  const notificationsRef = collection(db, "users", uid, "notifications");

  const newNotification: Omit<Notification, "id"> = {
    uid,
    type,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
    actionUrl,
  };

  const docRef = await addDoc(notificationsRef, newNotification);
  return docRef.id;
}

// Get user notifications
export async function getUserNotifications(
  uid: string,
  limitCount: number = 20
): Promise<Notification[]> {
  const notificationsRef = collection(db, "users", uid, "notifications");
  const q = query(
    notificationsRef,
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as Notification)
  );
}

// Get unread notification count
export async function getUnreadNotificationCount(uid: string): Promise<number> {
  const notificationsRef = collection(db, "users", uid, "notifications");
  const q = query(notificationsRef, where("read", "==", false));
  const snapshot = await getDocs(q);
  return snapshot.size;
}

// Mark notification as read
export async function markNotificationAsRead(
  uid: string,
  notificationId: string
): Promise<void> {
  const notificationRef = doc(db, "users", uid, "notifications", notificationId);
  await updateDoc(notificationRef, { read: true });
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(uid: string): Promise<void> {
  const notifications = await getUserNotifications(uid);
  const unread = notifications.filter((n) => !n.read);

  await Promise.all(
    unread.map((n) =>
      updateDoc(doc(db, "users", uid, "notifications", n.id!), { read: true })
    )
  );
}

// Delete notification
export async function deleteNotification(
  uid: string,
  notificationId: string
): Promise<void> {
  const notificationRef = doc(db, "users", uid, "notifications", notificationId);
  await deleteDoc(notificationRef);
}

// ==================== STREAK MANAGEMENT ====================

export async function updateStreak(uid: string): Promise<number> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return 0;

  const userData = userSnap.data();
  const lastActive = new Date(userData.lastActiveDate);
  const today = new Date();

  // Reset time to compare dates only
  lastActive.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
  );

  const oldStreak = userData.streak || 0;
  let newStreak = oldStreak;

  if (diffDays === 0) {
    // Same day, no change
  } else if (diffDays === 1) {
    // Consecutive day, increment streak
    newStreak += 1;
  } else {
    // Missed days, reset streak
    newStreak = 1;
  }

  await updateDoc(userRef, {
    streak: newStreak,
    lastActiveDate: new Date().toISOString(),
  });

  // === AUTOMATIC STREAK NOTIFICATIONS ===
  if (newStreak > oldStreak) {
    const streakMilestones: Record<number, { title: string; message: string }> = {
      3: { title: "🔥 3 Day Streak!", message: "You're on fire! 3 days of consistent learning." },
      7: { title: "🔥 1 Week Streak!", message: "A full week of learning! You're building an amazing habit." },
      14: { title: "🔥 2 Week Streak!", message: "Two weeks strong! Your dedication is remarkable." },
      21: { title: "🔥 3 Week Streak!", message: "21 days - they say it takes this long to form a habit!" },
      30: { title: "🔥 1 Month Streak!", message: "An entire month! You're a learning machine!" },
      60: { title: "🔥 2 Month Streak!", message: "60 days of consistency. Absolutely incredible!" },
      90: { title: "🔥 3 Month Streak!", message: "A quarter year of daily learning. You're legendary!" },
      365: { title: "🔥 1 Year Streak!", message: "365 days! You've achieved something truly special." },
    };

    if (streakMilestones[newStreak]) {
      const milestone = streakMilestones[newStreak];
      await createNotification(uid, "streak", milestone.title, milestone.message, "/dashboard");
    }
  }

  // Notify if streak was lost and reset
  if (diffDays > 1 && oldStreak >= 3) {
    await createNotification(
      uid,
      "streak",
      "😢 Streak Lost",
      `Your ${oldStreak} day streak has been reset. Don't worry, start fresh today!`,
      "/dashboard"
    );
  }

  return newStreak;
}

// ==================== LEADERBOARD ====================

export interface LeaderboardEntry {
  uid: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  streak: number;
  rank?: number;
}

// Get leaderboard (top users)
export async function getLeaderboard(
  limitCount: number = 10
): Promise<LeaderboardEntry[]> {
  const usersRef = collection(db, "users");
  // Get all users and sort manually to handle missing xp fields
  const snapshot = await getDocs(usersRef);

  const users = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      name: data.name || "Anonymous",
      avatar: data.avatar,
      xp: data.xp || 0,
      level: data.level || 1,
      streak: data.streak || 0,
    };
  });

  // Sort by XP descending
  users.sort((a, b) => b.xp - a.xp);

  // Add ranks and limit
  return users.slice(0, limitCount).map((user, index) => ({
    ...user,
    rank: index + 1,
  }));
}

// Recalculate user stats from sessions (for data consistency)
export async function recalculateUserStats(uid: string): Promise<void> {
  const sessionsRef = collection(db, "users", uid, "sessions");
  const q = query(sessionsRef, where("status", "==", "completed"));
  const snapshot = await getDocs(q);

  let totalXp = 0;
  let totalPoints = 0;
  let totalSessions = 0;

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    totalXp += data.xpEarned || 0;
    totalPoints += data.score || 0;
    totalSessions += 1;
  });

  const level = Math.floor(totalXp / 500) + 1;

  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    xp: totalXp,
    totalPoints,
    totalSessions,
    level,
    updatedAt: new Date().toISOString(),
  });
}

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
    const newXp = (userData.xp || 0) + xpEarned;
    const newLevel = Math.floor(newXp / 500) + 1;

    await updateDoc(userRef, {
      xp: newXp,
      level: newLevel,
      totalSessions: (userData.totalSessions || 0) + 1,
      totalPoints: (userData.totalPoints || 0) + score,
      lastActiveDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
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

  let newStreak = userData.streak || 0;

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
  const q = query(usersRef, orderBy("xp", "desc"), limit(limitCount));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc, index) => {
    const data = doc.data();
    return {
      uid: doc.id,
      name: data.name,
      avatar: data.avatar,
      xp: data.xp || 0,
      level: data.level || 1,
      streak: data.streak || 0,
      rank: index + 1,
    };
  });
}

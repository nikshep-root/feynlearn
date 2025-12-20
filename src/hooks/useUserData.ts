"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

// ==================== USER PROFILE HOOK ====================

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
  preferences: {
    defaultPersona: "curious" | "challenging" | "supportive";
    questionsPerSession: number;
    autoPlayNext: boolean;
    showHints: boolean;
    darkMode: boolean;
    language: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    reviewReminders: boolean;
    streakReminders: boolean;
    weeklyDigest: boolean;
  };
}

export function useUserProfile() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/user/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const data = await res.json();
      setProfile(data);
      return data;
    } catch (err) {
      throw err;
    }
  };

  return { profile, loading, error, refetch: fetchProfile, updateProfile };
}

// ==================== NOTIFICATIONS HOOK ====================

export interface Notification {
  id: string;
  uid: string;
  type: "streak" | "achievement" | "reminder" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export function useNotifications() {
  const { status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/user/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/user/notifications?id=${notificationId}`, {
        method: "DELETE",
      });
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error(err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

// ==================== SESSIONS HOOK ====================

export interface Session {
  id: string;
  uid: string;
  topic: string;
  subject: string;
  content: string;
  score: number;
  duration: number;
  questionsAsked: number;
  questionsAnswered: number;
  xpEarned: number;
  createdAt: string;
  completedAt?: string;
  status: "in-progress" | "completed" | "abandoned";
}

export function useSessions(recent: boolean = false, limit: number = 50) {
  const { status } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (recent) params.set("recent", "true");
      params.set("limit", limit.toString());

      const res = await fetch(`/api/user/sessions?${params}`);
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data = await res.json();
      setSessions(data.sessions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [status, recent, limit]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const createSession = async (
    topic: string,
    subject: string,
    content?: string
  ) => {
    try {
      const res = await fetch("/api/user/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, subject, content }),
      });
      if (!res.ok) throw new Error("Failed to create session");
      const data = await res.json();
      await fetchSessions();
      return data.sessionId;
    } catch (err) {
      throw err;
    }
  };

  return { sessions, loading, refetch: fetchSessions, createSession };
}

// ==================== SINGLE SESSION HOOK ====================

export function useSessionDetail(sessionId: string) {
  const { status } = useSession();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    if (status !== "authenticated" || !sessionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/user/sessions/${sessionId}`);
      if (!res.ok) throw new Error("Failed to fetch session");
      const data = await res.json();
      setSession(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [status, sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const completeSession = async (score: number, xpEarned: number) => {
    try {
      await fetch(`/api/user/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complete: true, score, xpEarned }),
      });
      await fetchSession();
    } catch (err) {
      throw err;
    }
  };

  return { session, loading, refetch: fetchSession, completeSession };
}

// ==================== LEADERBOARD HOOK ====================

export interface LeaderboardEntry {
  uid: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  streak: number;
  rank: number;
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leaderboard");
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      const data = await res.json();
      setLeaderboard(data.leaderboard);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { leaderboard, loading, refetch: fetchLeaderboard };
}

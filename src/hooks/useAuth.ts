"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const user = session?.user;

  const login = async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return result;
  };

  const loginWithGoogle = async () => {
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  const register = async (email: string, password: string, name?: string) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }

    // Auto login after registration
    await login(email, password);

    return data;
  };

  const logout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const requireAuth = () => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    loginWithGoogle,
    register,
    logout,
    requireAuth,
  };
}

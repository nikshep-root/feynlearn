import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Helper function to get session on server side
export async function getSession() {
  return await getServerSession(authOptions);
}

// Helper function to get current user on server side
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

// Helper function to check if user is authenticated
export async function isAuthenticated() {
  const session = await getSession();
  return !!session?.user;
}

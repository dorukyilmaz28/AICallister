"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  teamId?: string;
  teamNumber?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in (has token)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    setIsLoading(false);
  }, []);

  const logout = () => {
    authApi.logout();
    setUser(null);
    router.push("/auth/signin");
  };

  const isAuthenticated = !!user;
  const isPending = user?.status === "pending";
  const isApproved = user?.status === "approved";

  return {
    user,
    isLoading,
    isAuthenticated,
    isPending,
    isApproved,
    logout,
    setUser, // To update user after login
  };
}

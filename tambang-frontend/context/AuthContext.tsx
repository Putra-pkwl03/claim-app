"use client";
import { createContext, useContext, useEffect } from "react";
import useSWR from "swr";
import { me, logout as apiLogout, refreshToken } from "@/lib/api/auth";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  user: any | null;
  loading: boolean;
  refresh: () => void;
  setUser: (user: any | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: () => {},
  setUser: () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, error, mutate } = useSWR("auth-user", me, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const loading = !error && !data;
  const user = data?.user || null;

  const setUser = (newUser: any | null) => {
    mutate({ ...data, user: newUser }, false);
  };

  const logout = async () => {
    try {
      await apiLogout();
      setUser(null);
    } catch (err) {
      console.error("Logout gagal:", err);
      setUser(null);
    }
  };

  const getTokenRemainingTime = (): number => {
    const token = document.cookie
      .split("; ")
      .find(row => row.startsWith("auth-jwt-pcys="))
      ?.split("=")[1];
    if (!token) return 0;

    const decoded: any = jwtDecode(token);
    const now = Date.now() / 1000; 
    return (decoded.exp - now) * 1000; 
  };

  useEffect(() => {
    if (!user) return;

    let idleTimeout: NodeJS.Timeout;
    let refreshTimeout: NodeJS.Timeout;

    const IDLE_TIMEOUT = 55 * 60 * 1000; 
    const REFRESH_INTERVAL = 5 * 60 * 1000; 

    const logoutUser = async () => {
      // console.log("Tidak ada aktivitas 1 jam, logout...");
      await logout();
    };

    const refreshUserToken = async () => {
      const remaining = getTokenRemainingTime();
      if (remaining < 10 * 60 * 1000) { 
        // console.log("Token hampir habis, refresh token...");
        try {
          await refreshToken();
          // console.log("Refresh token berhasil");
          await mutate();
        } catch (err) {
          // console.log("Refresh gagal, logout:", err);
          await logout();
        }
      } else {
        // console.log(`Token masih aman, sisa ${Math.floor(remaining / 60000)} menit`);
      }
      startRefreshTimer();
    };

    const startIdleTimer = () => {
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(logoutUser, IDLE_TIMEOUT);
    };

    const startRefreshTimer = () => {
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(refreshUserToken, REFRESH_INTERVAL);
    };

    const resetTimers = () => {
      startIdleTimer();
      startRefreshTimer();
    };

    // Event listener aktivitas user
    window.addEventListener("scroll", resetTimers);
    window.addEventListener("mousemove", resetTimers);
    window.addEventListener("keydown", resetTimers);

    // Mulai kedua timer
    resetTimers();

    return () => {
      clearTimeout(idleTimeout);
      clearTimeout(refreshTimeout);
      window.removeEventListener("scroll", resetTimers);
      window.removeEventListener("mousemove", resetTimers);
      window.removeEventListener("keydown", resetTimers);
    };
  }, [user, mutate]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh: mutate, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/authFetch";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

      // ✅ CASE 1: token missing → logout
      if (!token) {
        setUser(null);
        setLoading(false);
        router.replace("/signin");
        return;
      }

      // ✅ CASE 2: token exists → verify
      const res = await authFetch(`${API_URL}/auth/me`);

      if (!res || res.status === 401) {
        localStorage.removeItem("token");
        setUser(null);
        setLoading(false);
        router.replace("/signin");
        return;
      }

      const data = await res.json();
      setUser(data);
      setLoading(false);
    };

    loadUser();
  }, [router]);

  const logout = () => {
    localStorage.removeItem("token");
    setTimeout(() => {
      setUser(null);
    }, 3000);
    router.replace("/signin");
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
"use client";

import { useAuth } from "../../context/AuthContext";

export default function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="text-center mt-20">Loading…</p>;
  }

  if (!user) {
    return null;
  }

  return children;
}
"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/authFetch";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await authFetch(`${API_URL}/auth/me`);
      if (!res) return; 

      const data = await res.json();
      setUser(data);
    };

    fetchUser();
  }, []);

  if (!user) {
    return <p className="text-center mt-20">Loading…</p>;
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-mono font-semibold">Welcome, {user.username}</h1>
      <p className="text-gray-500 font-sans">{user.email}</p>
    </div>
  );
}
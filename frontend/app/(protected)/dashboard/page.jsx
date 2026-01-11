"use client";

import { useAuth } from "../../../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="p-10">
      <h1 className="text-2xl font-semibold">
        Welcome, {user.username}
      </h1>
      <p className="text-gray-500">{user.email}</p>
    </div>
  );
}
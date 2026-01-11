"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
const API_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/userAuth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Signup failed");
        return;
      }

      toast.success(data.message || "Signup successful");
      setUsername("");
      setEmail("");
      setPassword("");

      router.push("/signin")

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        
        {/* Brand */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-semibold tracking-tight font-sans text-gray-900">
            SigmaMail
          </h1>
          <p className="mt-2 text-sm text-gray-500 font-sans">
            Create your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1 font-sans">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Batman"
              className="w-full border-b border-gray-300 py-2 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black font-mono"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1 font-sans">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@Gotham.com"
              className="w-full border-b border-gray-300 py-2 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black font-mono"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1 font-sans">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full border-b border-gray-300 py-2 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-black font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 cursor-pointer text-sm font-medium text-white bg-black rounded-full hover:bg-gray-900 transition disabled:opacity-60 font-sans"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-10 text-center text-sm text-gray-500 font-sans">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/signin")}
            className="text-black font-medium cursor-pointer hover:underline"
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
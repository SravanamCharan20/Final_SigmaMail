"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { LogOut } from "lucide-react";
import { authFetch } from "../../../lib/authFetch";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [gmailAccounts, setGmailAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URL}/gmail/connected-accounts`
        );
        if (!res.ok) return;

        const data = await res.json();
        const accounts = data.accounts || [];
        setGmailAccounts(accounts);

        // auto-load messages if only one account
        if (accounts.length === 1) {
          handleGetMessages(accounts[0]._id);
        }
      } catch (err) {
        console.error("Failed to load Gmail accounts", err);
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadAccounts();
  }, []);

  const connectGmailAccount = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL;
    window.location.href = `${backendUrl}/auth/google?userId=${user._id}`;
  };

  const disconnectGmailAccount = async (accountId) => {
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URL}/gmail/connected-accounts/${accountId}`,
        { method: "DELETE" }
      );

      if (!res.ok) return;

      // Remove account from UI immediately
      setGmailAccounts((prev) =>
        prev.filter((account) => account._id !== accountId)
      );
    } catch (err) {
      console.error("Failed to disconnect Gmail account", err);
    }
  };

  const handleGetMessages = async (accountId) => {
    try {
      setLoadingMessages(true);

      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_SERVER_URL}/gmail/messages${
          accountId ? `?accountId=${accountId}` : ""
        }`
      );

      if (!res.ok) return;

      const data = await res.json();

      // Backend may return array OR { messages: [] }
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  return (
    <div className="h-screen flex bg-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-gray-200">
        {/* Top: Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <span className="text-lg font-semibold tracking-tight">
            SigmaMail
          </span>
        </div>

        {/* Middle: Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 text-gray-900 cursor-pointer">
            <div className="h-8 w-8 rounded-md bg-black text-white flex items-center justify-center text-sm">
              📥
            </div>
            <span className="text-sm font-medium">
              <span>Inbox</span>
            </span>
          </div>
        </div>

        {/* Bottom: Profile + Connected Accounts */}
        <div className="border-t border-gray-100 px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            {/* Avatar */}
            <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
              {user.username?.charAt(0).toUpperCase()}
            </div>

            {/* User info */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user.username}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>

            {/* Logout icon */}
            <button
              onClick={logout}
              title="Log out"
              className="p-2 rounded-md cursor-pointer text-gray-400 hover:text-red-500 hover:bg-gray-100 transition"
            >
              <LogOut className="h-5 w-5 " />
            </button>
          </div>

          {/* Connected Accounts */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-gray-400 px-1">
              Connected accounts
            </p>

            <div className="space-y-1">
              {loadingAccounts && (
                <p className="text-xs text-gray-400 px-2">Loading accounts…</p>
              )}

              {!loadingAccounts && gmailAccounts.length === 0 && (
                <p className="text-xs text-gray-400 px-2">
                  No accounts connected
                </p>
              )}

              {gmailAccounts.map((account) => (
                <div
                  key={account._id}
                  className="group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                    {account.emailAddress.charAt(0).toUpperCase()}
                  </div>

                  <span className="flex-1 text-sm text-gray-700 truncate">
                    <button
                      className="cursor-pointer text-left"
                      onClick={() => handleGetMessages(account._id)}
                    >
                      {account.emailAddress}
                    </button>
                  </span>

                  <button
                    onClick={() => disconnectGmailAccount(account._id)}
                    title="Disconnect"
                    className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:underline transition"
                  >
                    Disconnect
                  </button>
                </div>
              ))}
            </div>

            <button
              className="w-full mt-2 px-3 py-2 text-sm rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-800 hover:text-white cursor-pointer transition"
              onClick={connectGmailAccount}
            >
              + Add account
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="w-[480px] flex flex-col bg-gray-50 border-r border-gray-200">
        {/* Inbox Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold tracking-tight">Inbox</h2>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-200 bg-white">
          {loadingMessages && (
            <p className="p-6 text-sm text-gray-500">Loading messages…</p>
          )}

          {!loadingMessages && messages.length === 0 && (
            <p className="p-6 text-sm text-gray-500">
              {gmailAccounts.length === 0
                ? "Connect a Gmail account"
                : "Syncing messages…"}
            </p>
          )}

          {messages.map((msg) => (
            <div
              key={msg.messageId || msg.id}
              className="group px-6 py-4 hover:bg-gray-50 cursor-pointer transition"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                  {msg.from?.charAt(0)?.toUpperCase() || "?"}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  {/* From + Date */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {msg.from?.split("<")[0]?.trim() || "Unknown sender"}
                    </p>
                    <span className="text-xs text-gray-400">
                      {new Date(msg.internalDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Subject */}
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {msg.subject || "(No subject)"}
                  </p>

                  {/* Snippet + Pill */}
                  {/* Snippet + Email pill */}
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-400 truncate flex-1">
                      {msg.snippet}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

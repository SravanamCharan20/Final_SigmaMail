"use client";

import { useAuth } from "../../../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

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
              Inbox
            </span>
          </div>
        </div>

        {/* Bottom: Profile + Connected Accounts */}
        <div className="border-t border-gray-100 px-4 py-4">
          
          {/* User Profile */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {user.username}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider text-gray-400 px-1">
              Connected accounts
            </p>

            <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <span className="text-sm text-gray-700">
                Gmail
              </span>
              <span className="text-xs text-gray-400">
                connected
              </span>
            </div>

            <button className="w-full mt-2 px-3 py-2 text-sm rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-800 hover:text-white cursor-pointer transition">
              + Add account
            </button>
          </div>
        </div>
      </aside>

      {/* Main content placeholder */}
      <main className="flex-1 bg-gray-50">
        {/* Email list & thread view will go here */}
      </main>
    </div>
  );
}
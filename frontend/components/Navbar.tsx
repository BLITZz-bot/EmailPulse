'use client';

import React from 'react';

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    avatar?: string | null;
  };
  onLogout?: () => void;
  onOpenCompose: () => void;
}

export default function Navbar({ user, onLogout, onOpenCompose }: NavbarProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
            📧
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Email Pulse
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">ReachInbox Email Scheduler</p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenCompose}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-indigo-500/25 flex items-center gap-2"
          >
            <span>+</span> Compose Email
          </button>

          {user && (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              {user.avatar || user.image ? (
                <img src={user.avatar || user.image!} alt={user.name || 'User'} className="w-9 h-9 rounded-full ring-2 ring-indigo-500/30 object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-indigo-400">
                  {user.name?.[0] || 'U'}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium leading-none text-slate-200">{user.name || 'User'}</p>
                <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="text-xs text-slate-400 hover:text-red-400 font-medium px-2 py-1 rounded border border-slate-800 hover:border-red-500/30 transition-colors ml-2"
                >
                  Logout
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

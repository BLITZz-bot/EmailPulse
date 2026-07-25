'use client';

import React from 'react';

interface StatsCardsProps {
  scheduledCount: number;
  sentCount: number;
  failedCount: number;
}

export default function StatsCards({ scheduledCount, sentCount, failedCount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {/* Scheduled Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-indigo-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Scheduled Emails</span>
          <span className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm font-bold">
            ⏳
          </span>
        </div>
        <p className="text-3xl font-extrabold text-white mt-3">{scheduledCount}</p>
        <p className="text-xs text-slate-500 mt-1">Pending in delayed queue</p>
      </div>

      {/* Sent Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sent Successfully</span>
          <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm font-bold">
            ✅
          </span>
        </div>
        <p className="text-3xl font-extrabold text-white mt-3">{sentCount}</p>
        <p className="text-xs text-slate-500 mt-1">Delivered via Ethereal SMTP</p>
      </div>

      {/* Failed Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-rose-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Failed / Cancelled</span>
          <span className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center text-sm font-bold">
            ⚠️
          </span>
        </div>
        <p className="text-3xl font-extrabold text-white mt-3">{failedCount}</p>
        <p className="text-xs text-slate-500 mt-1">Errors or manually cancelled</p>
      </div>
    </div>
  );
}

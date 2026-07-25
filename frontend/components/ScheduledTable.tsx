'use client';

import React from 'react';
import { EmailJob } from '@/types';

interface ScheduledTableProps {
  emails: EmailJob[];
  isLoading: boolean;
  onCancel: (id: string) => void;
}

export default function ScheduledTable({ emails, isLoading, onCancel }: ScheduledTableProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 animate-pulse">
        Loading scheduled emails...
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
        <div className="text-4xl mb-3">📭</div>
        <h3 className="text-lg font-semibold text-white">No Scheduled Emails</h3>
        <p className="text-sm text-slate-400 mt-1">Click &quot;Compose Email&quot; to schedule your first cold email campaign.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/50 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Recipient</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Sender</th>
              <th className="px-6 py-4">Scheduled Time</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {emails.map((email) => (
              <tr key={email.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{email.recipient}</td>
                <td className="px-6 py-4 max-w-xs truncate">{email.subject}</td>
                <td className="px-6 py-4 text-slate-400">{email.sender}</td>
                <td className="px-6 py-4 text-slate-400">
                  {new Date(email.scheduledAt).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    ● {email.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onCancel(email.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-3 py-1.5 rounded-lg border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10 transition-all"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

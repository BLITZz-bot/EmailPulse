'use client';

import React from 'react';
import { EmailJob } from '@/types';

interface SentTableProps {
  emails: EmailJob[];
  isLoading: boolean;
}

export default function SentTable({ emails, isLoading }: SentTableProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 animate-pulse">
        Loading sent emails history...
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
        <div className="text-4xl mb-3">📤</div>
        <h3 className="text-lg font-semibold text-white">No Sent Emails Yet</h3>
        <p className="text-sm text-slate-400 mt-1">Sent emails and delivery preview links will show up here once processed by BullMQ.</p>
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
              <th className="px-6 py-4">Sent Time</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ethereal Preview</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {emails.map((email) => (
              <tr key={email.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 font-medium text-white">{email.recipient}</td>
                <td className="px-6 py-4 max-w-xs truncate">{email.subject}</td>
                <td className="px-6 py-4 text-slate-400">
                  {email.sentAt ? new Date(email.sentAt).toLocaleString() : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  {email.status === 'SENT' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ✓ SENT
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      ✕ {email.status}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {email.etherealPreview ? (
                    <a
                      href={email.etherealPreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4"
                    >
                      Preview Email ↗
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500">No preview</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

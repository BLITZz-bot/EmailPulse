'use client';

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { api } from '@/lib/axios';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialSender?: string;
}

export default function ComposeModal({ isOpen, onClose, onSuccess, initialSender }: ComposeModalProps) {
  const [sender, setSender] = useState(initialSender || '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientsText, setRecipientsText] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [delayBetweenEmailsMs, setDelayBetweenEmailsMs] = useState(2000);
  const [hourlyLimit, setHourlyLimit] = useState(200);
  const [parsedEmails, setParsedEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialSender) {
      setSender(initialSender);
    }
  }, [initialSender]);

  if (!isOpen) return null;

  // Handle CSV file upload & parsing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const foundEmails: string[] = [];
        results.data.forEach((row: unknown) => {
          const rowStr = Array.isArray(row) ? row.join(' ') : JSON.stringify(row);
          const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
          const matches = rowStr.match(emailRegex);
          if (matches) foundEmails.push(...matches);
        });
        const unique = Array.from(new Set(foundEmails));
        setParsedEmails(unique);
        setRecipientsText(unique.join(', '));
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Combine CSV emails + manual input
    const manualList = recipientsText
      .split(/[\n,]/)
      .map((r) => r.trim())
      .filter((r) => r.includes('@'));

    const allRecipients = Array.from(new Set([...parsedEmails, ...manualList]));

    if (allRecipients.length === 0) {
      setError('Please provide at least one valid recipient email address.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/api/emails/schedule', {
        sender,
        recipients: allRecipients,
        subject,
        body,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : new Date().toISOString(),
        delayBetweenEmailsMs: Number(delayBetweenEmailsMs),
      });

      onSuccess();
      onClose();
      // Reset form
      setSubject('');
      setBody('');
      setRecipientsText('');
      setParsedEmails([]);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(errorMsg || 'Failed to schedule emails.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative text-white">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl p-2 rounded-lg hover:bg-slate-800"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
          <span>📝</span> Compose & Schedule Campaign
        </h2>
        <p className="text-xs text-slate-400 mb-6">Schedule emails to single or bulk lead lists with custom delays.</p>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-lg">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Sender */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Sender Email</label>
            <input
              type="email"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              required
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="sender@example.com"
            />
          </div>

          {/* CSV Upload */}
          <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-xl p-4 text-center">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Upload Lead File (CSV / TXT)</label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
            />
            {parsedEmails.length > 0 && (
              <p className="text-xs text-emerald-400 font-medium mt-2">
                ✓ Detected {parsedEmails.length} unique email address(es)
              </p>
            )}
          </div>

          {/* Recipients Manual Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Recipients (Comma or line separated)
            </label>
            <textarea
              value={recipientsText}
              onChange={(e) => setRecipientsText(e.target.value)}
              rows={2}
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="alex@company.com, sarah@startup.io"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="Quick question regarding your workflow..."
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={4}
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              placeholder="Hi {{name}}, wanted to reach out..."
            />
          </div>

          {/* Schedule Settings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Start Sending At</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Delay (ms)</label>
              <input
                type="number"
                value={delayBetweenEmailsMs}
                onChange={(e) => setDelayBetweenEmailsMs(Number(e.target.value))}
                min={500}
                step={500}
                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Hourly Limit</label>
              <input
                type="number"
                value={hourlyLimit}
                onChange={(e) => setHourlyLimit(Number(e.target.value))}
                min={10}
                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="200"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-2 rounded-lg transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50"
            >
              {loading ? 'Scheduling...' : '🚀 Schedule Campaign'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

'use client';

import React, { useState, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import Navbar from '@/components/Navbar';
import StatsCards from '@/components/StatsCards';
import ScheduledTable from '@/components/ScheduledTable';
import SentTable from '@/components/SentTable';
import ComposeModal from '@/components/ComposeModal';
import { useSearchParams } from 'next/navigation';
import { EmailJob, Stats, User } from '@/types';

function DashboardContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get('demo') === 'true';

  const [activeTab, setActiveTab] = useState<'scheduled' | 'sent'>('scheduled');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  // Fetch Authenticated User Profile from Backend (/auth/me)
  const { data: realUser } = useQuery<User | null>({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const res = await api.get('/auth/me');
        return res.data;
      } catch {
        return null;
      }
    },
    enabled: !isDemoMode,
  });

  const demoUser: User = {
    id: 'demo-user-id',
    email: 'demo@example.com',
    name: 'Demo User (Testing)',
  };

  const user = isDemoMode ? demoUser : realUser;

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore err
    }
    window.location.href = '/';
  };

  // Fetch Stats
  const { data: stats } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await api.get('/api/emails/stats');
      return res.data;
    },
    refetchInterval: 3000, // Auto refresh every 3s
  });

  // Fetch Scheduled Emails
  const { data: scheduledEmails = [], isLoading: loadingScheduled } = useQuery<EmailJob[]>({
    queryKey: ['scheduledEmails'],
    queryFn: async () => {
      const res = await api.get('/api/emails/scheduled');
      return res.data;
    },
    refetchInterval: 3000,
  });

  // Fetch Sent Emails
  const { data: sentEmails = [], isLoading: loadingSent } = useQuery<EmailJob[]>({
    queryKey: ['sentEmails'],
    queryFn: async () => {
      const res = await api.get('/api/emails/sent');
      return res.data;
    },
    refetchInterval: 3000,
  });

  // Cancel Email Mutation
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/emails/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledEmails'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      {/* Header */}
      <Navbar
        user={user || undefined}
        onLogout={handleLogout}
        onOpenCompose={() => setIsComposeOpen(true)}
      />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Stats */}
        <StatsCards
          scheduledCount={stats?.scheduled ?? scheduledEmails.length}
          sentCount={stats?.sent ?? sentEmails.filter((e) => e.status === 'SENT').length}
          failedCount={stats?.failed ?? sentEmails.filter((e) => e.status === 'FAILED').length}
        />

        {/* Tabs & Filter Bar */}
        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'scheduled'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              ⏳ Scheduled Emails ({scheduledEmails.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'sent'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              📤 Sent History ({sentEmails.length})
            </button>
          </div>

          <span className="text-xs text-slate-500 hidden sm:block">
            ⚡ Live auto-refreshes every 3 seconds
          </span>
        </div>

        {/* Tab Content */}
        {activeTab === 'scheduled' ? (
          <ScheduledTable
            emails={scheduledEmails}
            isLoading={loadingScheduled}
            onCancel={(id) => cancelMutation.mutate(id)}
          />
        ) : (
          <SentTable emails={sentEmails} isLoading={loadingSent} />
        )}

      </main>

      {/* Compose Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        initialSender={user?.email}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['scheduledEmails'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
        }}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white p-8 text-center">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

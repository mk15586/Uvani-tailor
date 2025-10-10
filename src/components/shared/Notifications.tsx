"use client";

import React, { useEffect, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Get user email
  useEffect(() => {
    async function getEmail() {
      let email: string | null = null;
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.email) email = userData.user.email;
      } catch (e) {
        // ignore
      }
      if (!email && typeof window !== 'undefined') {
        email = localStorage.getItem('uvani_signup_email');
      }
      setUserEmail(email);
    }
    getEmail();
  }, []);

  const fetchNotifications = async () => {
    if (!userEmail) return;
    try {
      const { data, error } = await supabase
        .from('tailors')
        .select('notification_message')
        .eq('email', userEmail)
        .maybeSingle();
      if (!error && data && Array.isArray(data.notification_message)) {
        setNotifications(data.notification_message);
        setUnreadCount(data.notification_message.filter((n: any) => n.read === false).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (e) {
      console.warn('Failed to fetch notifications', e);
    }
  };

  useEffect(() => { fetchNotifications(); }, [userEmail]);

  const markNotificationRead = async (notifId: string) => {
    if (!userEmail) return;
    try {
      const { data: row, error: fetchErr } = await supabase.from('tailors').select('notification_message').eq('email', userEmail).maybeSingle();
      if (fetchErr) throw fetchErr;
      const arr = Array.isArray(row?.notification_message) ? row.notification_message : [];
      const updated = arr.map((n: any) => n.id === notifId ? { ...n, read: true } : n);
      const { error } = await supabase.from('tailors').update({ notification_message: updated }).eq('email', userEmail);
      if (error) throw error;
      setNotifications(updated);
      setUnreadCount(updated.filter((n: any) => !n.read).length);
    } catch (e: any) {
      console.error('markNotificationRead error', e);
      toast({ title: 'Failed to mark notification', description: e?.message || String(e) });
    }
  };

  const markAllRead = async () => {
    if (!userEmail) return;
    try {
      const { data: row, error: fetchErr } = await supabase.from('tailors').select('notification_message').eq('email', userEmail).maybeSingle();
      if (fetchErr) throw fetchErr;
      const arr = Array.isArray(row?.notification_message) ? row.notification_message : [];
      const updated = arr.map((n: any) => ({ ...n, read: true }));
      const { error } = await supabase.from('tailors').update({ notification_message: updated }).eq('email', userEmail);
      if (error) throw error;
      setNotifications(updated);
      setUnreadCount(0);
    } catch (e: any) {
      console.error('markAllRead error', e);
      toast({ title: 'Failed to mark all read', description: e?.message || String(e) });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/70 bg-white text-slate-700 shadow-[0_12px_28px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-gradient-to-br hover:from-violet-500/80 hover:via-fuchsia-500/80 hover:to-amber-400/80 hover:text-white dark:border-white/15 dark:bg-gradient-to-br dark:from-[#0b0d1d] dark:via-[#0b0f24] dark:to-[#090b18] dark:text-white"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-amber-500 px-1 text-[10px] font-semibold text-white shadow-lg">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        forceMount
        className="w-[320px] overflow-hidden rounded-3xl border border-slate-200/50 bg-white/95 p-0 shadow-[0_28px_60px_rgba(15,23,42,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-gradient-to-b dark:from-slate-900/95 dark:via-slate-900/92 dark:to-slate-950/95"
      >
        <div className="flex items-center justify-between border-b border-slate-200/60 bg-white/80 px-5 py-4 backdrop-blur dark:border-white/10 dark:bg-white/5">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
            <p className="text-xs text-slate-500 dark:text-slate-300">Stay updated with the latest activity</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition-colors hover:bg-white hover:text-slate-900 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              onClick={() => fetchNotifications()}
            >
              Refresh
            </button>
            <button
              className="rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 px-3 py-1 font-semibold text-white shadow-sm transition-transform hover:-translate-y-px"
              onClick={() => markAllRead()}
            >
              Mark all
            </button>
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto bg-gradient-to-b from-white/92 via-white to-white/95 text-slate-700 dark:from-slate-900/80 dark:via-slate-900/90 dark:to-slate-950/95 dark:text-slate-200">
          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-300">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400 dark:border-white/20 dark:text-white/30">
                <Bell className="h-5 w-5" />
              </span>
              You're all caught up!
            </div>
          )}
          {notifications.map((n: any) => (
            <div
              key={n.id}
              className={`group flex items-start gap-3 px-5 py-4 transition-colors ${n.read ? 'opacity-60 dark:opacity-70' : 'bg-white/70 dark:bg-white/10'}`}
            >
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600/80 to-fuchsia-500/80 text-white shadow-md">
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-white line-clamp-2">{n.content}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                  {n.time ? new Date(n.time).toLocaleString() : ''}
                </p>
              </div>
              {!n.read && (
                <button
                  className="rounded-full border border-transparent px-3 py-1 text-xs font-medium text-violet-600 transition-colors hover:border-violet-200 hover:bg-violet-50 group-hover:translate-y-[-2px] dark:text-violet-300 dark:hover:border-violet-400/40 dark:hover:bg-violet-500/10"
                  onClick={() => markNotificationRead(n.id)}
                >
                  Mark
                </button>
              )}
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

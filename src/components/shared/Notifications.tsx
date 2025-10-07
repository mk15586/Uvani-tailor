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
        <Button variant="ghost" size="icon" className="rounded-full relative overflow-visible">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" forceMount className="w-[320px]">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="text-sm font-medium">Notifications</div>
          <div className="flex items-center gap-2">
            <button className="text-xs text-muted-foreground" onClick={() => fetchNotifications()}>Refresh</button>
            <button className="text-xs text-primary" onClick={() => markAllRead()}>Mark all read</button>
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {notifications.length === 0 && (
            <div className="p-3 text-sm text-muted-foreground">No notifications</div>
          )}
          {notifications.map((n: any) => (
            <div key={n.id} className={`px-3 py-2 border-t hover:bg-muted/20 flex items-start justify-between ${n.read ? 'opacity-60' : ''}`}>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{n.content}</div>
                <div className="text-xs text-muted-foreground">{n.time ? new Date(n.time).toLocaleString() : ''}</div>
              </div>
              <div className="ml-3 flex flex-col items-end gap-2">
                {!n.read && (
                  <button className="text-xs text-primary" onClick={() => markNotificationRead(n.id)}>Mark</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

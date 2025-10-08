"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Store, 
  Mail, 
  Phone, 
  Palette, 
  Bell, 
  MapPin, 
  Shield, 
  Key, 
  CreditCard,
  Globe,
  Lock,
  Download,
  Upload,
  Camera,
  Settings as SettingsIcon,
  LogOut,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  Edit3,
  Save,
  X
} from "lucide-react";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("@/components/shared/Map"), { ssr: false });
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

function ActiveSessionsDialog() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const fetchCount = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/account/active-sessions');
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to fetch');
      setCount(Number(body.count || 0));
    } catch (err: any) {
      toast({ title: 'Failed to fetch sessions', description: err?.message || String(err) });
    } finally {
      setLoading(false);
    }
  };

  const router = useRouter();
  const signOutAll = async () => {
    try {
      setLoading(true);
      const emailStored = typeof window !== 'undefined' ? localStorage.getItem('uvani_signup_email') : null;
      const res = await fetch('/api/account/signout-others', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: emailStored }) });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed');
      toast({ title: 'Signed out from all devices', description: body.message || '' });
      // Also sign out locally and redirect to signin
      try { await supabase.auth.signOut(); } catch (e) { console.warn('Local signout failed', e); }
      try { if (typeof window !== 'undefined') { localStorage.removeItem('uvani_signup_email'); localStorage.removeItem('uvani_settings'); } } catch (e) {}
      router.push('/signin');
    } catch (err: any) {
      toast({ title: 'Sign out failed', description: err?.message || String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (v) fetchCount(); }}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 text-xs hover:bg-primary/10">
            View
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Active Sessions</DialogTitle>
            <DialogDescription>Manage devices that currently have access to your account.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold">{loading ? '...' : count}</div>
              <div className="text-sm text-muted-foreground">devices have access</div>
            </div>
            <div className="space-y-2">
              <Textarea value={"If you believe any device is unauthorized, sign out other devices and contact support."} readOnly />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => fetchCount()} disabled={loading}>Refresh</Button>
            <Button variant="destructive" onClick={signOutAll} disabled={loading}>Sign out from all devices</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [emailForVerify, setEmailForVerify] = useState<string | null>(null);

  const verifyCurrent = async () => {
    try {
      if (!current) return toast({ title: 'Enter current password' });
      setVerifying(true);
      const emailStored = emailForVerify || (typeof window !== 'undefined' ? localStorage.getItem('uvani_signup_email') : null);
      if (!emailStored) {
        setVerifying(false);
        return toast({ title: 'No signed in user', description: 'No email was available to verify against.' });
      }
      const res = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailStored, password: current }),
      });
      const body = await res.json();
      if (!res.ok || body.error) {
        toast({ title: 'Incorrect password', description: body.error || 'Current password does not match.' });
        setVerifying(false);
        return false;
      }
      setVerifying(false);
      return true;
    } catch (err: any) {
      setVerifying(false);
      toast({ title: 'Verification failed', description: err.message || String(err) });
      return false;
    }
  };

  useEffect(() => {
    if (!open) return;
    (async () => {
      let emailStored: string | null = null;
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.email) emailStored = userData.user.email;
      } catch (e) {
        // ignore
      }
      if (!emailStored && typeof window !== 'undefined') {
        emailStored = localStorage.getItem('uvani_signup_email');
      }
      setEmailForVerify(emailStored);
    })();
  }, [open]);

  const handleUpdate = async () => {
    try {
      if (!newPass) return toast({ title: 'Enter new password' });
      if (newPass !== confirmPass) return toast({ title: 'Passwords do not match' });
      setUpdating(true);
      const emailStored = typeof window !== 'undefined' ? localStorage.getItem('uvani_signup_email') : null;
      if (!emailStored) return toast({ title: 'No signed in user' });
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailStored, newPassword: newPass }),
      });
      const body = await res.json();
      if (!res.ok || body.error) throw new Error(body.error || 'Failed to update');
      toast({ title: 'Password updated' });
      setOpen(false);
      setCurrent(''); setNewPass(''); setConfirmPass('');
    } catch (err: any) {
      toast({ title: 'Update failed', description: err.message || String(err) });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-2 hover:bg-primary/10 transition-all duration-200">
            <Key className="h-3.5 w-3.5" />
            Update
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              Change Password
            </DialogTitle>
            <DialogDescription>Verify your current password then set a new one.</DialogDescription>
            {emailForVerify && (
              <div className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2 rounded-md">
                Verifying for: <strong>{emailForVerify}</strong>
              </div>
            )}
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input 
                id="current-password"
                type="password" 
                value={current} 
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Enter your current password"
              />
            </div>
            <Button 
              onClick={async () => {
                const ok = await verifyCurrent();
                if (ok) toast({ title: 'Verified', description: 'You may now set a new password.' });
              }} 
              disabled={verifying}
              variant="outline"
              className="w-full"
            >
              {verifying ? 'Verifying...' : 'Verify Current Password'}
            </Button>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password"
                type="password" 
                value={newPass} 
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input 
                id="confirm-password"
                type="password" 
                value={confirmPass} 
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updating}>
              {updating ? 'Saving...' : 'Change Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [lat, setLat] = useState<number>(0);
  const [lng, setLng] = useState<number>(0);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const [timeZone, setTimeZone] = useState("UTC+1");
  const [language, setLanguage] = useState("English");
  const [deletionReason, setDeletionReason] = useState('');
  const [requestingDeletion, setRequestingDeletion] = useState(false);
  const [tailorLoaded, setTailorLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" && window.localStorage.getItem("uvani_settings");
    if (saved) {
      try {
        const s = JSON.parse(saved);
        setShopName(s.shopName || "");
        setName(s.name || "");
        setEmail(s.email || "");
        setPhone(s.phone || "");
        setBio(s.bio || "");
        setWebsite(s.website || "");
        setDarkMode(Boolean(s.darkMode));
        setNotifications(Boolean(s.notifications));
        setEmailNotifications(Boolean(s.emailNotifications));
        setSmsNotifications(Boolean(s.smsNotifications));
        setTimeZone(s.timeZone || "UTC+1");
        setLanguage(s.language || "English");
        if (s.lat) setLat(s.lat);
        if (s.lng) setLng(s.lng);
        if (s.avatar) setAvatar(s.avatar);
      } catch (e) {
        // ignore
      }
    } else {
      setLat(6.5244);
      setLng(3.3792);
    }
  }, []);

  const save = async () => {
    setIsSaving(true);
    await saveToSupabase();
    setIsSaving(false);
    setIsEditing(false);
  };

  const getCurrentLocation = async () => {
    if (typeof window === 'undefined' || !('navigator' in window) || !navigator.geolocation) {
      toast({ title: 'Geolocation not available', description: 'Your browser does not support geolocation.' });
      return;
    }
    setGettingLocation(true);
    try {
      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const newLat = pos.coords.latitude;
            const newLng = pos.coords.longitude;
            setLat(Number(newLat));
            setLng(Number(newLng));
            toast({ title: 'Location detected', description: `Lat: ${newLat.toFixed(6)}, Lng: ${newLng.toFixed(6)}` });
            resolve();
          },
          (err) => {
            console.error('Geolocation error', err);
            if (err.code === 1) {
              toast({ title: 'Permission denied', description: 'Please allow location access in your browser.' });
            } else if (err.code === 2) {
              toast({ title: 'Position unavailable', description: 'Could not determine your location.' });
            } else if (err.code === 3) {
              toast({ title: 'Timeout', description: 'Getting location timed out.' });
            } else {
              toast({ title: 'Geolocation error', description: err.message || String(err) });
            }
            reject(err);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });
    } catch (e) {
      // already handled above
    } finally {
      setGettingLocation(false);
    }
  };

  const reset = () => {
    setIsEditing(false);
    setAvatarFile(null);
    loadTailor();
  };

  // Toggle dark mode and persist immediately to Supabase
  const toggleDarkMode = async (val: boolean | number | string | undefined) => {
    const newVal = Boolean(val);
    // optimistic UI
    setDarkMode(newVal);
    try {
      // apply immediately to document for instant feedback
      if (typeof window !== 'undefined') {
        if (newVal) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');
      }
      const emailStored = typeof window !== 'undefined' ? localStorage.getItem('uvani_signup_email') : null;
      if (!emailStored) {
        toast({ title: 'Not signed in', description: 'Cannot save preference.' });
        return;
      }
      const { error } = await supabase.from('tailors').update({ dark_mode: newVal }).eq('email', emailStored);
      if (error) throw error;
      // persist in local storage settings object
      try {
        const saved = JSON.parse(localStorage.getItem('uvani_settings') || '{}');
        saved.darkMode = newVal;
        localStorage.setItem('uvani_settings', JSON.stringify(saved));
      } catch (e) {}
      // notify layout/header to re-fetch if needed
      try { window.dispatchEvent(new CustomEvent('uvani:profile-updated', { detail: { email: emailStored } })); } catch (e) {}
      toast({ title: 'Preference saved', description: `Dark mode ${newVal ? 'enabled' : 'disabled'}` });
    } catch (err: any) {
      // revert on failure
      setDarkMode((prev) => !prev);
      if (typeof window !== 'undefined') {
        if (!newVal) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');
      }
      console.error('Failed to save dark mode', err);
      toast({ title: 'Save failed', description: err?.message || String(err) });
    }
  };

  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out failed', e);
    }
    try { if (typeof window !== 'undefined') { localStorage.removeItem('uvani_signup_email'); localStorage.removeItem('uvani_settings'); } } catch (e) {}
    toast({ title: 'Signed out', description: 'You have been signed out.' });
    router.push('/signin');
  };

  const exportCsv = async () => {
    try {
      const emailStored = typeof window !== 'undefined' ? localStorage.getItem('uvani_signup_email') : null;
      if (!emailStored) return toast({ title: 'Not signed in' });
      // fetch data for this tailor - orders and profile
      const { data: orders } = await supabase.from('orders').select('*').eq('tailor_email', emailStored);
      const { data: tailor } = await supabase.from('tailors').select('*').eq('email', emailStored).maybeSingle();
      const payload = { tailor, orders };
      const csvRows: string[] = [];
      // Simple CSV: Orders header
      csvRows.push('order_id,customer_name,status,total_amount,created_at');
      (orders || []).forEach((o: any) => {
        const row = [
          (o.id || '').toString().replace(/"/g,'""'),
          (o.customer_name || '').toString().replace(/"/g,'""'),
          (o.status || '').toString().replace(/"/g,'""'),
          (o.total_amount || '').toString().replace(/"/g,'""'),
          (o.created_at || '').toString().replace(/"/g,'""'),
        ];
        csvRows.push(row.map((c) => `"${c}"`).join(','));
      });
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `uvani_export_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: 'Export started', description: 'CSV download should begin shortly.' });
    } catch (err: any) {
      console.error('Export failed', err);
      toast({ title: 'Export failed', description: err?.message || String(err) });
    }
  };

  const requestAccountDeletion = async () => {
    try {
      if (!deletionReason || deletionReason.trim().length < 10) return toast({ title: 'Please provide a reason (at least 10 characters)' });
      setRequestingDeletion(true);
      const emailStored = typeof window !== 'undefined' ? localStorage.getItem('uvani_signup_email') : null;
      const res = await fetch('/api/account/request-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailStored, reason: deletionReason }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Request failed');
      toast({ title: 'Request sent', description: 'Your deletion request has been sent to the admin.' });
      setDeletionReason('');
    } catch (err: any) {
      toast({ title: 'Request failed', description: err?.message || String(err) });
    } finally {
      setRequestingDeletion(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEditing) return;
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target?.result as string || null);
      reader.readAsDataURL(file);
    }
  };

  const loadTailor = async (emailArg?: string) => {
    try {
      let emailStored = typeof window !== 'undefined' ? localStorage.getItem('uvani_signup_email') : null;
      if (emailArg) emailStored = emailArg;
      if (!emailStored && supabase.auth) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user?.email) emailStored = userData.user.email;
        } catch (e) {
          console.warn('supabase.auth.getUser failed', e);
        }
      }
      if (!emailStored) {
        setTailorLoaded(false);
        console.warn('No email found for loading tailor');
        return;
      }
      
      console.log('🔍 Loading tailor for email:', emailStored);
      
      const { data, error } = await supabase
        .from('tailors')
        .select('*')
        .eq('email', emailStored)
        .maybeSingle();
      
      if (error) {
        console.error('❌ Failed to load tailor:', error);
        toast({ title: 'Failed to load profile', description: error.message || JSON.stringify(error) });
        setTailorLoaded(false);
        return;
      }
      
      if (!data) {
        console.warn('⚠️ No tailor record found for:', emailStored);
        toast({ title: 'Profile not found', description: 'No profile was found for the provided email.' });
        setTailorLoaded(false);
        return;
      }

      console.log('✅ Tailor data loaded:', data);
      
      // Load bio - check both bio and about columns for backward compatibility
      const bioValue = data.bio || data.about || '';
      console.log('📝 Bio value from database:', bioValue);
      
      setShopName(data.business_name || '');
      setName(data.name || '');
      setEmail(data.email || '');
      setPhone(data.phone_number || '');
      setBio(bioValue);
      setDarkMode(Boolean(data.dark_mode));
      setNotifications(Boolean(data.notifications));
      setEmailNotifications(Boolean(data.email_notifications));
      setSmsNotifications(Boolean(data.sms_notifications));
  setTimeZone(data.time_zone || 'UTC+1');
  setLanguage(data.language || 'English');
      if (data.latitude) setLat(Number(data.latitude));
      if (data.longitude) setLng(Number(data.longitude));
      
      if (data.profile_picture) {
        const pp: string = data.profile_picture;
        if (pp.startsWith('http://') || pp.startsWith('https://')) {
          setAvatar(pp);
        } else if (pp && pp.length > 0) {
          try {
            const { data: urlData } = supabase.storage.from('Images').getPublicUrl(pp);
            const resolved = urlData?.publicUrl || pp;
            setAvatar(resolved);
          } catch (e) {
            setAvatar(pp);
          }
        }
      } else if (data.avatar) {
        setAvatar(data.avatar);
      }
      // No profile_picture_path in schema, so do not setAvatarPath from it
      if (data.profile_picture && !(data.profile_picture.startsWith('http')) && data.profile_picture.includes('/')) {
        setAvatarPath(data.profile_picture);
      }
      
      setTailorLoaded(true);
      console.log('✅ Profile loaded successfully');
    } catch (err) {
      console.error('❌ loadTailor error:', err);
      toast({ 
        title: 'Error loading profile', 
        description: err instanceof Error ? err.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => { loadTailor(); }, []);

  // Apply dark mode class to the document root and persist to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // persist to local storage so other pages/components can read immediately
      const saved = JSON.parse(localStorage.getItem('uvani_settings') || '{}');
      saved.darkMode = Boolean(darkMode);
      localStorage.setItem('uvani_settings', JSON.stringify(saved));
    } catch (e) {
      console.warn('Failed to apply dark mode', e);
    }
  }, [darkMode]);

  const uploadAvatarToStorage = async (file: File) => {
    const path = `profile-pic/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('Images').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('Images').getPublicUrl(path);
    return { publicUrl: urlData?.publicUrl || null, path };
  };

  const saveToSupabase = async () => {
    try {
      const emailStored = typeof window !== 'undefined' ? localStorage.getItem('uvani_signup_email') : null;
      if (!emailStored) {
        toast({ title: 'Not signed in', description: 'No signed-in user found.' });
        return;
      }

      console.log('💾 Starting save to Supabase...');
      console.log('📝 Bio to save:', bio);
      console.log('📧 Email used for update:', emailStored);

      let publicAvatarUrl = avatar;
      let newAvatarPath: string | null = null;
      
      if (avatarFile) {
        try {
          if (avatarPath) {
            await supabase.storage.from('Images').remove([avatarPath]);
          }
        } catch (e) {
          console.warn('Failed to delete previous avatar', e);
        }
        const uploaded = await uploadAvatarToStorage(avatarFile);
        publicAvatarUrl = uploaded.publicUrl;
        newAvatarPath = uploaded.path;
        setAvatarPath(newAvatarPath);
      }

      // Create update object with bio field explicitly set
      const updateObj: any = {
        business_name: shopName,
        name,
        phone_number: phone,
        bio: bio || null, // Explicitly set bio, use null if empty
        dark_mode: darkMode,
        notifications,
        email_notifications: emailNotifications,
        sms_notifications: smsNotifications,
        latitude: lat || null,
        longitude: lng || null,
        profile_picture: publicAvatarUrl,
  time_zone: timeZone,
  language,
        updated_at: new Date().toISOString(), // Add updated_at timestamp
      };

      // Only add profile_picture_path if we have a new one
      // No profile_picture_path in schema, so do not add it

      console.log('📤 Update object being sent:', updateObj);

      // Perform update with explicit select to verify
      const { data, error } = await supabase
        .from('tailors')
        .update(updateObj)
        .eq('email', emailStored)
        .select('bio, about, name, business_name, latitude, longitude'); // Include coordinates to verify they were saved

      if (error) {
        console.error('❌ Update error (full object):', error);
        console.error('❌ Update error (stringified):', JSON.stringify(error));
        throw error;
      }

      console.log('✅ Update response:', data);
      
      if (data && data.length > 0) {
        console.log('✅ Bio saved successfully:', data[0].bio);
        // Verify the bio was actually saved
        if (data[0].bio !== bio) {
          console.warn('⚠️ Warning: Saved bio does not match input bio');
          console.log('Expected:', bio);
          console.log('Got:', data[0].bio);
        }
      }
      
      if (publicAvatarUrl) {
        setAvatar(publicAvatarUrl);
      }
      
      toast({ 
        title: 'Success!', 
        description: 'Profile updated successfully.',
        duration: 3000
      });
      
      // Reload data to confirm save
      await loadTailor(emailStored);
      try { window.dispatchEvent(new CustomEvent('uvani:profile-updated', { detail: { email: emailStored } })); } catch (e) {}
      
    } catch (err: any) {
      console.error('❌ Save error (full object):', err);
      console.error('❌ Save error (stringified):', JSON.stringify(err));
      toast({ 
        title: 'Save failed', 
        description: err?.message || JSON.stringify(err) || 'Failed to save profile', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-6 lg:p-8 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
      {/* Enhanced Header with Gradient Accent */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-2xl md:text-3xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Account Settings
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage your account preferences and profile information
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)} 
              className="gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              size="lg"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-muted/50 p-1.5 rounded-lg border border-border/50">
              <Button 
                variant="ghost" 
                onClick={reset} 
                className="gap-2 hover:bg-background"
                disabled={isSaving}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button 
                onClick={save} 
                className="gap-2 shadow-md"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Mode Indicator */}
      {isEditing && (
        <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg animate-in fade-in slide-in-from-top-1 duration-300">
          <div className="p-1.5 bg-primary/20 rounded-md">
            <Edit3 className="h-3.5 w-3.5 text-primary" />
          </div>
          <p className="text-sm font-medium text-primary">Edit mode active - Make your changes and click Save</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Preferences */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enhanced Profile Card */}
          <Card className="shadow-lg border-border/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-primary" />
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2.5 text-xl">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    Profile Information
                  </CardTitle>
                  <CardDescription className="text-sm">Update your personal and business details</CardDescription>
                </div>
                {tailorLoaded && (
                  <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                    <CheckCircle className="h-3 w-3" />
                    Loaded
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Enhanced Avatar with Edit Overlay */}
                <div className="relative group">
                  <div className={`relative rounded-2xl p-1 bg-gradient-to-br from-primary/20 to-primary/5 transition-all duration-200 ${isEditing ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
                    <Avatar className="h-24 w-24 border-2 border-background">
                      {avatar ? (
                        <AvatarImage
                          src={avatar}
                          alt="Profile"
                          className="object-cover"
                          onLoad={() => console.debug('AvatarImage loaded successfully:', avatar)}
                          onError={async (e) => {
                            console.error('AvatarImage failed to load:', avatar, e);
                            try {
                              const res = await fetch(avatar, { method: 'HEAD' });
                              console.error('Avatar HEAD response:', res.status, res.statusText);
                            } catch (fetchErr) {
                              console.error('Avatar HEAD fetch failed:', fetchErr);
                            }
                          }}
                        />
                      ) : (
                        <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                          {name ? name.charAt(0).toUpperCase() : "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    {/* Camera overlay - only visible and functional when editing */}
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 rounded-full p-2 cursor-pointer shadow-lg transition-all duration-200 hover:scale-110">
                        <Camera className="h-4 w-4 text-primary-foreground" />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleAvatarChange}
                          disabled={!isEditing}
                        />
                      </label>
                    )}
                    
                    {/* Edit indicator badge */}
                    {isEditing && (
                      <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full shadow-md animate-pulse">
                        Edit
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <p className="text-xs text-muted-foreground text-center mt-2 max-w-[100px]">
                      Click camera to change
                    </p>
                  )}
                </div>
                
                {/* Form Fields with Enhanced Styling */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="shop" className="text-sm font-medium flex items-center gap-1.5">
                      <Store className="h-3.5 w-3.5 text-muted-foreground" />
                      Shop Name
                    </Label>
                    <div className="relative group">
                      <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input 
                        id="shop" 
                        value={shopName} 
                        onChange={(e) => setShopName(e.target.value)} 
                        className={`pl-10 transition-all duration-200 ${isEditing ? 'bg-background border-primary/30 focus:border-primary' : 'bg-muted/30'}`}
                        placeholder="Enter shop name"
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      Full Name
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className={`pl-10 transition-all duration-200 ${isEditing ? 'bg-background border-primary/30 focus:border-primary' : 'bg-muted/30'}`}
                        placeholder="Your full name"
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        value={email} 
                        className="pl-10 bg-muted/30"
                        placeholder="your@email.com"
                        readOnly
                      />
                      <Badge variant="secondary" className="absolute right-2 top-2 text-xs">
                        <Lock className="h-2.5 w-2.5 mr-1" />
                        Locked
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      Phone Number
                    </Label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        className={`pl-10 transition-all duration-200 ${isEditing ? 'bg-background border-primary/30 focus:border-primary' : 'bg-muted/30'}`}
                        placeholder="+1 (555) 123-4567"
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="bio" className="text-sm font-medium flex items-center justify-between">
                      <span>Bio</span>
                      <span className="text-xs text-muted-foreground font-normal">{bio.length}/500 characters</span>
                    </Label>
                    <Textarea 
                      id="bio" 
                      value={bio} 
                      onChange={(e) => {
                        const newValue = e.target.value.slice(0, 500); // Limit to 500 chars
                        setBio(newValue);
                        console.log('📝 Bio changed:', newValue);
                      }} 
                      placeholder="Tell us about your business..."
                      rows={3}
                      readOnly={!isEditing}
                      maxLength={500}
                      className={`resize-none transition-all duration-200 ${isEditing ? 'bg-background border-primary/30 focus:border-primary' : 'bg-muted/30'}`}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Preferences Card */}
          <Card className="shadow-lg border-border/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2.5 text-xl">
                <div className="p-1.5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg">
                  <Palette className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                Preferences
              </CardTitle>
              <CardDescription className="text-sm">Customize your application experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Appearance Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-purple-500/10 rounded-md">
                      <Palette className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-semibold text-sm">Appearance</h3>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-all duration-200 group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-slate-500/10 to-slate-500/5 rounded-lg">
                        <Palette className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">Dark Mode</div>
                        <div className="text-xs text-muted-foreground">Enable dark theme</div>
                      </div>
                    </div>
                    <Switch 
                      checked={darkMode} 
                      onCheckedChange={(v) => toggleDarkMode(v)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>

                {/* Notifications Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-blue-500/10 rounded-md">
                      <Bell className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-semibold text-sm">Notifications</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg">
                          <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">In-app</div>
                          <div className="text-xs text-muted-foreground">Show in app</div>
                        </div>
                      </div>
                      <Switch 
                        checked={notifications} 
                        onCheckedChange={(v) => setNotifications(Boolean(v))} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg">
                          <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">Email</div>
                          <div className="text-xs text-muted-foreground">Email updates</div>
                        </div>
                      </div>
                      <Switch 
                        checked={emailNotifications} 
                        onCheckedChange={(v) => setEmailNotifications(Boolean(v))} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg">
                          <Phone className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">SMS</div>
                          <div className="text-xs text-muted-foreground">Text messages</div>
                        </div>
                      </div>
                      <Switch 
                        checked={smsNotifications} 
                        onCheckedChange={(v) => setSmsNotifications(Boolean(v))} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Regional Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-primary/10 rounded-md">
                    <Globe className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">Regional Settings</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-sm font-medium flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      Time Zone
                    </Label>
                    <div className="relative group">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary pointer-events-none" />
                      <select 
                        id="timezone"
                        value={timeZone}
                        onChange={(e) => setTimeZone(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 border rounded-lg bg-background hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                      >
                        <option value="UTC-12">(UTC-12:00) International Date Line West</option>
                        <option value="UTC-8">(UTC-08:00) Pacific Time</option>
                        <option value="UTC-5">(UTC-05:00) Eastern Time</option>
                        <option value="UTC+1">(UTC+01:00) Central European Time</option>
                        <option value="UTC+5.5">(UTC+05:30) India Standard Time</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Currency selector removed per requirements */}
                  
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-sm font-medium flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      Language
                    </Label>
                    <div className="relative group">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary pointer-events-none" />
                      <select 
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 border rounded-lg bg-background hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Location, Security & Account */}
        <div className="space-y-6">
          {/* Enhanced Location Card */}
          <Card className="shadow-lg border-border/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2.5 text-lg">
                <div className="p-1.5 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg">
                  <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                Business Location
              </CardTitle>
              <CardDescription className="text-xs">Set your default store location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Latitude</Label>
                  <Input 
                    value={lat} 
                    onChange={(e) => setLat(Number(e.target.value))} 
                    placeholder="6.5244"
                    className="h-9 text-sm"
                    type="number"
                    step="0.0001"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Longitude</Label>
                  <Input 
                    value={lng} 
                    onChange={(e) => setLng(Number(e.target.value))} 
                    placeholder="3.3792"
                    className="h-9 text-sm"
                    type="number"
                    step="0.0001"
                  />
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border-2 border-border/50 shadow-inner">
                <Map lat={lat} lng={lng} location={`${lat.toFixed(4)}, ${lng.toFixed(4)}`} />
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={getCurrentLocation}
                  className="w-full gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                  disabled={gettingLocation}
                >
                  {gettingLocation ? 'Detecting...' : (
                    <>
                      <MapPin className="h-3.5 w-3.5" />
                      Current location
                    </>
                  )}
                </Button>
                <Button 
                  size="sm" 
                  onClick={save} 
                  className="w-full gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                  disabled={isSaving}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Save Location
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Security Card */}
          <Card className="shadow-lg border-border/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2.5 text-lg">
                <div className="p-1.5 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg">
                  <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                Security
              </CardTitle>
              <CardDescription className="text-xs">Manage account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/50 transition-all duration-200 group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    <Lock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Password</div>
                    <div className="text-xs text-muted-foreground">Update password</div>
                  </div>
                </div>
                <ChangePasswordDialog />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/50 transition-all duration-200 group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    <Key className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Two-Factor Auth</div>
                    <div className="text-xs text-muted-foreground">Extra security</div>
                  </div>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/50 transition-all duration-200 group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">Active Sessions</div>
                    <div className="text-xs text-muted-foreground">Device access</div>
                  </div>
                </div>
                  <ActiveSessionsDialog />
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Account Management Card */}
          <Card className="shadow-lg border-border/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-500 to-slate-700" />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2.5 text-lg">
                <div className="p-1.5 bg-gradient-to-br from-slate-500/10 to-slate-700/10 rounded-lg">
                  <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                Account Actions
              </CardTitle>
              <CardDescription className="text-xs">Manage account and data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-between hover:bg-muted/50 transition-all duration-200 group"
                size="sm"
                onClick={exportCsv}
              >
                <span className="flex items-center gap-2">
                  <Download className="h-3.5 w-3.5" />
                  Export Data
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">→</div>
              </Button>
              
              <Separator className="my-2" />
              
              <Button 
                variant="outline" 
                className="w-full justify-between text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-700 dark:hover:text-orange-300 transition-all duration-200 group border-orange-200 dark:border-orange-900"
                size="sm"
                onClick={handleSignOut}
              >
                <span className="flex items-center gap-2">
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">→</div>
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between text-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group border-destructive/30"
                    size="sm"
                  >
                    <span className="flex items-center gap-2">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Account
                    </span>
                    <AlertCircle className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                      <div className="p-2 bg-destructive/10 rounded-lg">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      Confirm Account Deletion
                    </DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all associated data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive font-medium">⚠️ Warning: This is permanent!</p>
                      <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                        <li>All your profile data will be deleted</li>
                        <li>Your orders and history will be removed</li>
                        <li>This action cannot be reversed</li>
                      </ul>
                    </div>
                    <div>
                      <Label htmlFor="confirm-email" className="text-sm">
                        To confirm, type your email address:
                      </Label>
                      <Input 
                        id="confirm-email"
                        placeholder="your@email.com" 
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline">Cancel</Button>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Permanently Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

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
  Info
} from "lucide-react";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("@/components/shared/Map"), { ssr: false });
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [lat, setLat] = useState<number>(0);
  const [lng, setLng] = useState<number>(0);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [timeZone, setTimeZone] = useState("UTC+1");
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("English");

  useEffect(() => {
    // hydrate from localStorage
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
        setCurrency(s.currency || "USD");
        setLanguage(s.language || "English");
        if (s.lat) setLat(s.lat);
        if (s.lng) setLng(s.lng);
        if (s.avatar) setAvatar(s.avatar);
      } catch (e) {
        // ignore
      }
    } else {
      // default location
      setLat(6.5244);
      setLng(3.3792);
    }
  }, []);

  const save = () => {
    const payload = { 
      shopName, 
      name, 
      email, 
      phone, 
      bio,
      website,
      darkMode, 
      notifications, 
      emailNotifications,
      smsNotifications,
      lat, 
      lng,
      avatar,
      timeZone,
      currency,
      language
    };
    if (typeof window !== "undefined") {
      window.localStorage.setItem("uvani_settings", JSON.stringify(payload));
      toast({ title: "Settings saved", description: "Your settings were saved successfully." });
    }
  };

  const reset = () => {
    setShopName("");
    setName("");
    setPhone("");
    setEmail("");
    setBio("");
    setWebsite("");
    setDarkMode(false);
    setNotifications(true);
    setEmailNotifications(true);
    setSmsNotifications(false);
    setLat(6.5244);
    setLng(3.3792);
    setAvatar(null);
    setTimeZone("UTC+1");
    setCurrency("USD");
    setLanguage("English");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("uvani_settings");
      toast({ title: "Settings reset", description: "Settings were reset to defaults." });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl md:text-3xl flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-primary" />
            Account Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences and profile information</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset} className="gap-2">
            <Upload className="h-4 w-4" />
            Reset
          </Button>
          <Button onClick={save} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal and business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    {avatar ? (
                      <AvatarImage src={avatar} alt="Profile" />
                    ) : (
                      <AvatarFallback className="text-2xl">
                        {name ? name.charAt(0) : "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <label className="absolute bottom-0 right-0 bg-primary rounded-full p-1.5 cursor-pointer shadow-md">
                    <Camera className="h-4 w-4 text-primary-foreground" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="shop">Shop Name</Label>
                    <div className="relative">
                      <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="shop" 
                        value={shopName} 
                        onChange={(e) => setShopName(e.target.value)} 
                        className="pl-10"
                        placeholder="Enter shop name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="pl-10"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="pl-10"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        className="pl-10"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="website" 
                        value={website} 
                        onChange={(e) => setWebsite(e.target.value)} 
                        className="pl-10"
                        placeholder="https://yourshop.com"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)} 
                      placeholder="Tell us about your business..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Preferences
              </CardTitle>
              <CardDescription>Customize your application experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Appearance
                  </h3>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Dark Mode</div>
                      <div className="text-sm text-muted-foreground">Enable dark theme</div>
                    </div>
                    <Switch 
                      checked={darkMode} 
                      onCheckedChange={(v) => setDarkMode(Boolean(v))} 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </h3>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">In-app Notifications</div>
                      <div className="text-sm text-muted-foreground">Show notifications in app</div>
                    </div>
                    <Switch 
                      checked={notifications} 
                      onCheckedChange={(v) => setNotifications(Boolean(v))} 
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive email updates</div>
                    </div>
                    <Switch 
                      checked={emailNotifications} 
                      onCheckedChange={(v) => setEmailNotifications(Boolean(v))} 
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">SMS Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive text messages</div>
                    </div>
                    <Switch 
                      checked={smsNotifications} 
                      onCheckedChange={(v) => setSmsNotifications(Boolean(v))} 
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="timezone">Time Zone</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <select 
                      id="timezone"
                      value={timeZone}
                      onChange={(e) => setTimeZone(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="UTC-12">(UTC-12:00) International Date Line West</option>
                      <option value="UTC-8">(UTC-08:00) Pacific Time</option>
                      <option value="UTC-5">(UTC-05:00) Eastern Time</option>
                      <option value="UTC+1">(UTC+01:00) Central European Time</option>
                      <option value="UTC+5.5">(UTC+05:30) India Standard Time</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <select 
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="NGN">NGN - Nigerian Naira</option>
                      <option value="INR">INR - Indian Rupee</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="language">Language</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <select 
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Arabic">Arabic</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Location Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Business Location
              </CardTitle>
              <CardDescription>Set your default store location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Latitude</Label>
                  <Input 
                    value={lat} 
                    onChange={(e) => setLat(Number(e.target.value))} 
                    placeholder="6.5244"
                  />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input 
                    value={lng} 
                    onChange={(e) => setLng(Number(e.target.value))} 
                    placeholder="3.3792"
                  />
                </div>
              </div>
              <div className="rounded-md overflow-hidden border">
                <Map lat={lat} lng={lng} location={`Selected: ${lat.toFixed(4)}, ${lng.toFixed(4)}`} />
              </div>
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { setLat(6.5244); setLng(3.3792); }}
                  className="gap-1"
                >
                  Lagos Default
                </Button>
                <Button size="sm" onClick={save} className="gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Save Location
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security
              </CardTitle>
              <CardDescription>Manage account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Lock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Change Password</div>
                    <div className="text-sm text-muted-foreground">Update your password</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Key className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-muted-foreground">Add extra security</div>
                  </div>
                </div>
                <Switch />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Active Sessions</div>
                    <div className="text-sm text-muted-foreground">Manage device access</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Account Management
              </CardTitle>
              <CardDescription>Danger zone and account actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3">
                <Button variant="outline" className="justify-between">
                  Export Data
                  <Download className="h-4 w-4" />
                </Button>
                
                <Separator className="my-2" />
                
                <Button variant="outline" className="text-destructive justify-between">
                  Sign Out
                  <LogOut className="h-4 w-4" />
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="text-destructive justify-between">
                      Delete Account
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        Confirm Account Deletion
                      </DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove all associated data.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm mb-4">To confirm, type your email address:</p>
                      <Input placeholder="your@email.com" />
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button variant="outline">Cancel</Button>
                      <Button variant="destructive">Permanently Delete</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Plan Card removed per request */}
        </div>
      </div>
    </main>
  );
}
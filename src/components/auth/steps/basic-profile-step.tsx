"use client";

import { useState, useEffect } from "react";
// Minimal country code/flag list for demo; expand as needed
const COUNTRY_CODES = [
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+1', name: 'USA', flag: '🇺🇸' },
  { code: '+44', name: 'UK', flag: '🇬🇧' },
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+971', name: 'UAE', flag: '🇦🇪' },
];
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface Props {
  data: any;
  onChange: (patch: any) => void;
}

export function BasicProfileStep({ data, onChange }: Props) {
  const [logoName, setLogoName] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState(data.countryCode || '+91');

  // Ensure parent form always has a countryCode
  useEffect(() => {
    if (!data.countryCode) {
      setCountryCode('+91');
      onChange({ countryCode: '+91' });
    }
  }, []);

  // OTP verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSendOtp = async () => {
    setOtpError(null);
    // Validation: only allow numbers, correct length for country
    const mobile = (data.mobile || '').replace(/\D/g, '');
    let valid = true;
    let errorMsg = '';
    if (!mobile) {
      valid = false;
      errorMsg = 'Mobile number is required';
    } else if (countryCode === '+91' && mobile.length !== 10) {
      valid = false;
      errorMsg = 'Indian mobile number must be 10 digits';
    } else if (['+1', '+44', '+61', '+971'].includes(countryCode) && mobile.length < 7) {
      valid = false;
      errorMsg = 'Please enter a valid mobile number';
    }
    if (!valid) {
      setOtpError(errorMsg);
      return;
    }
    setSending(true);
    setOtpSuccess(false);
    try {
      // Always send full international number
      const fullPhone = `${countryCode}${mobile}`;
      const res = await fetch("/api/auth/send-sms-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone })
      });
      const result = await res.json();
      if (result.ok) {
        setOtpSent(true);
      } else {
        setOtpError(result.error || "Failed to send OTP");
      }
    } catch (err) {
      setOtpError("Failed to send OTP");
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    setVerifying(true);
    setOtpError(null);
    setOtpSuccess(false);
    try {
      const fullPhone = `${countryCode}${data.mobile.replace(/^0+/, '')}`;
      const res = await fetch("/api/auth/send-sms-otp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, otp })
      });
      const result = await res.json();
      if (result.ok) {
        setOtpSuccess(true);
        setOtpError(null);
        onChange({ otpVerified: true });
      } else {
        setOtpError(result.error || "Invalid OTP");
        onChange({ otpVerified: false });
      }
    } catch (err) {
      setOtpError("Failed to verify OTP");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={data.fullName || ""}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="e.g., Rani Sharma"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shopName">Shop Name</Label>
          <Input
            id="shopName"
            value={data.shopName || ""}
            onChange={(e) => onChange({ shopName: e.target.value })}
            placeholder="e.g., The Perfect Stitch"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile Number</Label>
          <div className="flex gap-2 items-center">
            <select
              value={countryCode}
              onChange={e => {
                setCountryCode(e.target.value);
                onChange({ countryCode: e.target.value });
              }}
              className="h-10 rounded-md border px-2 bg-white dark:bg-gray-700 text-base"
              style={{ minWidth: 70 }}
              disabled={otpSuccess}
            >
              {COUNTRY_CODES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
            <Input
              id="mobile"
              value={data.mobile || ""}
              onChange={(e) => {
                onChange({ mobile: e.target.value });
                setOtpSent(false);
                setOtpSuccess(false);
                setOtp("");
              }}
              placeholder="9876543210"
              disabled={otpSuccess}
              style={{ maxWidth: 180 }}
            />
            <Button type="button" size="sm" onClick={handleSendOtp} disabled={sending || !data.mobile || otpSuccess}>
              {sending ? "Sending..." : otpSuccess ? "Verified" : "Verify"}
            </Button>
          </div>
          {otpSent && !otpSuccess && (
            <div className="mt-2 flex gap-2 items-center">
              <Input
                id="otp"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-32"
                maxLength={6}
                disabled={verifying}
              />
              <Button type="button" size="sm" onClick={handleVerifyOtp} disabled={verifying || otp.length !== 6}>
                {verifying ? "Verifying..." : "Submit OTP"}
              </Button>
            </div>
          )}
          {otpError && <div className="text-red-600 text-xs mt-1">{otpError}</div>}
          {otpSuccess && <div className="text-green-600 text-xs mt-1">Mobile verified!</div>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            value={data.email || ""}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="you@business.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Profile Picture / Logo</Label>
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="logo-upload"
            className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span>
              </p>
              {logoName && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{logoName}</p>
              )}
            </div>
            <input
              id="logo-upload"
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setLogoName(file.name);
                  onChange({ logoFile: file });
                }
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

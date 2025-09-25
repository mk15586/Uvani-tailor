"use client";

import { useState } from "react";
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
          <Input
            id="mobile"
            value={data.mobile || ""}
            onChange={(e) => onChange({ mobile: e.target.value })}
            placeholder="e.g., +919876543210"
          />
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

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export function BusinessProfileStep() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="shopName">Shop Name</Label>
          <Input id="shopName" placeholder="e.g., The Perfect Stitch" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactInfo">Contact Info</Label>
          <Input id="contactInfo" placeholder="Phone or Email" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" placeholder="123 Main St, Anytown, USA" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="googleMap">Google Map Location (URL)</Label>
        <Input id="googleMap" placeholder="https://maps.app.goo.gl/..." />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Business Logo</Label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="logo-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span>
                </p>
              </div>
              <input id="logo-upload" type="file" className="hidden" />
            </label>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Shop Images</Label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="shop-images-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span>
                </p>
              </div>
              <input id="shop-images-upload" type="file" className="hidden" multiple />
            </label>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="workingHours">Working Hours</Label>
        <Input id="workingHours" placeholder="e.g., Mon-Fri: 9am-5pm" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="businessType">Business Type Description</Label>
        <Textarea
          id="businessType"
          placeholder="Describe your business, e.g., 'Specializing in custom suits and formal wear.'"
        />
      </div>
    </div>
  );
}

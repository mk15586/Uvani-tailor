"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface Props {
  data: any;
  onChange: (patch: any) => void;
}

export function BankDetailsStep({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="accountHolder">Account Holder Name</Label>
          <Input
            id="accountHolder"
            value={data.accountHolder || ""}
            onChange={(e) => onChange({ accountHolder: e.target.value })}
            placeholder="As per bank records"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bankName">Bank Name</Label>
          <Input
            id="bankName"
            value={data.bankName || ""}
            onChange={(e) => onChange({ bankName: e.target.value })}
            placeholder="e.g., State Bank"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="branch">Branch Name (optional)</Label>
          <Input
            id="branch"
            value={data.branch || ""}
            onChange={(e) => onChange({ branch: e.target.value })}
            placeholder="Branch"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountNumber">Account Number</Label>
          <Input
            id="accountNumber"
            value={data.accountNumber || ""}
            onChange={(e) => onChange({ accountNumber: e.target.value })}
            placeholder="XXXXYYYYZZZZ"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="ifsc">IFSC Code</Label>
          <Input
            id="ifsc"
            value={data.ifsc || ""}
            onChange={(e) => onChange({ ifsc: e.target.value })}
            placeholder="e.g., SBIN0001234"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="upi">UPI ID (optional)</Label>
          <Input
            id="upi"
            value={data.upi || ""}
            onChange={(e) => onChange({ upi: e.target.value })}
            placeholder="your@upi"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Cancelled Cheque / Passbook Photo</Label>
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="cheque-upload"
            className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span>
              </p>
            </div>
            <input
              id="cheque-upload"
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onChange({ chequeFile: file });
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

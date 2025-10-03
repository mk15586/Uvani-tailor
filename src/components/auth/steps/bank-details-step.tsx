"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Building2, User, CreditCard, Hash, Smartphone, FileText, Check, X, AlertCircle, Image as ImageIcon } from "lucide-react";

interface Props {
  data: any;
  onChange: (patch: any) => void;
}

// Validation Functions
const validators = {
  accountNumber: (value: string) => {
    if (!value) return { valid: false, error: "Account number is required" };
    if (!/^\d{9,18}$/.test(value)) return { valid: false, error: "Account number must be 9-18 digits" };
    return { valid: true, error: "" };
  },
  ifsc: (value: string) => {
    if (!value) return { valid: false, error: "IFSC code is required" };
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value)) return { valid: false, error: "Invalid IFSC format (e.g., SBIN0125620)" };
    return { valid: true, error: "" };
  },
  upi: (value: string) => {
    if (!value) return { valid: true, error: "" }; // Optional field
    if (!/^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test(value)) return { valid: false, error: "Invalid UPI format (e.g., name@bank)" };
    return { valid: true, error: "" };
  },
  accountHolder: (value: string) => {
    if (!value) return { valid: false, error: "Account holder name is required" };
    if (value.length < 3) return { valid: false, error: "Name must be at least 3 characters" };
    if (!/^[a-zA-Z\s]+$/.test(value)) return { valid: false, error: "Only letters and spaces allowed" };
    return { valid: true, error: "" };
  },
  bankName: (value: string) => {
    if (!value) return { valid: false, error: "Bank name is required" };
    if (value.length < 3) return { valid: false, error: "Bank name must be at least 3 characters" };
    return { valid: true, error: "" };
  },
};

// Enhanced Input Field Component
function ValidatedInput({ id, label, value, onChange, placeholder, icon: Icon, validator, type = "text", inputMode = "text", maxLength, optional = false, uppercase = false }) {
  const [touched, setTouched] = useState(false);
  const validation = touched && value ? validator(value) : { valid: null, error: "" };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2 text-sm sm:text-base">
        {Icon && <Icon size={16} className="text-gray-500 flex-shrink-0" />}
        <span>{label} {optional && <span className="text-xs text-gray-400">(optional)</span>}</span>
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          inputMode={inputMode}
          value={value || ""}
          onChange={(e) => {
            const val = uppercase ? e.target.value.toUpperCase() : e.target.value;
            onChange(val);
          }}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`pr-10 min-h-[44px] sm:min-h-[42px] text-sm sm:text-base transition-all ${
            validation.valid === true ? 'border-green-500 focus:ring-green-500' : 
            validation.valid === false ? 'border-red-500 focus:ring-red-500' : 
            'focus:ring-2 focus:ring-blue-500'
          }`}
        />
        {validation.valid !== null && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {validation.valid ? (
              <Check size={18} className="text-green-500" />
            ) : (
              <AlertCircle size={18} className="text-red-500" />
            )}
          </div>
        )}
      </div>
      {validation.error && (
        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
          <X size={12} />
          {validation.error}
        </p>
      )}
      {validation.valid && (
        <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
          <Check size={12} />
          Looks good!
        </p>
      )}
    </div>
  );
}

export function BankDetailsStep({ data, onChange }: Props) {
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert("Please upload an image (JPG, PNG, WebP) or PDF file");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      onChange({ chequeFile: file });

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview('pdf');
      }
    }
  };

  const removeFile = () => {
    onChange({ chequeFile: null });
    setFilePreview(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      {/* Header */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-1">Bank Account Details</h3>
        <p className="text-xs sm:text-sm text-gray-500">Enter your bank details for receiving payments</p>
      </div>

      {/* Account Holder & Bank Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <ValidatedInput
          id="accountHolder"
          label="Account Holder Name"
          value={data.accountHolder}
          onChange={(val) => onChange({ accountHolder: val })}
          placeholder="As per bank records"
          icon={User}
          validator={validators.accountHolder}
        />
        <ValidatedInput
          id="bankName"
          label="Bank Name"
          value={data.bankName}
          onChange={(val) => onChange({ bankName: val })}
          placeholder="e.g., State Bank of India"
          icon={Building2}
          validator={validators.bankName}
        />
      </div>

      {/* Branch & Account Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2">
          <Label htmlFor="branch" className="flex items-center gap-2 text-sm sm:text-base">
            <Building2 size={16} className="text-gray-500 flex-shrink-0" />
            <span>Branch Name <span className="text-xs text-gray-400">(optional)</span></span>
          </Label>
          <Input
            id="branch"
            value={data.branch || ""}
            onChange={(e) => onChange({ branch: e.target.value })}
            placeholder="Branch location"
            className="min-h-[44px] sm:min-h-[42px] text-sm sm:text-base focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <ValidatedInput
          id="accountNumber"
          label="Account Number"
          value={data.accountNumber}
          onChange={(val) => onChange({ accountNumber: val })}
          placeholder="Enter 9-18 digit account number"
          icon={CreditCard}
          validator={validators.accountNumber}
          inputMode="numeric"
          maxLength={18}
        />
      </div>

      {/* IFSC Code & UPI ID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <ValidatedInput
          id="ifsc"
          label="IFSC Code"
          value={data.ifsc}
          onChange={(val) => onChange({ ifsc: val })}
          placeholder="e.g., SBIN0125620"
          icon={Hash}
          validator={validators.ifsc}
          maxLength={11}
          uppercase
        />

        <ValidatedInput
          id="upi"
          label="UPI ID"
          value={data.upi}
          onChange={(val) => onChange({ upi: val })}
          placeholder="yourname@bank"
          icon={Smartphone}
          validator={validators.upi}
          optional
        />
      </div>

      {/* Cancelled Cheque Upload */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm sm:text-base">
          <FileText size={16} className="text-gray-500 flex-shrink-0" />
          Cancelled Cheque / Passbook Photo
          <span className="text-xs text-gray-400">(JPG, PNG, PDF - Max 5MB)</span>
        </Label>

        {!filePreview ? (
          <label
            htmlFor="cheque-upload"
            className="flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
          >
            <div className="flex flex-col items-center justify-center py-6 px-4">
              <Upload className="w-10 h-10 sm:w-12 sm:h-12 mb-3 text-gray-400" />
              <p className="mb-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium text-center">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Cancelled cheque or bank passbook first page
              </p>
            </div>
            <input
              id="cheque-upload"
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
              onChange={handleFileUpload}
            />
          </label>
        ) : (
          <div className="relative border-2 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
            {filePreview === 'pdf' ? (
              <div className="flex items-center gap-4 p-4">
                <FileText size={48} className="text-red-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{data.chequeFile?.name}</p>
                  <p className="text-xs text-gray-500">{(data.chequeFile?.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <img
                  src={filePreview}
                  alt="Cheque preview"
                  className="w-full h-48 object-contain rounded-lg bg-white"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-white opacity-0 group-hover:opacity-50 transition-opacity" />
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={removeFile}
              className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
              aria-label="Remove file"
            >
              <X size={16} />
            </button>
            <div className="mt-3 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <Check size={14} />
              <span>File uploaded successfully</span>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p className="font-medium">Important Information:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Account holder name must match your registered name</li>
              <li>IFSC code format: First 4 letters (bank), 5th character is '0', last 6 alphanumeric (branch)</li>
              <li>Upload a clear image of cancelled cheque or passbook first page</li>
              <li>All payment settlements will be made to this account</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

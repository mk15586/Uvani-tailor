"use client";

import { motion } from "framer-motion";
import React from "react";

interface Props {
  show: boolean;
  onClose: () => void;
  emailOrContact: string;
  otpInput: string;
  setOtpInput: (s: string) => void;
  otpError: string | null;
  onVerify: () => void;
  onResend: () => void;
  resendCooldown: number;
}

export function OtpModal({
  show,
  onClose,
  emailOrContact,
  otpInput,
  setOtpInput,
  otpError,
  onVerify,
  onResend,
  resendCooldown,
}: Props) {
  if (!show) return null;

  const handleDigitChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const arr = otpInput.split("");
    // ensure length 6
    while (arr.length < 6) arr.push("");
    arr[index] = value;
    const next = arr.join("").slice(0, 6);
    setOtpInput(next);
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement | null;
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const target = e.target as HTMLInputElement;
    if (e.key === "Backspace" && !target.value && index > 0) {
      const prev = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement | null;
      prev?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative z-20 w-full max-w-md"
      >
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl"
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </motion.div>
            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 border-2 border-blue-400/50 rounded-2xl" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="pt-12 pb-6 px-6 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Verify Your Identity</h2>
            <p className="text-gray-300 text-sm">We sent a 6-digit verification code to <span className="font-semibold text-white ml-1">{emailOrContact}</span></p>
          </div>

          <div className="px-6 pb-6">
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <motion.div key={index} whileFocus={{ scale: 1.05 }} whileHover={{ scale: 1.02 }} className="relative">
                  <input
                    type="text"
                    maxLength={1}
                    value={otpInput[index] || ""}
                    onChange={(e) => handleDigitChange(e.target.value, index)}
                    data-index={index}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-12 text-center text-xl font-bold bg-white/5 border border-white/20 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </motion.div>
              ))}
            </div>

            {otpError && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 text-red-400 text-sm mb-4">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {otpError}
              </motion.div>
            )}

            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onVerify} className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-200">Verify Code</motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose} className="px-4 py-3 border border-white/20 text-white rounded-lg font-medium hover:bg-white/5 transition-all duration-200">Cancel</motion.button>
            </div>

            <div className="text-center mt-4">
              <motion.button onClick={onResend} disabled={resendCooldown > 0} whileHover={resendCooldown === 0 ? { scale: 1.05 } : {}} className={`text-sm ${resendCooldown > 0 ? 'text-gray-500 cursor-not-allowed' : 'text-blue-400 hover:text-blue-300'}`}>
                {resendCooldown > 0 ? (
                  <span className="flex items-center justify-center gap-1">
                    <motion.svg animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></motion.svg>
                    Resend in {resendCooldown}s
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>Resend Code</span>
                )}
              </motion.button>
            </div>
          </div>

          <div className="bg-black/20 border-t border-white/10 px-6 py-3">
            <p className="text-xs text-gray-400 text-center">Demo: Check browser console for OTP code</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default OtpModal;

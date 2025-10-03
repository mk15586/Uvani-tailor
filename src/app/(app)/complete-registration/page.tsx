"use client";

import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from "next/navigation";
import { BasicProfileStep } from "@/components/auth/steps/basic-profile-step";
import { ProfessionalDetailsStep } from "@/components/auth/steps/professional-details-step";
import { BankDetailsStep } from "@/components/auth/steps/bank-details-step";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const steps = [
  { id: 1, name: "Personal", component: BasicProfileStep, icon: "👤" },
  { id: 2, name: "Professional", component: ProfessionalDetailsStep, icon: "💼" },
  { id: 3, name: "Bank Details", component: BankDetailsStep, icon: "🏦" },
];

export default function CompleteRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<any>({});
  const [direction, setDirection] = useState(1);
  const router = useRouter();
  // Prefill email and password from localStorage
  const [signupEmail] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('uvani_signup_email') || '' : ''));
  const [signupPassword] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('uvani_signup_password') || '' : ''));

  const patch = (patchObj: any) => setForm((prev: any) => ({ ...prev, ...patchObj }));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const uploadFile = async (file: File, pathPrefix: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${pathPrefix}-${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from('tailor-assets').upload(fileName, file, { upsert: true });
    if (error) throw error;
    // Get public URL
    const { data: urlData } = supabase.storage.from('tailor-assets').getPublicUrl(fileName);
    return urlData?.publicUrl || null;
  };

  // Validation helper
  const validateStep = () => {
    // Step 1: Personal
    if (currentStep === 1) {
      if (!form.fullName || form.fullName.trim().length < 2) return 'Full name is required.';
      if (!form.shopName || form.shopName.trim().length < 2) return 'Shop name is required.';
      if (!form.countryCode || !form.mobile) return 'Mobile number and country code are required.';
      const mobile = (form.mobile || '').replace(/\D/g, '');
      if (form.countryCode === '+91' && mobile.length !== 10) return 'Indian mobile number must be 10 digits.';
      if (!form.otpVerified) return 'Please verify your mobile number.';
      if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) return 'Valid email is required.';
    }
    // Step 2: Professional
    if (currentStep === 2) {
      if (!form.experience || isNaN(Number(form.experience))) return 'Experience (years) is required.';
      if (!form.specialization) return 'Specialization is required.';
      if (!form.skills) return 'Skills are required.';
      if (!form.services) return 'Services offered are required.';
      if (!form.address) return 'Shop address is required.';
      if (!form.pincode || !/^\d{6}$/.test(form.pincode)) return 'Valid 6-digit pincode is required.';
      if (!form.workingHours) return 'Working hours are required.';
    }
    // Step 3: Bank
    if (currentStep === 3) {
      if (!form.accountHolder) return 'Account holder name is required.';
      if (!form.bankName) return 'Bank name is required.';
      if (!form.branch) return 'Branch name is required.';
      if (!form.accountNumber || !/^\d{9,18}$/.test(form.accountNumber)) return 'Valid account number is required.';
      if (!form.ifsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc)) return 'Valid IFSC code is required.';
      if (!form.upi) return 'UPI ID is required.';
    }
    return null;
  };

  const handleNext = async () => {
    setError(null);
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (currentStep === steps.length) {
      setSubmitting(true);
      try {
        // Prepare data mapping
        const {
          fullName, shopName, mobile, logoFile, countryCode,
          experience, specialization, skills, services, address, pincode, workingHours,
          accountHolder, bankName, branch, accountNumber, ifsc, upi, chequeFile
        } = form;
        // Use email and password from localStorage
        const email = signupEmail;
        const password = signupPassword;

        let profile_picture = null;
        let cancelled_photo = null;
        if (logoFile) {
          profile_picture = await uploadFile(logoFile, 'profile');
        }
        if (chequeFile) {
          cancelled_photo = await uploadFile(chequeFile, 'cheque');
        }

        // Insert into Supabase (do NOT include id)
        const insertObj: any = {
          name: fullName,
          business_name: shopName,
          phone_number: countryCode + (mobile || '').replace(/\D/g, ''),
          email,
          profile_picture,
          account_holder_name: accountHolder,
          bank_name: bankName,
          branch_name: branch,
          account_number: accountNumber,
          ifsc,
          upi_id: upi,
          cancelled_photo,
          experience_years: experience ? parseInt(experience) : null,
          specialties: specialization ? [specialization] : null,
          skills: skills ? skills.split(',').map((s: string) => s.trim()) : null,
          services_offered: services ? services.split(',').map((s: string) => s.trim()) : null,
          shop_address: address,
          pincode,
          working_hours: workingHours,
          password,
        };
        // Remove id if present in form (defensive)
        if ('id' in insertObj) delete insertObj.id;
        const { error: insertError } = await supabase.from('tailors').insert(insertObj);
        if (insertError) throw insertError;
        // Remove email and password from localStorage after registration
        if (typeof window !== 'undefined') {
          localStorage.removeItem('uvani_signup_email');
          localStorage.removeItem('uvani_signup_password');
        }
        setSuccess(true);
        setTimeout(() => router.push("/dashboard"), 1200);
      } catch (err: any) {
        setError(err.message || 'Failed to register.');
      } finally {
        setSubmitting(false);
      }
    } else {
      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Prefill email in form if possible
  useEffect(() => {
    if (signupEmail && !form.email) {
      setForm((prev: any) => ({ ...prev, email: signupEmail }));
    }
  }, [signupEmail]);
  const ActiveStepComponent = steps.find((step) => step.id === currentStep)?.component;
  const progress = (currentStep / steps.length) * 100;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95,
    }),
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
  <div className="h-screen flex items-center justify-center p-2 sm:p-3 md:p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
      {/* Animated Background Circles */}
      <div className="absolute top-20 left-10 w-48 sm:w-64 h-48 sm:h-64 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" style={{ backgroundColor: '#6a1f6f' }}></div>
      <div className="absolute top-40 right-10 w-48 sm:w-64 h-48 sm:h-64 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" style={{ backgroundColor: '#5a1a5e' }}></div>
      <div className="absolute -bottom-20 left-1/2 w-48 sm:w-64 h-48 sm:h-64 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" style={{ backgroundColor: '#4a154b' }}></div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-6xl h-[95vh] relative z-10 flex flex-col"
      >
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-purple-200/20 overflow-hidden flex flex-col h-full">
          {/* Compact Header Section */}
          <div className="p-4 sm:p-6 relative overflow-hidden" style={{ background: 'linear-gradient(to right, #4a154b, #5a1a5e, #4a154b)' }}>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAtMjBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTIwIDM0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wLTIwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
            
            <motion.div variants={itemVariants} className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-xl border border-purple-300/30 p-2"
                  >
                    <Image 
                      src="/UVANI logo.png" 
                      alt="UVANI Logo" 
                      width={80} 
                      height={80}
                      className="w-full h-full object-contain filter brightness-0 invert"
                    />
                  </motion.div>
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                      Complete Your Profile
                    </h1>
                    <p className="text-purple-200 text-xs sm:text-sm">Step {currentStep} of {steps.length}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{Math.round(progress)}%</div>
                  <div className="text-purple-200 text-xs">Complete</div>
                </div>
              </div>

              {/* Compact Progress Bar */}
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="h-full shadow-lg"
                  style={{ background: 'linear-gradient(to right, #c4b5fd, #e9d5ff, #f3e8ff)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          </div>

          {/* Content Area - Takes remaining space */}
          <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4 md:p-6">
            {/* Compact Stepper */}
            <motion.div variants={itemVariants} className="mb-4">
              <div className="flex items-center justify-between relative">
                <div className="hidden sm:block absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10">
                  <motion.div
                    className="h-full"
                    style={{ background: 'linear-gradient(to right, #4a154b, #5a1a5e, #6a1f6f)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>

                {steps.map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center flex-1 relative z-10">
                    <motion.div
                      initial={false}
                      animate={{
                        scale: currentStep === step.id ? 1.05 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-sm sm:text-base shadow-md mb-1.5 transition-all duration-300 ${
                        currentStep >= step.id 
                          ? "text-white" 
                          : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                      }`}
                      style={currentStep >= step.id ? { 
                        background: 'linear-gradient(to bottom right, #4a154b, #5a1a5e)',
                        boxShadow: '0 4px 12px rgba(74, 21, 75, 0.4)'
                      } : {}}
                    >
                      {currentStep > step.id ? "✓" : step.icon}
                    </motion.div>
                    <div className="text-center">
                      <div className={`font-semibold text-xs transition-colors ${
                        currentStep >= step.id ? "" : "text-gray-500 dark:text-gray-400"
                      }`}
                      style={currentStep >= step.id ? { color: '#4a154b' } : {}}
                      >
                        {step.name}
                      </div>
                    </div>

                    {index < steps.length - 1 && (
                      <div className="sm:hidden absolute top-4 left-1/2 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-10">
                        {currentStep > step.id && (
                          <div className="h-full" style={{ background: '#4a154b' }} />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Step Content - Scrollable if needed */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="flex-1 overflow-y-auto"
              >
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl p-3 sm:p-4 md:p-6 border shadow-sm h-full" style={{ borderColor: 'rgba(74, 21, 75, 0.2)' }}>
                  {ActiveStepComponent && <ActiveStepComponent data={form} onChange={patch} />}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Compact Navigation Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex justify-between items-center mt-3 sm:mt-4 gap-2 sm:gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 hover:border-[#4a154b]"
                onMouseEnter={(e) => e.currentTarget.style.color = '#4a154b'}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                <span>←</span>
                <span className="hidden sm:inline">Back</span>
              </motion.button>

              <div className="flex items-center gap-2">
                {currentStep < steps.length && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep(steps.length)}
                    className="px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-400 transition-colors duration-300"
                    onMouseEnter={(e) => e.currentTarget.style.color = '#4a154b'}
                    onMouseLeave={(e) => e.currentTarget.style.color = ''}
                  >
                    Skip
                  </motion.button>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleNext}
                  disabled={submitting}
                  className="px-5 sm:px-6 py-2 rounded-lg text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ 
                    background: 'linear-gradient(to right, #4a154b, #5a1a5e)',
                    boxShadow: '0 4px 12px rgba(74, 21, 75, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #3a1040, #4a154b)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(74, 21, 75, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #4a154b, #5a1a5e)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(74, 21, 75, 0.3)';
                  }}
                >
                  <span>{submitting ? 'Saving...' : (currentStep === steps.length ? 'Finish' : 'Next')}</span>
                  <span>{currentStep === steps.length ? '🎉' : '→'}</span>
                </motion.button>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            {success && <div className="text-green-600 text-sm mt-2">Registration complete! Redirecting...</div>}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
  
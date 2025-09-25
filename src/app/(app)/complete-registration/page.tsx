"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BasicProfileStep } from "@/components/auth/steps/basic-profile-step";
import { ProfessionalDetailsStep } from "@/components/auth/steps/professional-details-step";
import { BankDetailsStep } from "@/components/auth/steps/bank-details-step";

const steps = [
  { id: 1, name: "Personal Information", component: BasicProfileStep },
  { id: 2, name: "Professional Details", component: ProfessionalDetailsStep },
  { id: 3, name: "Bank Details", component: BankDetailsStep },
];

export default function CompleteRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<any>({});
  const router = useRouter();

  const patch = (patchObj: any) => setForm((prev: any) => ({ ...prev, ...patchObj }));

  const handleNext = async () => {
    if (currentStep === steps.length) {
      // static behavior: no validation, no backend — immediately redirect to dashboard
      router.push("/dashboard");
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const ActiveStepComponent = steps.find((step) => step.id === currentStep)?.component;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-extrabold text-center mb-2 text-blue-600">Complete Your Profile</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">A few details to get your shop ready on the platform.</p>

        {/* Stepper */}
        <div className="flex items-center gap-4 mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex-1">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${currentStep >= step.id ? "bg-blue-600" : "bg-gray-300"}`}>
                  {step.id}
                </div>
                <div className="ml-4">
                  <div className={`font-semibold ${currentStep >= step.id ? "text-blue-600" : "text-gray-500"}`}>{step.name}</div>
                </div>
              </div>
              {index < steps.length - 1 && <div className="h-1 bg-gradient-to-r from-blue-200 to-transparent mt-3 rounded" />}
            </div>
          ))}
        </div>

        {ActiveStepComponent && <ActiveStepComponent data={form} onChange={patch} />}

        <div className="flex justify-between items-center mt-8">
          <button onClick={handleBack} disabled={currentStep === 1} className="px-6 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border hover:bg-gray-50 disabled:opacity-50">Back</button>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard" )} className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 bg-white border hover:bg-gray-50">Skip</button>
            <button onClick={handleNext} className="px-6 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">{currentStep === steps.length ? 'Finish' : 'Next'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BusinessProfileStep } from "@/components/auth/steps/business-profile-step";
import { ServicesStep } from "@/components/auth/steps/services-step";
// Import other steps here as they are created

const steps = [
  { id: 1, name: "Business Profile", component: BusinessProfileStep },
  { id: 2, name: "Services & Pricing", component: ServicesStep },
  // { id: 3, name: "Measurement Management", component: MeasurementsStep },
  // { id: 4, name: "Inventory & Catalog", component: InventoryStep },
];

export default function CompleteRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const handleNext = () => {
    if (currentStep === steps.length) {
      router.push("/dashboard");
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const ActiveStepComponent = steps.find(
    (step) => step.id === currentStep
  )?.component;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-2">
          Complete Your Profile
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Follow the steps below to set up your business profile.
        </p>

        {/* Stepper */}
        <div className="flex justify-between items-center mb-8">
          {steps.map((step, index) => (
            <>
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                    currentStep >= step.id
                      ? "bg-blue-600"
                      : "bg-gray-400 dark:bg-gray-600"
                  }`}
                >
                  {step.id}
                </div>
                <div className="ml-4">
                  <div
                    className={`font-semibold ${
                      currentStep >= step.id
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.name}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700 mx-4"></div>
              )}
            </>
          ))}
        </div>

        {ActiveStepComponent && <ActiveStepComponent />}

        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-2 border rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {currentStep === steps.length ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

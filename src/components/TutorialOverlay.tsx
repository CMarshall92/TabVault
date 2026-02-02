"use client";

import { Search, MousePointerClick, FileText } from "lucide-react";
import { useState } from "react";

interface TutorialOverlayProps {
  onComplete: () => void;
}

export default function TutorialOverlay({ onComplete }: TutorialOverlayProps) {
  const [step, setStep] = useState(1);

  const steps = [
    {
      title: "Welcome to TabVault",
      description:
        "Organize your research into dedicated spaces. Let's get you started.",
      icon: <Search className="w-12 h-12 text-blue-400" />,
    },
    {
      title: "1. Create & Activate a Space",
      description:
        "First, create a space below. IMPORTANT: You must click a space to 'Activate' it before you can save anything.",
      icon: <MousePointerClick className="w-12 h-12 text-green-400" />,
    },
    {
      title: "2. Save Snippets",
      description:
        "Once active, simply highlight text on any webpage. A 'Save to Space' button will appear automatically.",
      icon: <FileText className="w-12 h-12 text-yellow-400" />,
    },
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-200 dark:border-zinc-700 transition-colors">
        <div className="p-6 text-center space-y-4">
          <div className="flex justify-center">{currentStep.icon}</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {currentStep.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {currentStep.description}
          </p>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-200 dark:border-zinc-700 flex justify-between items-center transition-colors">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${i + 1 === step ? "bg-blue-600 dark:bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (step < steps.length) {
                setStep((s) => s + 1);
              } else {
                onComplete();
              }
            }}
            className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            {step === steps.length ? "Get Started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { RotateCcw } from "lucide-react";

export default function SettingsView() {
  const handleResetTutorial = () => {
    localStorage.removeItem("hasSeenTutorial");
    // Visual feedback could be added here, but the button press is usually enough context for a reset.
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Settings</h1>

      <div className="space-y-4">
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
            Preferences
          </h2>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-gray-900">
                Reset Tutorial
              </div>
              <div className="text-xs text-gray-500">
                Show the welcome guide next time you visit Spaces
              </div>
            </div>
            <button
              onClick={handleResetTutorial}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded text-sm text-gray-700">
          <p>
            <strong>ResearchSpace v1.0.0</strong>
          </p>
          <p className="mt-2">
            Use the Spaces tab to manage and activate research sessions.
          </p>
        </div>
      </div>
    </div>
  );
}

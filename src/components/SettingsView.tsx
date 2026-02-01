"use client";

import { RotateCcw, Moon, Sun, Crown, Heart, ShieldCheck } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useSupporter } from "@/hooks/useSupporter";

export default function SettingsView() {
  const { theme, toggleTheme } = useTheme();
  const { isPro, upgradeToPro } = useSupporter();

  const handleResetTutorial = () => {
    localStorage.removeItem("hasSeenTutorial");
    alert("Tutorial has been reset. It will appear on the Spaces tab.");
  };

  const handleDonate = () => {
    // Determine the payment link based on environment or just use a generic one
    window.open("https://buy.stripe.com/test_placeholder", "_blank");

    // Simulate the upgrade for demonstration
    if (
      confirm(
        "For this demo: clicking OK simulates a successful donation verification.",
      )
    ) {
      upgradeToPro();
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-zinc-900 min-h-screen transition-colors">
      <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Settings
      </h1>

      {/* Supporter Banner */}
      <div
        className={`mb-6 p-4 rounded-xl border flex items-center justify-between shadow-sm transition-all ${
          isPro
            ? "bg-gradient-to-br from-amber-50 to-orange-50 border-orange-200 dark:from-amber-900/10 dark:to-orange-900/10 dark:border-orange-900/50"
            : "bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-full shrink-0 flex items-center justify-center ${
              isPro
                ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                : "bg-gray-100 text-gray-500 dark:bg-zinc-700 dark:text-gray-400"
            }`}
          >
            {isPro ? (
              <Crown size={24} fill="currentColor" className="opacity-20" />
            ) : (
              <Heart size={24} />
            )}
            {isPro && <Crown size={24} className="absolute" strokeWidth={2} />}
          </div>

          <div className="flex flex-col">
            <span
              className={`text-sm font-bold tracking-tight ${
                isPro
                  ? "text-orange-700 dark:text-orange-400"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {isPro ? "PRO SUPPORTER" : "STANDARD USER"}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 leading-snug max-w-[180px]">
              {isPro
                ? "Thank you for your generous support!"
                : "Support development to unlock Pro status."}
            </span>
          </div>
        </div>

        {!isPro && (
          <button
            onClick={handleDonate}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Heart size={14} fill="currentColor" className="opacity-50" />
            Donate
          </button>
        )}

        {isPro && (
          <div className="shrink-0 text-orange-400 dark:text-orange-500/50">
            <ShieldCheck size={28} />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-sm transition-colors">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
            Appearance
          </h2>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Dark Mode
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Reduce eye strain
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                theme === "dark" ? "bg-blue-600" : "bg-gray-200"
              }`}
              role="switch"
              aria-checked={theme === "dark"}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  theme === "dark" ? "translate-x-5" : "translate-x-0"
                } flex items-center justify-center`}
              >
                {theme === "dark" ? (
                  <Moon size={12} className="text-blue-600" />
                ) : (
                  <Sun size={12} className="text-yellow-500" />
                )}
              </span>
            </button>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-sm transition-colors">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
            Preferences
          </h2>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Reset Tutorial
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Show the welcome guide
              </div>
            </div>
            <button
              onClick={handleResetTutorial}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 rounded-md transition-colors"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-100 dark:bg-zinc-800/50 rounded text-sm text-gray-600 dark:text-gray-400 text-center">
          <p>
            <strong>ResearchSpace v1.0.0</strong>
          </p>
          <p className="mt-1 text-xs">
            Use the Spaces tab to manage and activate research sessions.
          </p>
        </div>
      </div>
    </div>
  );
}

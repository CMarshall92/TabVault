"use client";

import { RotateCcw, Moon, Sun, Heart, ShieldCheck, Mail } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";

export default function SettingsView() {
  const { theme, toggleTheme } = useTheme();

  const [feedbackType, setFeedbackType] = useState<"bug" | "feature">("bug");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isMonthly, setIsMonthly] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const handleResetTutorial = () => {
    localStorage.removeItem("hasSeenTutorial");
    alert("Tutorial has been reset. It will appear on the Spaces tab.");
  };

  const handleSendFeedback = () => {
    const subject =
      feedbackType === "bug"
        ? "Bug Report: TabVault"
        : "Feature Request: TabVault";
    const body = encodeURIComponent(feedbackMessage);
    const mailtoLink = `mailto:c.marshall.engineer@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.open(mailtoLink, "_blank");
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-zinc-900 transition-colors">
      <div className="p-4 pb-2 shrink-0">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-4">
        {/* Supporter Banner */}
        <div className="p-4 rounded-xl border bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 shadow-sm transition-all">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg">
                  <Heart size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Like the tool, Support Development
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Help keep TabVault independent and ad-free.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* Toggle */}
              <div className="flex bg-gray-100 dark:bg-zinc-700/50 p-1 rounded-lg self-start">
                <button
                  onClick={() => setIsMonthly(false)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${!isMonthly ? "bg-white dark:bg-zinc-600 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
                >
                  One-time
                </button>
                <button
                  onClick={() => setIsMonthly(true)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${isMonthly ? "bg-white dark:bg-zinc-600 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}
                >
                  Monthly
                </button>
              </div>

              {/* Amounts */}
              <div className="flex flex-wrap gap-2">
                {[10, 25, 50].map((amount) => (
                  <button
                    key={amount}
                    onClick={() =>
                      setSelectedAmount((prev) =>
                        prev === amount ? null : amount,
                      )
                    }
                    className={`flex-1 min-w-[80px] py-2 px-3 border rounded-lg text-sm font-semibold transition-all active:scale-95 ${
                      selectedAmount === amount
                        ? "bg-blue-600 border-blue-600 text-white shadow-md"
                        : "bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-600 text-gray-700 dark:text-gray-200 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                    }`}
                  >
                    £{amount}
                  </button>
                ))}
              </div>

              {/* Confirm Button */}
              {!selectedAmount ? (
                <button
                  onClick={() => {
                    const customLink = isMonthly
                      ? "https://buy.stripe.com/test_dRm8wPaTO817eiBg2w87K07" // Monthly custom
                      : "https://donate.stripe.com/test_14A9AT1je6X33DX9E887K03"; // One-time custom
                    window.open(customLink, "_blank");
                  }}
                  className="w-full py-2.5 rounded-lg text-sm font-bold bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Heart size={16} fill="currentColor" className="opacity-50" />
                  {isMonthly
                    ? "Donate Custom Amount / Month"
                    : "Donate Custom Amount"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    const links = {
                      oneTime: {
                        10: "https://buy.stripe.com/test_28E8wP6DybdjcatcQk87K02",
                        25: "https://buy.stripe.com/test_6oU6oH1je0yF8Yh3fK87K01",
                        50: "https://buy.stripe.com/test_bJe7sL7HCbdj1vPaIc87K00",
                      },
                      monthly: {
                        10: "https://buy.stripe.com/test_dRmaEX9PK4OVeiBeYs87K04",
                        25: "https://buy.stripe.com/test_fZudR97HC5SZeiBdUo87K05",
                        50: "https://buy.stripe.com/test_bJe4gz8LGchna2laIc87K06",
                      },
                    };
                    const type = isMonthly ? "monthly" : "oneTime";
                    // @ts-expect-error key access
                    const url = links[type][selectedAmount];
                    if (url) window.open(url, "_blank");
                  }}
                  className="w-full py-2.5 rounded-lg text-sm font-bold bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {isMonthly
                    ? `Subscribe £${selectedAmount} / Month`
                    : `Donate £${selectedAmount} One-time`}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-sm transition-colors">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
            Appearance
          </h2>

          <div className="space-y-2">
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
        </div>

        <div className="p-4 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-sm transition-colors">
          <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
            Feedback & Support
          </h2>
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setFeedbackType("bug")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                  feedbackType === "bug"
                    ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-700"
                }`}
              >
                Report Bug
              </button>
              <button
                onClick={() => setFeedbackType("feature")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                  feedbackType === "feature"
                    ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-900 dark:text-blue-400"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-400 dark:hover:bg-zinc-700"
                }`}
              >
                Feature Request
              </button>
            </div>

            <textarea
              className="w-full text-xs p-3 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px] resize-none placeholder-gray-400"
              placeholder={
                feedbackType === "bug"
                  ? "Describe the bug you encountered..."
                  : "Describe your feature idea..."
              }
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
            />

            <button
              onClick={handleSendFeedback}
              disabled={!feedbackMessage.trim()}
              className="w-full py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail size={14} />
              Draft Email
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-100 dark:bg-zinc-800/50 rounded text-sm text-gray-600 dark:text-gray-400 text-center">
          <p>
            <strong>TabVault v1.0.0</strong>
          </p>
          <p className="my-2 text-xs">
            Thank you for using TabVault! Your support helps keep this project
            alive.
          </p>
          <span>
            Visit us over at{" "}
            <a
              href="https://www.basecommit.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-xs mt-2 inline-block"
            >
              BaseCommit.co.uk
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

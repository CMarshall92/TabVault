"use client";

import { LayoutGrid, Settings } from "lucide-react";

type BottomNavProps = {
  activeTab: "spaces" | "settings";
  onChange: (tab: "spaces" | "settings") => void;
};

export default function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="w-full border-t border-gray-200 bg-white dark:bg-zinc-900 dark:border-zinc-800 p-2 flex justify-around items-center h-16 safe-area-bottom z-50 transition-colors">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          console.log("Spaces clicked");
          onChange("spaces");
        }}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 cursor-pointer transition-colors ${
          activeTab === "spaces"
            ? "text-blue-600 dark:text-blue-500"
            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        <LayoutGrid size={24} className="pointer-events-none" />
        <span className="text-xs font-medium pointer-events-none">Spaces</span>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          console.log("Settings clicked");
          onChange("settings");
        }}
        className={`flex flex-col items-center justify-center w-full h-full space-y-1 cursor-pointer transition-colors ${
          activeTab === "settings"
            ? "text-blue-600 dark:text-blue-500"
            : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
      >
        <Settings size={24} className="pointer-events-none" />
        <span className="text-xs font-medium pointer-events-none">
          Settings
        </span>
      </button>
    </nav>
  );
}

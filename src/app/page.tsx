"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import SpacesList from "@/components/SpacesList";
import SettingsView from "@/components/SettingsView";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"spaces" | "settings">("spaces");

  const handleTabChange = (tab: "spaces" | "settings") => {
    console.log("Switching tab to:", tab);
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-zinc-900">
      <main className="flex-1 overflow-hidden relative">
        {activeTab === "spaces" ? <SpacesList /> : <SettingsView />}
      </main>
      <BottomNav activeTab={activeTab} onChange={handleTabChange} />
    </div>
  );
}

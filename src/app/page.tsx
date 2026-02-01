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
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-y-auto pb-16">
        {activeTab === "spaces" ? <SpacesList /> : <SettingsView />}
      </main>
      <BottomNav activeTab={activeTab} onChange={handleTabChange} />
    </div>
  );
}

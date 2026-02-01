"use client";

import { useSpaces } from "@/hooks/useSpaces";
import {
  Plus,
  Trash2,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle2,
  List,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import TutorialOverlay from "./TutorialOverlay";
import ReferencesView from "./ReferencesView";

export default function SpacesList() {
  const {
    spaces,
    activeSpaceId,
    selectSpace,
    addSpace,
    openSpace,
    deleteSpace,
  } = useSpaces();
  const [newSpaceName, setNewSpaceName] = useState("");
  const [showTutorial, setShowTutorial] = useState(false);
  const [viewingSpaceId, setViewingSpaceId] = useState<string | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem("hasSeenTutorial");
    if (!seen) {
      // eslint-disable-next-line
      setShowTutorial(true);
    }
  }, []);

  const handleTutorialComplete = () => {
    localStorage.setItem("hasSeenTutorial", "true");
    setShowTutorial(false);
  };

  const activeSpaceName = spaces.find((s) => s.id === activeSpaceId)?.name;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSpaceName.trim()) {
      addSpace(newSpaceName);
      setNewSpaceName("");
    }
  };

  if (viewingSpaceId) {
    return (
      <ReferencesView
        spaceId={viewingSpaceId}
        onBack={() => setViewingSpaceId(null)}
      />
    );
  }

  return (
    <div className="p-4 space-y-4 relative min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors">
      {showTutorial && <TutorialOverlay onComplete={handleTutorialComplete} />}

      <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Research Spaces
      </h1>

      {/* Active Space Indicator Banner */}
      <div
        className={`p-3 rounded-lg flex items-center gap-3 border transition-colors ${
          activeSpaceId
            ? "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-100"
            : "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-100"
        }`}
      >
        {activeSpaceId ? (
          <CheckCircle2 className="text-emerald-600 dark:text-emerald-400 shrink-0" />
        ) : (
          <AlertCircle className="text-amber-600 dark:text-amber-500 shrink-0" />
        )}
        <div className="flex-1">
          <div className="font-semibold text-sm">
            {activeSpaceId ? "Space Active" : "No Space Active"}
          </div>
          <div className="text-xs opacity-90">
            {activeSpaceId
              ? `Saving items to "${activeSpaceName}"`
              : "Activate a space below to start saving references."}
          </div>
        </div>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          value={newSpaceName}
          onChange={(e) => setNewSpaceName(e.target.value)}
          placeholder="New Space Name"
          className="flex-1 p-2 border border-gray-300 dark:border-zinc-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <button
          type="submit"
          className="p-2 bg-emerald-600 dark:bg-emerald-700 text-white rounded hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors"
          disabled={!newSpaceName.trim()}
        >
          <Plus size={20} />
        </button>
      </form>

      <div className="space-y-2">
        {spaces.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
            No spaces yet. Create one to start researching.
          </p>
        )}

        {spaces.map((space) => {
          const isActive = space.id === activeSpaceId;
          return (
            <div
              key={space.id}
              className={`p-3 rounded-lg border transition-all ${
                isActive
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 shadow-sm"
                  : "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600"
              }`}
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => selectSpace(isActive ? null : space.id)}
              >
                <div className="font-medium text-gray-900 dark:text-white">
                  {space.name}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive
                        ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200"
                        : "bg-gray-100 text-gray-500 dark:bg-zinc-700 dark:text-gray-400"
                    }`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    className={`focus:outline-none transition-colors ${
                      isActive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectSpace(isActive ? null : space.id);
                    }}
                  >
                    {isActive ? (
                      <ToggleRight size={28} />
                    ) : (
                      <ToggleLeft size={28} />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 pl-0.5">
                {space.items?.length || 0} saved items
              </div>

              <div className="mt-3 flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-zinc-700/50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openSpace(space.id);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <ExternalLink size={14} /> Open Tabs
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewingSpaceId(space.id);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <FileText size={14} /> References
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this space?")) deleteSpace(space.id);
                  }}
                  className="flex items-center justify-center p-1.5 w-8 h-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-xs transition-colors group"
                  title="Delete Space"
                >
                  <Trash2
                    size={16}
                    className="group-hover:stroke-2 transition-all"
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

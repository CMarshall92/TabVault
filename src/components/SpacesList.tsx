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
} from "lucide-react";
import { useState, useEffect } from "react";
import TutorialOverlay from "./TutorialOverlay";

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

  return (
    <div className="p-4 space-y-4 relative">
      {showTutorial && <TutorialOverlay onComplete={handleTutorialComplete} />}

      <h1 className="text-xl font-bold mb-4">Research Spaces</h1>

      {/* Active Space Indicator Banner */}
      <div
        className={`p-3 rounded-lg flex items-center gap-3 border ${activeSpaceId ? "bg-blue-50 border-blue-200 text-blue-900" : "bg-amber-50 border-amber-200 text-amber-900"}`}
      >
        {activeSpaceId ? (
          <CheckCircle2 className="text-blue-600 shrink-0" />
        ) : (
          <AlertCircle className="text-amber-600 shrink-0" />
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
          className="flex-1 p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={!newSpaceName.trim()}
        >
          <Plus size={20} />
        </button>
      </form>

      <div className="space-y-2">
        {spaces.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">
            No spaces yet. Create one to start researching.
          </p>
        )}

        {spaces.map((space) => {
          const isActive = space.id === activeSpaceId;
          return (
            <div
              key={space.id}
              className={`p-3 rounded border transition-all ${isActive ? "border-blue-500 bg-blue-50 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"}`}
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => selectSpace(isActive ? null : space.id)}
              >
                <div className="font-medium text-gray-900">{space.name}</div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-blue-200 text-blue-800" : "bg-gray-100 text-gray-500"}`}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    className={`focus:outline-none transition-colors ${isActive ? "text-blue-600" : "text-gray-300 hover:text-gray-400"}`}
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

              <div className="mt-2 text-xs text-gray-500 pl-0.5">
                {space.items?.length || 0} saved items
              </div>

              <div className="mt-3 flex gap-2 border-t pt-2 border-gray-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openSpace(space.id);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                >
                  <ExternalLink size={14} /> Open
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSpace(space.id);
                  }}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

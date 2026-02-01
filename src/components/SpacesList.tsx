"use client";

import { useSpaces } from "@/hooks/useSpaces";
import { Plus, Trash2, ExternalLink } from "lucide-react";
import { useState } from "react";

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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSpaceName.trim()) {
      addSpace(newSpaceName);
      setNewSpaceName("");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold mb-4">Research Spaces</h1>

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
              className={`p-3 rounded border transition-all ${isActive ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-gray-200 bg-white hover:border-gray-300"}`}
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => selectSpace(space.id)}
              >
                <div className="font-medium text-gray-900">{space.name}</div>
                <div className="flex gap-2">
                  {isActive && (
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500">
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
                  <ExternalLink size={14} /> Open Space
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

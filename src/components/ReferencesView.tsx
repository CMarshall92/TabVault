"use client";

import { useSpaces, SavedItem } from "@/hooks/useSpaces";
import {
  ChevronLeft,
  Trash2,
  Calendar,
  FileText,
  Globe,
  ExternalLink,
} from "lucide-react";

interface ReferencesViewProps {
  spaceId: string;
  onBack: () => void;
}

const HIGHLIGHT_COLORS = [
  "#ffadad",
  "#ffd6a5",
  "#fdffb6",
  "#caffbf",
  "#9bf6ff",
  "#a0c4ff",
  "#bdb2ff",
  "#ffc6ff",
];

export default function ReferencesView({
  spaceId,
  onBack,
}: ReferencesViewProps) {
  const { spaces, updateItemColor, deleteItem } = useSpaces();
  const space = spaces.find((s) => s.id === spaceId);

  // Group items by URL to create sections
  const getGroupedItems = (items: SavedItem[]) => {
    if (!items) return [];

    const groups = new Map<
      string,
      { url: string; title: string; firstSeen: number; items: SavedItem[] }
    >();

    items.forEach((item) => {
      if (!groups.has(item.url)) {
        groups.set(item.url, {
          url: item.url,
          title: item.title || new URL(item.url).hostname,
          firstSeen: item.timestamp,
          items: [],
        });
      }
      groups.get(item.url)!.items.push(item);
    });

    // Sort groups by when they were first seen (Tab order)
    const sortedGroups = Array.from(groups.values()).sort(
      (a, b) => a.firstSeen - b.firstSeen,
    );

    // Sort items within groups chronologically
    sortedGroups.forEach((group) => {
      group.items.sort((a, b) => a.timestamp - b.timestamp);
    });

    return sortedGroups;
  };

  const groupedItems = space ? getGroupedItems(space.items) : [];

  const handleOpenReference = (url: string, text: string) => {
    // secure the text fragment format
    const fragment = `#:~:text=${encodeURIComponent(text)}`;
    window.open(`${url}${fragment}`, "_blank");
  };

  if (!space) return <div>Space not found</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50 dark:bg-zinc-900 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-zinc-800 border-b border-gray-200 dark:border-zinc-700 shadow-sm z-20 sticky top-0 transition-colors">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full transition-colors text-gray-700 dark:text-gray-200"
          aria-label="Back to Spaces"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <div>
          <h2 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
            {space.name}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {space.items.length} references saved
          </p>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {space.items.length === 0 && (
          <div className="text-center text-gray-400 dark:text-gray-500 py-10">
            <div className="flex justify-center mb-2">
              <FileText
                size={40}
                className="opacity-20 text-gray-500 dark:text-gray-400"
              />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No references saved yet.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Visit a webpage and select text to save it here.
            </p>
          </div>
        )}

        {groupedItems.map((group) => (
          <div key={group.url} className="space-y-3">
            {/* Section Header */}
            <div className="flex items-center gap-2 px-1 text-gray-700 dark:text-gray-300">
              <Globe
                size={16}
                className="text-blue-500 dark:text-blue-400 shrink-0"
              />
              <a
                href={group.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold uppercase tracking-wider hover:underline truncate"
              >
                {group.title}
              </a>
            </div>

            {/* Items Card Grid/Stack */}
            <div className="space-y-3">
              {group.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-sm hover:shadow-md transition-all relative group"
                >
                  {/* Text Preview - Clickable to open & scroll */}
                  <div
                    className="relative cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleOpenReference(group.url, item.text)}
                    title="Open and scroll to text"
                  >
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink
                        size={12}
                        className="text-gray-400 dark:text-gray-500"
                      />
                    </div>
                    <blockquote
                      className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed p-3 rounded-lg border-l-4 font-serif"
                      style={{
                        backgroundColor: (item.color || "#fdffb6") + "40", // 25% opacity for background
                        borderColor: item.color || "#fdffb6",
                      }}
                    >
                      <span className="select-text">
                        &quot;{item.text}&quot;
                      </span>
                    </blockquote>
                  </div>

                  {/* Footer: Controls */}
                  <div className="flex items-center justify-between pt-3 mt-1">
                    {/* Color Picker */}
                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-zinc-900/50 p-1 rounded-full border border-gray-100 dark:border-zinc-700">
                      {HIGHLIGHT_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => updateItemColor(space.id, item.id, c)}
                          className={`w-3.5 h-3.5 rounded-full transition-transform ${item.color === c ? "ring-2 ring-offset-1 ring-gray-400 dark:ring-gray-500 scale-110" : "hover:scale-110"}`}
                          style={{ backgroundColor: c }}
                          title="Change highlight color"
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1 font-medium bg-gray-50 dark:bg-zinc-900/50 px-2 py-1 rounded">
                        <Calendar size={10} />
                        {new Date(item.timestamp).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" },
                        )}
                      </div>
                      <button
                        onClick={() => {
                          if (confirm("Remove this reference?"))
                            deleteItem(space.id, item.id);
                        }}
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-md transition-colors"
                        title="Remove reference"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

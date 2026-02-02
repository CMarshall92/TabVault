"use client";

import { useState, useEffect, useCallback } from "react";

export type SavedItem = {
  id: string;
  url: string;
  title: string;
  text: string;
  color?: string;
  timestamp: number;
};

export type Space = {
  id: string;
  name: string;
  items: SavedItem[];
};

export function useSpaces() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    // Only run in browser extension environment or mock
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(["spaces", "activeSpaceId"], (result) => {
        if (result.spaces) setSpaces(result.spaces as Space[]);
        if (result.activeSpaceId) setActiveSpaceId(result.activeSpaceId as string);
        setLoading(false);
      });

      // Listen for changes (e.g. from content script)
      const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
        if (areaName === "local") {
          if (changes.spaces) setSpaces(changes.spaces.newValue as Space[]);
          if (changes.activeSpaceId) setActiveSpaceId(changes.activeSpaceId.newValue as string);
        }
      };

      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    } else {
        // Fallback for local development (browser "npm run dev")
        try {
            const storedSpaces = localStorage.getItem("spaces");
            const storedActive = localStorage.getItem("activeSpaceId");
            // eslint-disable-next-line
            if (storedSpaces) setSpaces(JSON.parse(storedSpaces));
            if (storedActive) setActiveSpaceId(storedActive);
        } catch (e) { console.error("Local storage error", e); }
        setLoading(false);
    }
  }, []);

  const addSpace = useCallback(async (name: string) => {
    const newSpace: Space = {
      id: crypto.randomUUID(),
      name,
      items: [],
    };
    const updatedSpaces = [...spaces, newSpace];
    
    // Optimistic update
    setSpaces(updatedSpaces);
    setActiveSpaceId(newSpace.id);
    
    if (typeof chrome !== "undefined" && chrome.storage) {
      await chrome.storage.local.set({ 
        spaces: updatedSpaces,
        activeSpaceId: newSpace.id 
      });
    } else {
       localStorage.setItem("spaces", JSON.stringify(updatedSpaces));
       localStorage.setItem("activeSpaceId", newSpace.id);
    }
  }, [spaces]);

  const selectSpace = useCallback(async (id: string | null) => {
    setActiveSpaceId(id);
    if (typeof chrome !== "undefined" && chrome.storage) {
      if (id === null) {
        await chrome.storage.local.remove("activeSpaceId");
      } else {
        await chrome.storage.local.set({ activeSpaceId: id });
      }
    } else {
        if (id === null) localStorage.removeItem("activeSpaceId");
        else localStorage.setItem("activeSpaceId", id);
    }
  }, []);

  const openSpace = useCallback((spaceId: string) => {
    const space = spaces.find((s) => s.id === spaceId);
    if (space && space.items.length > 0) {
        if (typeof chrome !== "undefined" && chrome.runtime) {
            // Group by URL to find the first item for each page
            const urlToItemMap = new Map<string, string>();
            // We assume items are pushed in chronological order? 
            // If we want the "first" visually, sorting by timestamp might be good, 
            // but the array order is likely preserving insertion order.
            
            space.items.forEach(item => {
                if (!urlToItemMap.has(item.url)) {
                    urlToItemMap.set(item.url, item.id);
                }
            });

            const tabsToOpen = Array.from(urlToItemMap.entries()).map(([url, itemId]) => ({
                url,
                itemId
            }));
            
            chrome.runtime.sendMessage({ action: "openSpace", tabs: tabsToOpen, spaceName: space.name });
        } else {
            alert(`Open Space: ${space.name} (This would open tabs in extension)`);
        }
    }
  }, [spaces]);

  const deleteSpace = useCallback(async (id: string) => {
      const updatedSpaces = spaces.filter(s => s.id !== id);
      setSpaces(updatedSpaces);
      if (activeSpaceId === id) setActiveSpaceId(null);
      
      if (typeof chrome !== "undefined" && chrome.storage) {
          await chrome.storage.local.set({ 
              spaces: updatedSpaces,
              activeSpaceId: activeSpaceId === id ? null : activeSpaceId
          });
      } else {
          localStorage.setItem("spaces", JSON.stringify(updatedSpaces));
          if (activeSpaceId === id) localStorage.removeItem("activeSpaceId");
      }
  }, [spaces, activeSpaceId]);

  const updateItemColor = useCallback(async (spaceId: string, itemId: string, color: string) => {
    const updatedSpaces = spaces.map(s => {
      if (s.id === spaceId) {
        return {
          ...s,
          items: s.items.map(i => i.id === itemId ? { ...i, color } : i)
        };
      }
      return s;
    });
    setSpaces(updatedSpaces);
    
    if (typeof chrome !== "undefined" && chrome.storage) {
      await chrome.storage.local.set({ spaces: updatedSpaces });
    } else {
       localStorage.setItem("spaces", JSON.stringify(updatedSpaces));
    }
  }, [spaces]);

  const deleteItem = useCallback(async (spaceId: string, itemId: string) => {
    const updatedSpaces = spaces.map(s => {
      if (s.id === spaceId) {
        return {
          ...s,
          items: s.items.filter(i => i.id !== itemId)
        };
      }
      return s;
    });
    setSpaces(updatedSpaces);
    
    if (typeof chrome !== "undefined" && chrome.storage) {
      await chrome.storage.local.set({ spaces: updatedSpaces });
    } else {
       localStorage.setItem("spaces", JSON.stringify(updatedSpaces));
    }
  }, [spaces]);

  return {
    spaces,
    activeSpaceId,
    loading,
    addSpace,
    selectSpace,
    openSpace,
    deleteSpace,
    updateItemColor,
    deleteItem
  };
}

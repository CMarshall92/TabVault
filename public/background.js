const pendingScrolls = {};

// --- Context Menu Logic ---

// Helper to update the context menu items based on current spaces
function updateContextMenus(spaces, activeSpaceId) {
  // Clear existing menus
  chrome.contextMenus.removeAll(() => {
    // 1. Create Root Item
    // This serves as the main entry point
    chrome.contextMenus.create({
      id: "tabvault-root",
      title: "TabVault",
      contexts: ["page", "selection"]
    });

    // 2. Create "Open Dashboard" Item
    // Always available so user can go create a space
    chrome.contextMenus.create({
        id: "tabvault-open-dashboard",
        parentId: "tabvault-root",
        title: "Manage Spaces...",
        contexts: ["page", "selection"]
    });

    if (!spaces || spaces.length === 0) {
      chrome.contextMenus.create({
        id: "no-spaces",
        parentId: "tabvault-root",
        title: "No spaces created yet",
        enabled: false,
        contexts: ["page", "selection"]
      });
      return;
    }

    // Separator before the list
    chrome.contextMenus.create({
        id: "tabvault-sep-1",
        parentId: "tabvault-root",
        type: "separator",
        contexts: ["page", "selection"]
    });

    // 3. Create "Activate Space" Submenu
    // This allows changing the globally active space from the context menu
    chrome.contextMenus.create({
        id: "tabvault-activate",
        parentId: "tabvault-root",
        title: "Activate Space",
        contexts: ["page", "selection"]
    });

    // Add spaces to "Activate Space"
    spaces.forEach(space => {
      chrome.contextMenus.create({
        id: `activate-${space.id}`, // Prefix ID to distinguish action
        parentId: "tabvault-activate",
        title: space.name,
        type: "radio",
        checked: space.id === activeSpaceId,
        contexts: ["page", "selection"]
      });
    });
  });
}

// Helper to refresh menus from storage
function refreshMenus() {
  chrome.storage.local.get(["spaces", "activeSpaceId"], (result) => {
    updateContextMenus(result.spaces || [], result.activeSpaceId || null);
  });
}

// Initialize on install/startup
chrome.runtime.onInstalled.addListener(refreshMenus);
chrome.runtime.onStartup.addListener(refreshMenus);

// Listen for storage changes to update the menu in real-time
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && (changes.spaces || changes.activeSpaceId)) {
    refreshMenus();
  }
});

// Handle Menu Clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const menuId = info.menuItemId;
  
  // Ignore container clicks
  if (["tabvault-root", "tabvault-activate", "no-spaces"].includes(menuId)) return;
  // Handle "Open Dashboard"
  if (menuId === "tabvault-open-dashboard") {
    chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
    return;
  }
  // Handle "Activate Space" action
  if (menuId.startsWith("activate-")) {
    const spaceId = menuId.replace("activate-", "");
    await chrome.storage.local.set({ activeSpaceId: spaceId });
    // Optional: Could send a notification here
    return;
  }
});

// --- Existing Tab Logic ---

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && pendingScrolls[tabId]) {
    const itemId = pendingScrolls[tabId];
    // Small delay to ensure content script is ready
    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, { action: "scrollToItem", itemId })
        .catch((e) => console.log("TabVault: Could not scroll", e));
    }, 1000);
    delete pendingScrolls[tabId];
  }
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "openSpace") {
    const { tabs, spaceName } = request;
    if (tabs && Array.isArray(tabs) && tabs.length > 0) {
      openSpace(tabs, spaceName);
    }
  }
});

async function openSpace(tabsData, spaceName) {
  try {
    const tabIds = [];
    // Open tabs
    for (const item of tabsData) {
      const tab = await chrome.tabs.create({ url: item.url, active: false });
      if (tab.id) {
        tabIds.push(tab.id);
        if (item.itemId) {
          pendingScrolls[tab.id] = item.itemId;
        }
      }
    }

    // specific Chrome API check for tabGroups
    if (chrome.tabGroups && tabIds.length > 0) {
      const groupId = await chrome.tabs.group({ tabIds: tabIds });
      await chrome.tabGroups.update(groupId, { 
        title: spaceName || "Research Space",
        collapsed: false
      });
    }
  } catch (error) {
    console.error("Error opening space:", error);
  }
}


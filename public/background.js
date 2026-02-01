const pendingScrolls = {};

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

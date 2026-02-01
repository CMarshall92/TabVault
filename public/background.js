chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "openSpace") {
    const { urls, spaceName } = request;
    if (urls && Array.isArray(urls) && urls.length > 0) {
      openSpace(urls, spaceName);
    }
  }
});

async function openSpace(urls, spaceName) {
  try {
    const tabIds = [];
    // Open tabs
    for (const url of urls) {
      const tab = await chrome.tabs.create({ url: url, active: false });
      if (tab.id) {
        tabIds.push(tab.id);
      }
    }

    // specific Chrome API check for tabGroups which might not be available in all contexts or browsers
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

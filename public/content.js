let activeIcon = null;

document.addEventListener('mouseup', async (e) => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  // If we have an existing icon, remove it unless clicking *on* it
  if (activeIcon && !activeIcon.contains(e.target)) {
    activeIcon.remove();
    activeIcon = null;
  }

  if (!selectedText) return;

  // Check for active space
  const { activeSpaceId } = await chrome.storage.local.get("activeSpaceId");
  if (!activeSpaceId) return;

  // Create tooltip icon
  showTooltip(e.pageX, e.pageY, selectedText, activeSpaceId);
});

function showTooltip(x, y, text, spaceId) {
  if (activeIcon) activeIcon.remove();

  const btn = document.createElement("button");
  btn.textContent = "Save to Space";
  btn.style.position = "absolute";
  btn.style.top = `${y + 10}px`;
  btn.style.left = `${x}px`;
  btn.style.zIndex = "999999";
  btn.style.padding = "5px 10px";
  btn.style.background = "#2563eb";
  btn.style.color = "white";
  btn.style.border = "none";
  btn.style.borderRadius = "4px";
  btn.style.cursor = "pointer";
  btn.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  
  btn.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent ensuring selection clear
    saveToSpace(text, spaceId);
    highlightSelection();
    btn.remove();
    activeIcon = null;
  });

  document.body.appendChild(btn);
  activeIcon = btn;
}

async function saveToSpace(text, spaceId) {
  const item = {
    url: window.location.href,
    title: document.title,
    text: text,
    timestamp: Date.now()
  };

  const data = await chrome.storage.local.get("spaces");
  const spaces = data.spaces || [];
  
  const updatedSpaces = spaces.map(s => {
    if (s.id === spaceId) {
      return { ...s, items: [...(s.items || []), item] };
    }
    return s;
  });

  await chrome.storage.local.set({ spaces: updatedSpaces });
  console.log("Saved to space:", spaceId);
}

function highlightSelection() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const span = document.createElement("span");
  span.style.backgroundColor = "yellow";
  span.style.color = "black";
  
  try {
    range.surroundContents(span);
    selection.removeAllRanges();
  } catch (e) {
    console.error("Could not highlight (likely crossing block boundaries)", e);
  }
}

// Styles for our UI
const style = document.createElement('style');
style.textContent = `
  .tabvault-tooltip {
    position: fixed;
    z-index: 2147483647;
    background: #1f2937;
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transform: translateX(-50%);
    animation: tv-fade-in 0.2s ease-out;
    white-space: nowrap;
    pointer-events: auto;
  }
  .tabvault-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -6px;
    border-width: 6px;
    border-style: solid;
    border-color: #1f2937 transparent transparent transparent;
  }
  @keyframes tv-fade-in {
    from { opacity: 0; transform: translate(-50%, 10px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }
  .tabvault-highlight {
    cursor: pointer;
    border-radius: 2px;
    transition: all 0.2s;
    background-blend-mode: multiply;
  }
  .tabvault-highlight:hover {
    filter: brightness(0.95);
    outline: 2px solid rgba(0,0,0,0.1);
  }
  .tabvault-remove-btn {
    position: fixed;
    background: #ef4444;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    z-index: 2147483647;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transform: translate(-50%, -150%);
    font-family: sans-serif;
    font-weight: bold;
    border: 2px solid white;
    opacity: 0;
    transition: opacity 0.2s;
  }
`;
document.head.appendChild(style);

let activeTooltip = null;
let removeBtn = null;
let removeBtnTimer = null;

// --- Message Listener ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrollToItem") {
        const { itemId } = request;
        if (itemId) performScroll(itemId);
    }
});

function performScroll(itemId) {
    // Look for existing highlight
    const el = document.querySelector(`.tabvault-highlight[data-tv-id="${itemId}"]`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Flash effect
        el.style.transition = 'box-shadow 0.3s';
        el.style.boxShadow = '0 0 0 5px rgba(255, 255, 0, 0.7)';
        setTimeout(() => {
             el.style.boxShadow = 'none';
        }, 1500);
    } else {
        // Not found yet? Maybe restore hasn't finished.
        // We set a flag or try to wait?
        // Let's retry in a bit
        setTimeout(() => {
             const elRetry = document.querySelector(`.tabvault-highlight[data-tv-id="${itemId}"]`);
             if (elRetry) elRetry.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 1500);
    }
}

// --- Colors ---
const HIGHLIGHT_COLORS = [
    "#ffadad", "#ffd6a5", "#fdffb6", "#caffbf", 
    "#9bf6ff", "#a0c4ff", "#bdb2ff", "#ffc6ff"
];

function getRandomColor() {
    return HIGHLIGHT_COLORS[Math.floor(Math.random() * HIGHLIGHT_COLORS.length)];
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// --- Initialization ---
// Small delay to ensure page is ready
setTimeout(restoreHighlights, 1000);

// --- Event Listeners ---
document.addEventListener('mouseup', async (e) => {
    // cleanup tooltip
    if (activeTooltip && !activeTooltip.contains(e.target)) {
        activeTooltip.remove();
        activeTooltip = null;
    }
    
    // cleanup remove btn if clicking elsewhere (handled by timers usually, but force close on click)
    // Actually, letting timer handle it is smoother.
    // But if we click text, we might want to select, so removing button is good practice.
    if (removeBtn && !e.target.closest('.tabvault-highlight') && !removeBtn.contains(e.target)) {
        hideRemoveButton();
    }

    if (e.target.matches('input, textarea') || e.target.isContentEditable) return;

    const selection = window.getSelection();
    // Use raw String to avoid trimming issues matching later
    const text = selection.toString(); 
    if (!text || !text.trim()) return;

    const { activeSpaceId } = await chrome.storage.local.get("activeSpaceId");
    if (!activeSpaceId) return;

    try {
        if (selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        if (rect.width === 0 || rect.height === 0) return;

        showTooltip(rect, text, activeSpaceId, range);
    } catch (err) {
        console.error("TabVault: Error getting range", err);
    }
});

function showTooltip(rect, text, spaceId, range) {
    if (activeTooltip) activeTooltip.remove();

    const btn = document.createElement("div");
    btn.className = "tabvault-tooltip";
    btn.textContent = "Save";
    
    // iPhone style: Centered ABOVE the selection
    // Position fixed logic
    const top = rect.top - 50; // 50px offset for height + arrow + gap
    const left = rect.left + (rect.width / 2);

    btn.style.top = `${top}px`;
    btn.style.left = `${left}px`;
    
    btn.addEventListener("mousedown", async (e) => {
        e.preventDefault(); 
        e.stopPropagation();
        
        const color = getRandomColor();
        const itemId = generateId();
        
        // Save first or Highlight first?
        // Highlight logic requires DOM manipulation which might break selection.
        // We will highlight using our robust wrapper
        highlightSafe(range, color, itemId);
        
        await saveToSpace(text, spaceId, color, itemId);
        
        window.getSelection().removeAllRanges();
        btn.remove();
        activeTooltip = null;
    });

    document.body.appendChild(btn);
    activeTooltip = btn;
}

// --- Robust Highlighting ---

function highlightSafe(range, color, itemId) {
    // Recursive walker that finds text nodes intersecting the range
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;
    
    // Fallback if commonAncestor is not an Element (e.g. TextNode)
    let commonAncestor = range.commonAncestorContainer;
    if (commonAncestor.nodeType === Node.TEXT_NODE) {
        commonAncestor = commonAncestor.parentNode;
    }

    const textNodes = [];
    
    const walker = document.createTreeWalker(
        commonAncestor, 
        NodeFilter.SHOW_TEXT, 
        {
            acceptNode: (node) => {
                // Safety checks for "all types of html"
                const parent = node.parentNode;
                if (!parent) return NodeFilter.FILTER_REJECT;
                
                // 1. Skip invalid tags
                const tag = parent.tagName;
                if (['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'NOSCRIPT', 'svg', 'IFRAME', 'BUTTON', 'SELECT', 'OPTION'].includes(tag)) {
                    return NodeFilter.FILTER_REJECT;
                }
                
                // 2. Prevent nested highlights (if parent is already highlighted)
                if (parent.classList && parent.classList.contains('tabvault-highlight')) {
                    return NodeFilter.FILTER_REJECT;
                }

                // 3. Skip empty whitespace nodes to reduce visual clutter? 
                // No, sometimes we need them for spacing. But generally good for clean DOM.
                if (!node.nodeValue.trim()) return NodeFilter.FILTER_SKIP;

                if (!range.intersectsNode(node)) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    while(walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }

    // Process nodes
    textNodes.forEach(node => {
        let start = 0;
        let end = node.length;
        
        // Adjust start/end if this node is the boundary
        if (node === startContainer) start = startOffset;
        if (node === endContainer) end = endOffset;
        
        if (start < end) {
            wrapTextNodePart(node, start, end, color, itemId);
        }
    });
}

function wrapTextNodePart(textNode, start, end, color, itemId) {
    const range = document.createRange();
    range.setStart(textNode, start);
    range.setEnd(textNode, end);
    
    const wrapper = document.createElement('span');
    wrapper.className = "tabvault-highlight";
    wrapper.style.backgroundColor = color;
    wrapper.dataset.tvId = itemId;
    
    // Interactions
    // Use named handlers to easier debug and maintain logic consistency
    wrapper.addEventListener('mouseenter', handleHighlightMouseEnter);
    wrapper.addEventListener('mouseleave', handleHighlightMouseLeave);

    try {
        range.surroundContents(wrapper);
    } catch(e) {
        console.error("TabVault: Wrap failed", e);
    }
}

// --- Hover Logic for Stable Buttons ---

function handleHighlightMouseEnter(e) {
    const span = e.target;
    // Walk up just in case, though target should be span
    const target = span.closest('.tabvault-highlight');
    if (!target) return;
    
    const itemId = target.dataset.tvId;
    
    // 1. Cancel any pending hide
    if (removeBtnTimer) {
        clearTimeout(removeBtnTimer);
        removeBtnTimer = null;
    }
    
    // 2. If button exists and matches this item, we are good.
    if (removeBtn && removeBtn.dataset.tvId === itemId) {
        return;
    }
    
    // 3. Else, show button for this group
    showRemoveButtonForId(itemId);
}

function handleHighlightMouseLeave(e) {
    // Schedule hide. 
    // If we enter another span of SAME ID, mouseenter will fire and clear this.
    // If we enter the BUTTON, the button's mouseenter will fire and clear this.
    removeBtnTimer = setTimeout(() => {
        hideRemoveButton();
    }, 200); // 200ms grace period
}

function hideRemoveButton() {
    if (removeBtn) {
        removeBtn.remove();
        removeBtn = null;
    }
}

function showRemoveButtonForId(itemId) {
    // Close old one
    hideRemoveButton();
    
    // Calculate bounding box of all spans for this item
    const spans = Array.from(document.querySelectorAll(`.tabvault-highlight[data-tv-id="${itemId}"]`));
    if (spans.length === 0) return;
    
    let minTop = Infinity, minLeft = Infinity, maxRight = -Infinity;
    
    // We only care about top-most and horizontal center
    spans.forEach(s => {
        const r = s.getBoundingClientRect();
        if (r.top < minTop) minTop = r.top;
        if (r.left < minLeft) minLeft = r.left;
        if (r.right > maxRight) maxRight = r.right;
    });
    
    const width = maxRight - minLeft;
    // top-center of the bounding box
    const top = minTop;
    const left = minLeft + width / 2;

    const btn = document.createElement("div");
    btn.className = "tabvault-remove-btn";
    btn.dataset.tvId = itemId;
    btn.innerHTML = "&times;";
    btn.title = "Remove Highlight";
    
    btn.style.top = `${top}px`;
    btn.style.left = `${left}px`;
    btn.style.opacity = "1";
    
    // Button Interactions
    btn.addEventListener("mouseenter", () => {
         if (removeBtnTimer) {
             clearTimeout(removeBtnTimer);
             removeBtnTimer = null;
         }
    });

    btn.addEventListener("mouseleave", () => {
        removeBtnTimer = setTimeout(() => {
             hideRemoveButton();
        }, 200);
    });
    
    btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        const itemId = btn.dataset.tvId;
        if (!itemId) return;
        
        await removeItem(itemId);
        
        // Remove ALL spans with this ID
        const allSpans = document.querySelectorAll(`.tabvault-highlight[data-tv-id="${itemId}"]`);
        allSpans.forEach(s => {
            // Unwrap
            const parent = s.parentNode;
            while(s.firstChild) parent.insertBefore(s.firstChild, s);
            parent.removeChild(s);
        });
        
        hideRemoveButton();
    });
    
    document.body.appendChild(btn);
    removeBtn = btn;
}

// --- Storage & Restore ---

async function saveToSpace(text, spaceId, color, itemId) {
    const item = {
        id: itemId,
        url: window.location.href,
        title: document.title,
        text: text, // Raw text
        color: color,
        timestamp: Date.now()
    };
    
    const data = await chrome.storage.local.get("spaces");
    const spaces = data.spaces || [];
    const updatedSpaces = spaces.map(s => 
        s.id === spaceId ? { ...s, items: [...(s.items || []), item] } : s
    );
    await chrome.storage.local.set({ spaces: updatedSpaces });
}

async function removeItem(itemId) {
     const data = await chrome.storage.local.get("spaces");
     if(!data.spaces) return;
     const updatedSpaces = data.spaces.map(s => ({
         ...s,
         items: (s.items || []).filter(i => i.id !== itemId)
     }));
     await chrome.storage.local.set({ spaces: updatedSpaces });
}

async function restoreHighlights() {
    const data = await chrome.storage.local.get("spaces");
    if (!data.spaces) return;

    const currentUrl = window.location.href;
    const items = [];
    
    data.spaces.forEach(s => {
        if(s.items) {
            s.items.forEach(i => {
                if (i.url === currentUrl) items.push(i);
            });
        }
    });
    
    if (items.length === 0) return;

    // Use window.find to locate text ranges robustly
    // This is the "Search" approach which handles complex DOM nodes automatically.
    
    // Save current selection to restore it later
    const originalSelection = window.getSelection();
    let savedRanges = [];
    if (originalSelection.rangeCount > 0) {
        for(let i=0; i<originalSelection.rangeCount; i++) savedRanges.push(originalSelection.getRangeAt(i));
    }
    originalSelection.removeAllRanges();

    // Loop through items
    for (const item of items) {
        if (!item.text) continue;
        
        // Reset cursor to start
        document.getSelection().removeAllRanges();
        
        // window.find(string, caseSensitive, backward, wrapAround, wholeWord, searchInFrames, showDialog)
        // We do a forward search from top
        // But doing this repeatedly is slow and disruptive?
        // Actually, modern browsers might not support window.find cleanly without side effects.
        // Let's try the TreeWalker + Text Search approach instead, it's invisible.
        
        findAndHighlight(item);
    }
    
    // Restore selection
    originalSelection.removeAllRanges();
    savedRanges.forEach(r => originalSelection.addRange(r));
}

function findAndHighlight(item) {
    // Robust text finder:
    // 1. Get all text from body
    // 2. Find index of item.text
    // 3. Map index back to Range
    
    const body = document.body;
    const searchText = item.text.trim();
    if (!searchText) return;

    // Create a compiled text string and a map of [node, length]
    // This is essentially "innerText" but manually constructed so we can map back.
    const textNodes = [];
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null);
    
    let totalText = "";
    while(walker.nextNode()) {
        const node = walker.currentNode;
        // Skip script/style
        if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentNode.tagName)) continue;
        
        textNodes.push({
            node: node,
            start: totalText.length,
            length: node.nodeValue.length,
            text: node.nodeValue // we track raw value
        });
        totalText += node.nodeValue;
    }

    // Find all occurrences? Or just one?
    // User might have multiple same texts. We'll try to highlight them all?
    // Or just the first one that matches?
    // For now, first match.
    
    // Note: Normalized text comparison is hard (whitespaces).
    // We assume saving extracted text via selection.toString() which roughly matches parsed text.
    // Simplification: Remove extra whitespace for search
    
    const searchSimple = searchText.replace(/\s+/g, ' ');
    const totalSimple = totalText.replace(/\s+/g, ' ');
    
    // Actually, mapping back from simple->simple is huge pain.
    // Let's rely on raw string matching.
    
    let searchIndex = totalText.indexOf(searchText);
    if (searchIndex === -1) {
        // Fallback: try fuzzier match?
        // console.log("TabVault: Could not restore exact text match");
        return;
    }

    // Map searchIndex to startNode
    const startNodeData = textNodes.find(t => searchIndex >= t.start && searchIndex < t.start + t.length);
    const endCharIndex = searchIndex + searchText.length;
    const endNodeData = textNodes.find(t => endCharIndex > t.start && endCharIndex <= t.start + t.length);

    if (startNodeData && endNodeData) {
        const range = document.createRange();
        range.setStart(startNodeData.node, searchIndex - startNodeData.start);
        range.setEnd(endNodeData.node, endCharIndex - endNodeData.start);
        
        highlightSafe(range, item.color, item.id);
    }
}

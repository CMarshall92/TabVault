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
    
    // cleanup remove btn
    if (removeBtn && !e.target.closest('.tabvault-highlight') && !removeBtn.contains(e.target)) {
        removeBtn.remove();
        removeBtn = null;
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
    // and wraps them.
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;
    
    const commonAncestor = range.commonAncestorContainer;
    const textNodes = [];
    
    const walker = document.createTreeWalker(
        commonAncestor, 
        NodeFilter.SHOW_TEXT, 
        {
            acceptNode: (node) => {
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
    wrapper.addEventListener('mouseenter', () => showRemoveButton(wrapper));
    wrapper.addEventListener('mouseleave', (e) => {
        // Delay hide to allow moving to button
        setTimeout(() => {
            if (removeBtn && !removeBtn.matches(':hover')) {
                removeBtn.remove();
                removeBtn = null;
            }
        }, 100);
    });

    try {
        range.surroundContents(wrapper);
    } catch(e) {
        console.error("TabVault: Wrap failed", e);
    }
}

function showRemoveButton(span) {
    if (removeBtn) removeBtn.remove();
    
    // We use fixed positioning based on bounding client rect to handle all scrolls
    const rect = span.getBoundingClientRect();

    const btn = document.createElement("div");
    btn.className = "tabvault-remove-btn";
    btn.innerHTML = "&times;";
    btn.title = "Remove";
    
    // Center top of the span
    btn.style.top = `${rect.top}px`; 
    btn.style.left = `${rect.left + (rect.width/2)}px`;
    btn.style.opacity = "1";
    
    btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const itemId = span.dataset.tvId;
        if (!itemId) return;
        
        await removeItem(itemId);
        
        // Remove ALL spans with this ID
        const allSpans = document.querySelectorAll(`.tabvault-highlight[data-tv-id="${itemId}"]`);
        allSpans.forEach(s => {
            const parent = s.parentNode;
            while(s.firstChild) parent.insertBefore(s.firstChild, s);
            parent.removeChild(s);
        });
        
        btn.remove();
        removeBtn = null;
    });

    // Keep button alive if hovered
    btn.addEventListener('mouseenter', () => {});
    
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

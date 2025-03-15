// ✅ Ensure Offscreen Document Exists
async function ensureOffscreen() {
    const hasDocument = await chrome.offscreen.hasDocument();

    if (!hasDocument) {
        try {
            await chrome.offscreen.createDocument({
                url: "offscreen.html",
                reasons: ["AUDIO_PLAYBACK"],
                justification: "Play sound effects in the background."
            });
            console.log("✅ Offscreen document created.");
        } catch (err) {
            console.error("❌ Failed to create offscreen document:", err);
        }
    } else {
        console.log("⚠ Offscreen document already exists.");
    }
}

// ✅ Handle Tab Open/Close Events
chrome.tabs.onCreated.addListener(async () => {
    await ensureOffscreen();
    chrome.runtime.sendMessage({ action: "playSound", sound: "tab_open" });
});

chrome.tabs.onRemoved.addListener(async () => {
    await ensureOffscreen();
    chrome.runtime.sendMessage({ action: "playSound", sound: "tab_close" });
});

// ✅ Handle Tab Dragging Events
chrome.tabs.onMoved.addListener(async () => {
    await ensureOffscreen();
    chrome.runtime.sendMessage({ action: "playSound", sound: "tab_dragging" }).catch(err => {
        console.warn("⚠ Tab Dragging Sound Error:", err);
    });
});

// ✅ Handle Download Start/Complete Events
chrome.downloads.onCreated.addListener(async () => {
    await ensureOffscreen();
    chrome.runtime.sendMessage({ action: "playSound", sound: "download_start" }).catch(err => {
        console.warn("⚠ Download Start Sound Error:", err);
    });
});

chrome.downloads.onChanged.addListener(async (delta) => {
    if (delta.state && delta.state.current === "complete") {
        await ensureOffscreen();
        chrome.runtime.sendMessage({ action: "playSound", sound: "download_complete" }).catch(err => {
            console.warn("⚠ Download Complete Sound Error:", err);
        });
    }
});

chrome.downloads.onChanged.addListener((downloadDelta) => {
    if (downloadDelta.state && downloadDelta.state.current === "interrupted") {
        chrome.runtime.sendMessage({ action: "downloadFailed" });
    }
});

// ✅ Handle Bookmark Events
chrome.bookmarks.onCreated.addListener(async () => {
    await ensureOffscreen();
    chrome.runtime.sendMessage({ action: "playSound", sound: "bookmark_added" });
});

// ✅ Handle Tab Mute/Unmute Events
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.mutedInfo) {
        const soundName = changeInfo.mutedInfo.muted ? "tab_muted" : "tab_unmuted";
        await ensureOffscreen();
        chrome.runtime.sendMessage({ action: "playSound", sound: soundName });
    }
});



// ✅ Inject `content.js` into all active tabs on install
chrome.runtime.onInstalled.addListener(() => injectContentScripts());

// ✅ Inject `content.js` into all active tabs on startup
chrome.runtime.onStartup.addListener(() => injectContentScripts());

// ✅ Function to Inject `content.js`
function injectContentScripts() {
    chrome.tabs.query({ url: ["http://*/*", "https://*/*"] }, (tabs) => {
        for (let tab of tabs) {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["content.js"]
            }).catch(err => console.warn("Could not inject content script:", err));
        }
    });
}

// ✅ Inject `content.js` when YouTube pages load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url.includes("youtube.com")) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["content.js"]
        }).catch(err => console.warn("Could not inject content script:", err));
    }
});
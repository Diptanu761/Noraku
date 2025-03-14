// ✅ Ensure Offscreen Document Exists
async function ensureOffscreenDocument() {
    const existingContexts = await chrome.runtime.getContexts({ contextTypes: ["OFFSCREEN_DOCUMENT"] });
    if (existingContexts.length === 0) {
        await chrome.offscreen.createDocument({
            url: "offscreen.html",
            reasons: ["AUDIO_PLAYBACK"],
            justification: "Play sound effects for tab events"
        });
    }
}

// ✅ Handle Tab Open/Close Events
chrome.tabs.onCreated.addListener(async () => {
    await ensureOffscreenDocument();
    chrome.runtime.sendMessage({ action: "playSound", sound: "tab_open" });
});

chrome.tabs.onRemoved.addListener(async () => {
    await ensureOffscreenDocument();
    chrome.runtime.sendMessage({ action: "playSound", sound: "tab_close" });
});

// Inject `content.js` into all active tabs on install
chrome.runtime.onInstalled.addListener(() => injectContentScripts());

// Inject `content.js` into all active tabs on startup
chrome.runtime.onStartup.addListener(() => injectContentScripts());

// Function to inject `content.js` into all open tabs
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

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url.includes("youtube.com")) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["content.js"]
        }).catch(err => console.warn("Could not inject content script:", err));
    }
});
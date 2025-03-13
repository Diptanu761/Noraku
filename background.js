let activeTabId = null;

// ✅ Ensure active tab exists (WITHOUT DUPLICATES)
function ensureActiveTab(redirect = false) {
    chrome.tabs.query({}, (tabs) => {
        let existingTab = tabs.find(tab => tab.url && tab.url.includes("active.html"));

        if (existingTab) {
            console.log("✅ Active tab already exists:", existingTab.id);
            activeTabId = existingTab.id;

            // 🔄 Redirect to active tab (if needed)
            if (redirect) {
                chrome.tabs.update(activeTabId, { active: true });
            }
        } else {
            console.log("🆕 No active tab found, creating one...");
            chrome.tabs.create({
                url: chrome.runtime.getURL("active.html"),
                pinned: true,
                active: false  // User won't be forced to focus on it
            }, (tab) => {
                activeTabId = tab.id;
            });
        }
    });
}

// 🔊 Play sound (Only after active tab confirms it's ready)
function playSound(soundName) {
    if (activeTabId) {
        chrome.tabs.sendMessage(activeTabId, { action: "playSound", sound: soundName }).catch(err => {
            console.warn("❌ Message send failed, waiting for active tab...");
            waitForActiveTab(() => playSound(soundName));  // Wait and retry
        });
    } else {
        console.warn("⚠ No active tab found! Ensuring it exists...");
        ensureActiveTab();
    }
}

// ⏳ Wait for active tab to confirm it's ready
function waitForActiveTab(callback) {
    let checkInterval = setInterval(() => {
        if (activeTabId) {
            clearInterval(checkInterval);
            callback();
        }
    }, 500);
}

// 🔊 Play sounds for tab open & close
chrome.tabs.onCreated.addListener(() => playSound("tab_open"));
chrome.tabs.onRemoved.addListener(() => playSound("tab_close"));

// 🔄 Redirect user to active tab on extension enable (NO DUPLICATE TABS)
chrome.runtime.onInstalled.addListener(() => {
    ensureActiveTab(true);
});
chrome.runtime.onStartup.addListener(() => ensureActiveTab());  

// 🚨 If active tab is closed, recreate it
chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabId === activeTabId) {
        console.log("⚠ Active tab closed! Reopening...");
        activeTabId = null;
        ensureActiveTab();
    }
});

// ✅ Receive confirmation from active tab
chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.action === "activeTabReady") {
        console.log("🎵 Active tab is ready! ID:", sender.tab.id);
        activeTabId = sender.tab.id;
    }
});

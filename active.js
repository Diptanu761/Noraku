console.log("🎵 Active tab ready to receive messages!");

// ✅ Notify Background That Active Tab is Ready
chrome.runtime.sendMessage({ action: "activeTabReady" });

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "playSound") {
        console.log(`🔊 Playing sound: ${message.sound}`);
        let audio = new Audio(chrome.runtime.getURL(`sounds/${message.sound}.mp3`));
        audio.volume = 0.5;
        audio.play().catch(err => console.error("Audio play failed:", err));
    }
});
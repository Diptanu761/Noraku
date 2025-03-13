if (!chrome.runtime?.id) {
    console.warn("❌ Extension context invalidated. Content script won't run.");
} else {
    console.log("📜 Scroll detection active!");
    // Touch Scroll Detection (Mouse)
    window.addEventListener("wheel", () => {
        console.log("📜 Mouse scroll detected, sending message...");
        chrome.runtime.sendMessage({ action: "playSound", sound: "scroll" })
            .catch(err => console.warn("⚠ Scroll message failed:", err));
    }, { passive: true });
    
    // Touch Scroll Detection (For Mobile)
    window.addEventListener("touchmove", () => {
        console.log("📜 Touch scroll detected, sending message...");
        chrome.runtime.sendMessage({ action: "playSound", sound: "scroll" });
    }, { passive: true });

    // Keyboard Scroll Detection (Arrow Keys / Page Up-Down)
    window.addEventListener("keydown", (event) => {
        if (["ArrowUp", "ArrowDown", "PageUp", "PageDown"].includes(event.key)) {
            console.log("📜 Keyboard scroll detected, sending message...");
            chrome.runtime.sendMessage({ action: "playSound", sound: "scroll" });
        }
    });
}


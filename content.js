if (!chrome.runtime?.id) {
    console.warn("❌ Extension context invalidated. Content script won't run.");
} else {
    console.log("📜 Scroll detection active!");

    let audio = document.createElement("audio");
    audio.style.display = "none";

    const bd=document.querySelector("body");
    bd.appendChild(audio);

    let scrollCooldown = false;
    let lastScrollTime = 0;
    const SCROLL_DELAY = 300;

    function playSound(soundName) {
        let now = Date.now();
        if (scrollCooldown || now - lastScrollTime < SCROLL_DELAY) return;
        
        lastScrollTime = now;
        console.log(`🔊 Playing sound: ${soundName}`);

        audio.src = chrome.runtime.getURL(`sounds/${soundName}.mp3`);

        // Increase volume specifically for "scroll" sound
        audio.volume = soundName === "scroll" ? 1.0 : 0.5; 

        audio.play().catch(err => console.error("⚠ Audio play failed:", err));

        scrollCooldown = true;
        setTimeout(() => scrollCooldown = false, SCROLL_DELAY);
    }

    window.addEventListener("wheel", () => playSound("scroll"), { passive: true });
    window.addEventListener("touchmove", () => playSound("scroll"), { passive: true });

    window.addEventListener("keydown", (event) => {
        if (["ArrowUp", "ArrowDown", "PageUp", "PageDown"].includes(event.key)) {
            playSound("scroll");
        }
    });

    document.addEventListener("scroll", () => playSound("scroll"), { passive: true });

    document.addEventListener("submit", () => {
        chrome.runtime.sendMessage({ action: "playSound", sound: "form_submit" })
    });
}


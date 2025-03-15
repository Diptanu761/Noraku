if (!chrome.runtime?.id) {
    console.warn("❌ Extension context invalidated. Content script won't run.");
} else {
    console.log("📜 Scroll detection active!");

    let audio = document.createElement("audio");
    audio.style.display = "none";

    const bd = document.querySelector("body");
    bd.appendChild(audio);

    let scrollCooldown = false;
    let lastScrollTime = 0;
    const SCROLL_DELAY = 300;

    function playSound(soundName) {
        let now = Date.now();
        if (scrollCooldown || now - lastScrollTime < SCROLL_DELAY) return;
    
        lastScrollTime = now;
        console.log(`🔊 Playing sound: ${soundName}`);
    
        if (chrome.runtime?.id) {
            audio.src = chrome.runtime.getURL(`sounds/${soundName}.mp3`);
            audio.volume = soundName === "scroll" ? 1.0 : 0.5;

            audio.play().catch(err => {
                if (err.name !== "NotAllowedError") {
                    console.warn("⚠ Audio play failed:", err);
                }
            });
        } else {
            console.warn("⚠ Extension context invalidated. Cannot load sound.");
        }
    
        scrollCooldown = true;
        setTimeout(() => (scrollCooldown = false), SCROLL_DELAY);
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

    document.addEventListener("click", (event) => {
        const element = event.target;

        if (
            element.tagName === "INPUT" && element.type === "text" ||  // Normal input fields
            element.tagName === "INPUT" && element.type === "search" || // Search input fields
            element.tagName === "TEXTAREA" || // Multi-line text areas
            element.isContentEditable // Editable divs (like ChatGPT)
        ) {
            playSound("search_focus");
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            playSound("enter");
        }
    });

    function detectVideos(root = document) {
        root.querySelectorAll("video").forEach(video => {
            if (!video.dataset.hasListener) {
                video.dataset.hasListener = "true"; 

                video.addEventListener("play", () => playSound("video_play"));
                video.addEventListener("pause", () => playSound("video_pause"));
            }
        });
    }

    const observer = new MutationObserver(() => {
        detectVideos();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    detectVideos();

    if (window.location.hostname.includes("youtube.com")) {
        setInterval(detectVideos, 1000); 
    }

    document.addEventListener("click", () => playSound("click"));

    document.addEventListener("mouseover", (event) => {
        const element = event.target;

        if (
            element.tagName === "A" ||
            element.tagName === "BUTTON" ||
            element.hasAttribute("role") && element.getAttribute("role") === "button" ||
            element.hasAttribute("data-clickable")
        ) {
            playSound("hover");
        }
    });

    // ✅ Blocked Actions (Right-Click & Restricted Shortcuts)
    document.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        playSound("error");
    });

    document.addEventListener("keydown", (event) => {
        const blockedShortcuts = ["s", "u", "i", "j"];
        if (event.ctrlKey && blockedShortcuts.includes(event.key.toLowerCase())) {
            event.preventDefault();
            playSound("error");
        }
    });

    // ✅ Form Validation Errors
    document.addEventListener("invalid", (event) => {
        playSound("error");
    }, true);

    // ✅ Clicking Disabled Buttons
    document.addEventListener("click", (event) => {
        if (event.target.tagName === "BUTTON" && event.target.disabled) {
            playSound("error");
        }
    });

    // ✅ Download Failures
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "downloadFailed") {
            playSound("error");
        }
    });
}



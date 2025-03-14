chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "playSound") {
        let audio = new Audio(chrome.runtime.getURL(`sounds/${message.sound}.mp3`));
        audio.volume = 1.0;

        // Ensure audio plays only after user interaction
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.warn("⚠ Audio play failed, waiting for user interaction:", err);
                
                // Wait for user interaction, then play
                document.addEventListener("click", () => audio.play(), { once: true });
                document.addEventListener("keydown", () => audio.play(), { once: true });
            });
        }
    }
});


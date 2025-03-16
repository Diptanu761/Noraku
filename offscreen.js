let activeAudio = {}; // Store currently playing sounds

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "playSoundOffscreen") {  // Use "playSoundOffscreen"
        let soundPath = `sounds/${message.sound}.mp3`;
        let audio = new Audio(chrome.runtime.getURL(soundPath));

        // Ensure volume is correctly applied
        audio.volume = message.volume !== undefined ? message.volume : 0.5; // Default to 50%

        // Stop previous instance of the same sound
        if (activeAudio[message.sound]) {
            activeAudio[message.sound].pause();
            activeAudio[message.sound].currentTime = 0;
        }
        activeAudio[message.sound] = audio;

        // Handle playback restrictions
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.warn("⚠ Audio play failed, waiting for user interaction:", err);
                document.addEventListener("click", () => audio.play(), { once: true });
                document.addEventListener("keydown", () => audio.play(), { once: true });
            });
        }
    }
});

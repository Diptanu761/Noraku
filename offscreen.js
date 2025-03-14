chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "playSound") {
        let audio = new Audio(chrome.runtime.getURL(`sounds/${message.sound}.mp3`));
        audio.volume = 1.0;
        audio.play();
    }
});
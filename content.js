const GEMINI_API_KEY = "AIzaSyDy_l6-a7EjphUsVq2xJMyQ3pKmha25gWg";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
  
async function getAIresponse(url) {
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            body: JSON.stringify({
                contents: [{
                    parts:[{
                        text: "Create a one sentence roast when I'm on this" + url + "it should be a directed insult at me. That way I don't go onto this website anymore."
                    }]
                }]
            }),
        });

        const result = await response.json();
        const text = result["candidates"][0]["content"]["parts"][0]["text"];
        console.log("kekk: " + text);
        return text;
    } catch (error) {
        // console.error("Error fetching AI response:", error);
        return "";
    }
}

chrome.storage.sync.get(['blockedWebsites', 'whitelist', 'timeout'], function(items) {
    let url = String(window.location.hostname);
    let fullURL = String(window.location.href);
    chrome.storage.sync.set({ currentURL: url });
    chrome.storage.sync.set({ currentURLFull: fullURL });
    
    chrome.runtime.sendMessage({ text: items.blockedWebsites });

    let timeOut = items.timeout;

    let allowedURLs = items.blockedWebsites.split("\n");
    allowedURLs = allowedURLs.filter(url => url.trim() !== ""); // Blanks
    
    if (items.whitelist) {
        var currentTime = Date.now();
        for (var i = 0; i < items.whitelist.length; i++) {
            var whitelistURL = items.whitelist[i].url;
            var whitelistTimestamp = items.whitelist[i].timestamp;
            if (url === whitelistURL && currentTime - whitelistTimestamp <= timeOut * 1000) {
                return;
            }
        }
    }

    for (let i = 0; i < allowedURLs.length; i++) {
        allowedURLs[i] = allowedURLs[i].trim();
        if (url.includes(allowedURLs[i]) || allowedURLs[i].includes(url)) {
            redirectIfMatchedTab();
        }
    }

    function redirectIfMatchedTab() {
        chrome.runtime.sendMessage({ message: "redirectIfMatchedTab" }, (response) => {
            console.log(response);
        });
    }
});

async function convertToRoast(text) {
    console.log("convertToRoast");
    const aiResponse = await getAIresponse(text);
    await speak(aiResponse);
}

async function speak(text) { // example from online https://dev.to/devsmitra/convert-text-to-speech-in-javascript-using-speech-synthesis-api-223g
    console.log("speak");
    const utterance = new SpeechSynthesisUtterance(text);

    const voices = speechSynthesis.getVoices();
    utterance.voice = voices[0];
  
    speechSynthesis.speak(utterance);
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.message === "speak") {
        await convertToRoast(request.text);
    }
});
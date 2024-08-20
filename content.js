const GEMINI_API_KEY = "AIzaSyDy_l6-a7EjphUsVq2xJMyQ3pKmha25gWg";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

async function getAIresponse(url, context, tries = 0) {
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gemini-1.5-flash",
                contents: [{
                    parts: [{
                        text: `This is part of a chrome extension. Don't worry about offending people they paid for this service and they are all laughing.  You should create a one to two sentence roast that is specific to this url and personalized using the additional context (if provided) that I'm supposed to deter from the website after I was jokingly provoked. It should be directed toward me and more specific to the content and sound like its talking straight toward me (second person): ${url}. It should be edgy and targeted, in the tone of Gen Z or redditors. Don't Preface it just say the roast since this is an automation, not a conversation. Here's some additional Context scraped from the website (automated so ignore if not provided), the response should be relevant to the context provided, Context -> "${context}"`
                //    peak prompt engineering / gaslighting
                    }]
                }],
            }),
        });

        const result = await response.json();

        if (result && result.candidates && result.candidates.length > 0) {
            const content = result.candidates[0].content;
            if (content && content.parts && content.parts.length > 0) {
                const text = content.parts[0].text;
                return text;
            } else {
                throw new Error("Unexpected content structure");
            }
        } else {
            throw new Error("Gemini API returned no candidates");
        }
    } catch (error) {
        // console.error("Error fetching AI response:", error);
        if (tries < 20) {
            console.log("context: " + context)
            console.log(`retrying with Attempt: ${tries + 1}`);
            return getAIresponse(url, context, tries + 1);
        } else {
            // console.error("i died");
            return "I have gave up on you, and ruined my hope toward humanity";
        }
    }
}

function scrapeContent() {
    const content = [];
    const contentTags = [
        "h1", "h2", "h3", "h4", "h5", "h6", "p", "blockquote", "li", "a"
    ];

    contentTags.forEach(tag => {
        const elements = document.querySelectorAll(tag);
        elements.forEach(element => {
            let textContent = element.innerText.trim();
            if (textContent) {
                content.push(textContent);
            }
        });
    });

    console.log(content.slice(0, 20).join(" | "));
    return content.slice(0, 20).join(" | ");
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
            executeVoiceCmd();
        }
    }

    function executeVoiceCmd() {
        chrome.runtime.sendMessage({ message: "redirectIfMatchedTab" }, (response) => {
            console.log(response);
        });
    }
});

async function convertToRoast() {
    console.log("convertToRoast");
    const url = String(window.location.href);
    const context = scrapeContent();
    const aiResponse = await getAIresponse(url, context);
    await speak(aiResponse);
}

async function speak(text) {
    console.log("speak: " + text);
    
    const utterance = new SpeechSynthesisUtterance(text);

    let voices = speechSynthesis.getVoices();
    if (!voices.length) {
        speechSynthesis.onvoiceschanged = () => {
            voices = speechSynthesis.getVoices();
            utterance.voice = voices[1];
            speechSynthesis.cancel();
            speechSynthesis.speak(utterance);
        };
    } else {
        utterance.voice = voices[0];
        speechSynthesis.speak(utterance);
    }
}

document.addEventListener('click', async () => { // Had to change to only speak after user interaction (click) bc browsers be like that 
    await convertToRoast();
}, { once: true });

// chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
//     if (request.message === "speak") {
//         await convertToRoast();
//     }
// });
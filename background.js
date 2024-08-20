chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "redirectIfMatchedTab") {
        redirectIfMatchedTab();
    }
});

function redirectIfMatchedTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0) {
            const url = tabs[0].url;
            chrome.tabs.sendMessage(tabs[0].id, { message: "speak", text: url});
        } else {
            console.error("No active tabs found.");
        }
    });
}

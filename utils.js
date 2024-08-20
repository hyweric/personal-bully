export const Redirect = { 
    continueToTab() {
        chrome.storage.sync.get(['redirectWebsite'], function(items) {
            console.log(items.redirectWebsite);
            window.location.href = "https://" + items.redirectWebsite;
        });
    },
    toPrevTab() {
        chrome.storage.sync.get(['currentURL', 'currentURLFull'], function(items) {
            window.location.href = items.currentURLFull;

            var whitelist = items.whitelist || [];
            whitelist.push({
                url: items.currentURL, 
                timestamp: Date.now()
            });
            chrome.storage.sync.set({  whitelist: whitelist }); // Store in chrome storage
        });  
    },
    closeTab() {
        window.close(); // only works when directly added by add-on
    }
}
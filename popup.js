const saveOptions = () => {
    const blockedWebsites = document.getElementById('blockedWebsites').value;

    chrome.storage.sync.set(
      { blockedWebsites }, 
      () => {
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {status.textContent = '';}, 750);
      }
    );
};

// Store in chrome storage
const restoreOptions = () => {
    chrome.storage.sync.get(
        { blockedWebsites: 'Add Blocked Websites here \n Separate each one with a new line' }, 
        (items) => {
            try {
                document.getElementById('blockedWebsites').value = items.blockedWebsites || 'Add Blocked Websites here \n Separate each one with a new line';
            } catch (error) {
                console.log('Error:', error);
            }
        }
    );
};

try {
    document.addEventListener('DOMContentLoaded', restoreOptions);
    document.getElementById('save').addEventListener('click', saveOptions);
} catch (error) {
    console.log(error);
}

chrome.storage.sync.get(['blockedWebsites'], function(items) {
    chrome.runtime.sendMessage({ text: items.blockedWebsites });
});

const updateWhitelist = (whitelist) => {
    const whitelistElement = document.getElementById('whitelist');
    const sortedWhitelist = whitelist.sort((a, b) => b.timestamp - a.timestamp);
    const recentWhitelist = sortedWhitelist.slice(0, 3); // 3 most recent
    recentWhitelist.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = `${item.url} - ${new Date(item.timestamp).toLocaleString()}`;
        try {
            whitelistElement.appendChild(li);
        } catch (error) {
            console.log('Error:', error);
        }
    });
};

chrome.storage.sync.get(['whitelist'], (items) => {
    const whitelist = items.whitelist || [];
    updateWhitelist(whitelist);
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes.whitelist) {
        const whitelist = changes.whitelist.newValue || [];
        updateWhitelist(whitelist);
    }
});

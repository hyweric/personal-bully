document.getElementById('toggleButton').addEventListener('change', function() {
    let toggleSwitch = document.getElementById('toggleButton');
    let statusLabel = document.getElementById('statusLabel');

    chrome.storage.sync.get('enabled', function(items) {
        let enabled = !items.enabled; // toggle
        chrome.storage.sync.set({enabled: enabled});

        toggleSwitch.checked = enabled; //pos of switch
        statusLabel.textContent = enabled ? 'Enabled' : 'Disabled'; //status symbol text 
        // statusLabel.style.color = enabled ? '#00CC66' : 'red'; //status symbol color 
    });
});

window.onload = function() {
    let toggleSwitch = document.getElementById('toggleButton');
    let statusLabel = document.getElementById('statusLabel');

    chrome.storage.sync.get('enabled', function(items) {
        toggleSwitch.checked = items.enabled; 
        statusLabel.textContent = items.enabled ? 'Enabled' : 'Disabled'; 
        // statusLabel.style.color = items.enabled ? '#00CC66' : 'red'; 
    });
};

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

// old code might implement in some way so leaving here for now 
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
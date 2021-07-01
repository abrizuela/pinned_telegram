let currentTabId;
let currentWinId;
let telegramTabId;
let telegramWinId;
let previousTab;
let previousWin;
let telegramUrlStored;

function onError(e) {
    console.log("***Error: " + e);
};

function setButtonIcon(imageURL) {
    try {
        browser.browserAction.setIcon({ path: imageURL });
    } catch (e) {
        onError(e);
    }
};

function createPinnedTab() {
    browser.tabs.create(
        {
            url: telegramUrlStored,
            pinned: true,
            active: true
        }
    )
};

function handleSearch(telegramTabs) {
    //console.log("currentTabId: " + currentTabId);
    //console.log("currentWinId: " + currentWinId);
    if (telegramTabs.length > 0) {
        //console.log("there is a telegram tab");
        telegramTabId = telegramTabs[0].id;
        telegramWinId = telegramTabs[0].windowId;
        if (telegramTabId === currentTabId) {
            //console.log("I'm in the telegram tab");
            browser.windows.update(previousWin, { focused: true })
            browser.tabs.update(previousTab, { active: true, });
        } else {
            //console.log("I'm NOT in the telegram tab");
            previousTab = currentTabId;
            previousWin = currentWinId;
            browser.windows.update(telegramWinId, { focused: true, });
            browser.tabs.update(telegramTabId, { active: true, });
        }
        setButtonIcon(telegramTabs[0].favIconUrl);
    } else {
        //console.log("there is NO telegram tab");
        previousTab = currentTabId;
        createPinnedTab();
    }
};

function onGot(restoredSettings) {
    if (restoredSettings.telegramUrl != undefined) {
        telegramUrlStored = restoredSettings.telegramUrl;
    } else {
        telegramUrlStored = telegramUrl.WEB;
    };
    let querying = browser.tabs.query({ url: telegramUrlStored });
    querying.then(handleSearch, onError);
};

function handleClick(tab) {
    //console.log("*********Button clicked*********");
    currentTabId = tab.id;
    currentWinId = tab.windowId;
    var gettingStoredSettings = browser.storage.local.get();
    gettingStoredSettings.then(onGot, onError);
};

function update(details) {
    if (details.reason === "install" || details.reason === "update") {
        browser.runtime.openOptionsPage();
    }
};

browser.browserAction.onClicked.addListener(handleClick);
browser.runtime.onInstalled.addListener(update);

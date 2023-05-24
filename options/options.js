const commandName = '_execute_browser_action';
/* selectors */
const shortcutElem = document.querySelector('#shortcut');
const resetElem = document.querySelector('#reset')
const updatedMessage = document.querySelector("#updatedMessage");
const errorMessage = document.querySelector("#errorMessage");
const urlWeb = document.querySelector("#web");
const urlWebk = document.querySelector("#webk");
const urlWebz = document.querySelector("#webz");
const urlInputs = document.querySelectorAll("input[name='telegram_url']");
/* enum */
const telegramUrl = {
    WEB: "https://web.telegram.org/", //if replace this also do it in function onGot in background.js
    WEBK: "https://web.telegram.org/k/",
    WEBZ: "https://web.telegram.org/a/"
};

async function setUrl(restoredSettings) {
    //console.log(`telegramUrl: ${restoredSettings.telegramUrl}`);
    switch (restoredSettings.telegramUrl) {
        case telegramUrl.WEB:
            urlWeb.checked = true;
            break;
        case telegramUrl.WEBK:
            urlWebk.checked = true;
            break;
        case telegramUrl.WEBZ:
            urlWebz.checked = true;
            break;
        default:
            urlWeb.checked = true;
            break;
    }
}

/**
 * Update the UI
 */
async function updateUI() {
    let commands = await browser.commands.getAll();
    for (command of commands) {
        if (command.name === commandName) {
            shortcutElem.value = command.shortcut;
        }
    }

    var gettingStoredSettings = browser.storage.local.get();
    gettingStoredSettings.then(setUrl);
}

async function updateUIPageLoaded() {
    urlWeb.value = telegramUrl.WEB;
    urlWebk.value = telegramUrl.WEBK;
    urlWebz.value = telegramUrl.WEBZ;
    updateUI();
}

/**
 * Show (and hide) a message
 */
async function showMessage(elem) {
    elem.classList.replace("hidden", "shown");
    setTimeout(function () { elem.classList.replace("shown", "hidden"); }, 5000);
}

/**
 * Show and hide a message when the changes are saved
 */
async function msgUpdated() {
    showMessage(updatedMessage);
}

/**
 * Show an error message when the shortcut entered is invalid
 */
async function msgError() {
    showMessage(errorMessage);
}

/**
 * Update the shortcut based on the value in the textbox.
 */
async function updateShortcut() {
    if (endCaptureShortcut()) {
        await browser.commands.update({
            name: commandName,
            shortcut: shortcutElem.value
        });
        msgUpdated();
    } else {
        msgError();
    }
    updateUI();
    shortcutElem.blur();
}

/**
 * Reset the shortcut and update the textbox.
 */
async function resetShortcut() {
    await browser.commands.reset(commandName);
    updateUI();
    msgUpdated();
};

/**
 * Update the UI when the page loads.
 */
document.addEventListener('DOMContentLoaded', updateUIPageLoaded);

/**
 * Handle update and reset button clicks
 */
shortcutElem.addEventListener('focus', startCapturing);
shortcutElem.addEventListener('keydown', captureKey);
shortcutElem.addEventListener('keyup', updateShortcut);
resetElem.addEventListener('click', resetShortcut);

urlInputs.forEach(elem => {
    //console.log(elem);
    elem.onchange = () => {
        //console.log(`saving: ${elem.value}`);
        browser.storage.local.set({ telegramUrl: elem.value });
        msgUpdated();
    }
});
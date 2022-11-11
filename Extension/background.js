var websocket_my;
var websocketOk = false;
var currendState = null;
var serverVersion = null;
var api = {
    disabledDomains: [],
};

async function websocketReady() {
    return new Promise(function (resolve, reject) {
        if (typeof websocket_my !== "undefined" && websocket_my.readyState === 1) {
            // Connection is fine
            resolve();
            return;
        }
        websocket_my = new WebSocket("ws://localhost:6942");

        websocket_my.onerror = function (evt) {
            console.error(evt);
            reject("Could not connect to Server");
            websocketOk = false;
        };
        websocket_my.onopen = function (evt) {
            websocket_my.send(JSON.stringify({ action: "connect" }));
            resolve();
            websocketOk = true;
        };
        websocket_my.onmessage = function (evt) {
            var data = JSON.parse(evt.data);
            console.log(data);
        };
    });
}

function sendPresence(pres, tapInfo) {
    websocketReady().then(() => {
        pres = sanitizePresence(pres);
        pres.extId = tapInfo.extId;
        websocket_my.send(JSON.stringify(pres));
        currendState = {
            presence: pres.presence,
            tabInfo: tapInfo,
        };
    });
}

function disconnect() {
    websocketReady().then(() => {
        websocket_my.send(JSON.stringify({ action: "disconnect" }));
        currendState = null;
    });
}

var img = new Image();
img.src = chrome.extension.getURL("icons/icon16.png");
websocketReady();

browser.runtime.onMessage.addListener((message) => {
    websocket_my.send(JSON.stringify({ action: "playlist-download", urls: message }));
});

browser.browserAction.onClicked.addListener((tab) => {
    if (!websocketOk) {
        websocketReady();
    }

    if (tab.url.startsWith("https://www.epidemicsound.com/track/")) {
        websocket_my.send(JSON.stringify({ action: "track-download", url: tab.url }));
    } else {
        browser.tabs.executeScript({
            file: "page-eater.js",
        });
    }

    console.log(tab.url);
});


browser.contextMenus.create({
    id: "copy-link-to-davinci",
    title: "Import this track to DaVinci Resolve",
    contexts: ["link"],
});

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "copy-link-to-davinci" && info.linkUrl.startsWith("https://www.epidemicsound.com/track/")) {
        websocket_my.send(JSON.stringify({ action: "track-download", url: info.linkUrl }));
    }
});
(chrome.action || chrome.browserAction).onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "iconClicked" });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "downloadImage") {
    chrome.downloads.download({
      url: request.url,
      conflictAction: "uniquify",
      saveAs: true,
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    const validDomain = "parents.codmon.com";

    if (tab.url.includes(validDomain)) {
      chrome.action.setIcon({
        path: "icons/icon128.png",
        tabId: tab.id,
      });
    } else {
      chrome.action.setIcon({
        path: "icons/icon_bw128.png",
        tabId: tab.id,
      });
    }
  }
});

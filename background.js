chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "START_RECORDING_TAB") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("record.html")
    });
  }
});

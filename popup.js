document.getElementById("startBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "START_RECORDING_TAB" });
});

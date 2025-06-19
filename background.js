chrome.runtime.onMessage.addListener((message, sender, sendResponse ) => {
    if(message.action === 'START_RECORDING'){
      console.log("Phase 1 is done: step towards Media Capture")
    }
})

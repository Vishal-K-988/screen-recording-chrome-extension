document.getElementById('startBtn').addEventListener('click' , () => {
  chrome.tabs.query({
    active : true, 
    currentWindow : true
  }, 
tabs => {
  if(tabs.length === 0 ) return;

  const tabId = tabs[0].id;
  chrome.tabs.sendMessage(tabId, {
    action : 'START_RECORDING'
  }, response => {

     if (chrome.runtime.lastError) {
      console.warn('⚠️ No receiver:', chrome.runtime.lastError.message);
    } else {
      console.log('✅ Response:', response);
    }
  })
}
)
})
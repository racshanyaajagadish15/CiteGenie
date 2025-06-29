chrome.action.onClicked.addListener((tab) => {
  // Create a side panel
  chrome.windows.create({
    url: chrome.runtime.getURL('popup.html'),
    type: 'popup',
    width: 400,
    height: 600,
    left: screen.width - 400,
    top: 50
  });
});
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.scripting.executeScript({
    target: {tabId: tabs[0].id},
    function: getAuthor
  }, (results) => {
    const author = results[0].result || 'Unknown Author';
    document.getElementById('meta-author').value = author;
    generateCitation();
  });
});
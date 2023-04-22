chrome.tabs.query({}, function(tabs) {
  for (var i = 0; i < tabs.length; i++) {
    chrome.tabs.executeScript(tabs[i].id,
    {
      file: "content.js",
      allFrames: true
    });
  }
});

// This function is executed when the extension receives a message from the content script.
function onReceiveMessage(request, sender, sendResponse) {
    // Log the selected text to the console.
    console.log(request.text);
    
    // Do something with the selected text here (e.g. show a popup with an explanation, ask a question, etc.).
    
    // Send a response back to the content script.
    sendResponse({message: "Text received!"});
  }
  
  // Add a listener for incoming messages from the content script.
  chrome.runtime.onMessage.addListener(onReceiveMessage);
// import dotenv from 'dotenv';

// dotenv.config();
const apiUrl = 'https://api.openai.com/v1/chat/completions';

var txtOutput = "";

// chrome.runtime.sendMessage({ type: 'contentLoaded' }, function(response) {
//   console.log('Message sent:', response);
// });

function createHighlightDot(selection){
  var selection_coords = selection.getRangeAt(0).getBoundingClientRect();
  var text = selection.toString();

  if (text){
    console.log("Text highlighted: " + text);

    // Get URLs for the HTML and CSS files
    const startButtonsHtmlUrl = chrome.runtime.getURL("start_buttons.html");
    const startButtonsCssUrl = chrome.runtime.getURL("start_buttons.css");
    // Fetch the HTML contents and inject into the current webpage
    fetch(startButtonsHtmlUrl)
    .then(response => response.text())
    .then(data => {
      const div = document.createElement("div");
      div.innerHTML = data;
      document.body.appendChild(div);

      // Apply CSS styles to the button
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = startButtonsCssUrl;
      document.head.appendChild(link);

      const initial_dot = document.getElementById("initial_dot");
      var initialTop = selection_coords.top + window.pageYOffset - 10; //10 is to compensate for the font-size
      initial_dot.style.top = initialTop - window.scrollY + "px";
      initial_dot.style.left = (selection_coords.left + selection_coords.width - 10) + "px";
      initial_dot.classList.add('initial_dot');

      textBoxes.push([initial_dot, initialTop]);

      initial_dot.addEventListener("click", function() {
        Send(text)
        .then(() => {
          // Get URLs for the HTML and CSS files
          const responseHtmlUrl = chrome.runtime.getURL("response.html");
          const responseCssUrl = chrome.runtime.getURL("response.css");
      
          // Fetch the HTML contents and inject into the current webpage
          fetch(responseHtmlUrl)
          .then(response => response.text())
          .then(data => {
            const div = document.createElement("div");
            div.innerHTML = data;
            document.body.appendChild(div);

            const response_window = document.getElementById("response_window");
            response_window.innerHTML = txtOutput;
            var initialTop = selection_coords.top + window.pageYOffset - 10; //10 is to compensate for the font-size
            response_window.style.top = initialTop - window.scrollY + "px";
            response_window.style.left = (selection_coords.left + selection_coords.width - 10) + "px";
            response_window.classList.add('response_window');

            // Apply CSS styles to the div
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = responseCssUrl;
            document.head.appendChild(link);

            textBoxes.push([response_window, initialTop]);
          });
          
        })
        .catch(error => {
          console.log(error);
        })
      });
    });
  }
}

// Function to make an HTTP POST request to the ChatGPT API
function Send(in_message) {
  var sModel = "gpt-3.5-turbo";// "text-davinci-003";
  var iMaxTokens = 100;
  var sUserId = "1";
  var dTemperature = 0.5;    

  var data = {
      model: sModel,
      messages: [{'role':'user', 'content':in_message}],
      temperature: dTemperature
  }
  console.log("Send HTTP request");

  return new Promise((resolve, reject) => {
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Bearer " + "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"
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(oJson => {
      //console.log(oJson);

      if (oJson.error && oJson.error.message) {
          txtOutput.value += "Error: " + oJson.error.message;
      } else if (oJson.choices) {

          var s = oJson["choices"][0]["message"]["content"];

          if (s == "") {
            s = "No response";
          }
          txtOutput = s;
          console.log(s);
      }          
    })
    .then(data => resolve(data))
    .catch(error => reject(error));
  });

  //oHttp.send(JSON.stringify(data));

  //oHttp.send(JSON.stringify(data));
}


var textBoxes = []; 

// Add an event listener to the "mouseup" event on the document object to detect when the user highlights text.
var sel_string = "";
var prev_sel_string = "";
document.addEventListener("mouseup", function(event) {
    if (sel_string != ""){
      prev_sel_string = sel_string;
    }
    var selection = window.getSelection();
    sel_string = selection.toString();

    if (sel_string && selection.rangeCount > 0 && !(sel_string === prev_sel_string)) { // Check if text is highlighted
      createHighlightDot(selection);
    }
  }
);

window.addEventListener('scroll', function() {
  console.log(textBoxes.length);
  for (let i = 0; i < textBoxes.length; i++) {
    var scrollTop = window.scrollY;
    var newTop = textBoxes[i][1] - scrollTop;
    //console.log("now initial top is ", textBoxes[i][1]);
    textBoxes[i][0].style.top = newTop + 'px';
  }
});

document.addEventListener('selectionchange', function() {
  const buttons = document.querySelectorAll('.initial_dot');
  const divs = document.querySelectorAll('.response_window');

  // Check if any buttons were found
  if (buttons.length > 0) {
    // Loop through the collection of buttons and remove each button from the DOM
    buttons.forEach((button) => {
      button.remove();
    });
  } 
  if (divs.length > 0) {
    divs.forEach((div) => {
      div.remove();
    });
  }
});
  /*
  // This function is executed when the user clicks on the extension's browser action button.
  function onBrowserActionClicked(tab) {
    // Send a message to the background script to open the popup.
    chrome.runtime.sendMessage({action: "openPopup"});
  }
  
  // Add a listener for incoming messages from the background script.
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "showPopup") {
      // Display the popup on the current page.
      // You can replace this code with your own popup implementation.
      alert(request.text);
    }
  });
  
  // Add a listener for errors that occur in the content script.
  window.addEventListener("error", function(event) {
    console.error(event.error);
  });
  */
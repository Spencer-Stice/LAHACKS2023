// import dotenv from 'dotenv';
// dotenv.config();
const apiUrl = 'https://api.openai.com/v1/chat/completions';


var txtOutput = "";

// chrome.runtime.sendMessage({ type: 'contentLoaded' }, function(response) {
//   console.log('Message sent:', response);
// });

// Function to make an HTTP POST request to the ChatGPT API
function Send(in_message) {
  var sModel = "gpt-3.5-turbo";// "text-davinci-003";
  var iMaxTokens = 2048;
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
        "Authorization": "Bearer " + YOUR_API_KEY
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
document.addEventListener("mouseup", function(event) {

    var selection = window.getSelection();

    if (selection.rangeCount > 0) { // Check if text is highlighted
      var selection_coords = selection.getRangeAt(0).getBoundingClientRect();
      var text = selection.toString();
      console.log(text);
      if (text){
        console.log("Text highlighted: " + text);
        var initial_div = document.createElement("button");
        initial_div.classList.add('initial_div-class');
        initial_div.textContent = "⬤";
        initial_div.style.position = "fixed";
        initial_div.style.left = (selection_coords.left + selection_coords.width - 10) + "px";
        var initialTop = selection_coords.top + window.pageYOffset - 10; //10 is to compensate for the font-size
        console.log("initial top", initialTop);
        initial_div.style.top = initialTop - window.scrollY + "px"; //(event.pageY - window.scrollY + 10) + "px";
        initial_div.style.backgroundColor = "transparent";
        initial_div.style.border = "0";
        initial_div.style.color = "#fcca03";
        initial_div.style.textAlign = "center";
        initial_div.style.fontSize = "10px";
        
        document.body.appendChild(initial_div);
  
        textBoxes.push([initial_div, initialTop]);
    
        // Add event listener to text box to remove it when clicked
        initial_div.addEventListener("click", function() {
          initial_div.remove(); 

          Send(text)
          .then(() => {
            // Create text box for Chat-GPT response
            var response_div = document.createElement("div");
            response_div.classList.add('response_div-class');
            response_div.innerHTML = txtOutput; //"What would you like to ask about this?";
            response_div.style.position = "fixed";
            response_div.style.left = (selection_coords.left + selection_coords.width - 10) + "px";
            var initialTop = selection_coords.top + window.pageYOffset - 10;
            //console.log("initial top", initialTop);
            response_div.style.top = initialTop - window.scrollY + "px"; //(event.pageY - window.scrollY + 10) + "px";
            response_div.style.backgroundColor = "#dedede";
            response_div.style.border = "0";
            response_div.style.borderRadius = "15px";
            response_div.style.fontSize = "14px";
            response_div.style.padding = "15px";
            response_div.style.color = "#000000";
            response_div.style.maxWidth = "300px";
            response_div.style.maxHeight = "200px";
            response_div.style.overflowY = "scroll";
            response_div.style.scrollbarWidth = 'thin';
            response_div.style.scrollbarColor = 'red yellow'; // set the colors
            response_div.style.scrollbarRadius = '10px'; // set the corner radius
        
            // Append text box to document
            document.body.appendChild(response_div);
  
            textBoxes.push([response_div, initialTop]);
        
            // Add event listener to text box to remove it when clicked
            response_div.addEventListener("click", function() {
              response_div.remove();
            });  
          })
          .catch(error => {
            console.log(error);
          })
        }); 
      }
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
    const buttons = document.querySelectorAll('.initial_div-class');
    const divs = document.querySelectorAll('.response_div-class');

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

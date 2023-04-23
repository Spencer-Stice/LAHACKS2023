// import dotenv from 'dotenv';


// dotenv.config();
const apiUrl = 'https://api.openai.com/v1/chat/completions';

const YOUR_API_KEY = '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';

var txtOutput = "";

//PDF helper functions
function getText(pageNumber) {
  const loadingTask = pdfjsLib.getDocument(url);
  const loadingPage = loadingTask.promise.then(function(pdf) {
    var page = pdf.getPage(pageNumber);
    return page;
  });
  const loadingText = loadingPage.then(function(page) {
    text = page.getTextContent();
    return text;
  });
  return loadingText;
}

function cleanPageText(text) {
  var pageText = "";
  var linesArray = text.items;
  for (var line in linesArray) {
    pageText += "\n" + linesArray[line].str;
  }
  return pageText;
}

const url = window.location.href;
//Check for PDFs:
if (url.split(/[#?]/)[0].split('.').pop().trim() == "pdf") {
  //initialize pdf object
  var pdfjsLib = window['pdfjs-dist/build/pdf'];
  pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

  getText(1).then(function(text) {
    var temp = cleanPageText(text);
    console.log(temp);
  });

}
//End of PDF handling


var promise;

function onUnload() {
  // Your unloading routine code here\
  console.log('yeet');
  //window.removeEventListener('beforeunload', onUnload);

  var response_div = document.getElementsByClassName("response_div-class")[0];
  if (response_div) {
    // response_div.removeEventListener('click', function() {
    //   response_div.remove();
    // });
    response_div.remove();
  }
  var initial_div = document.getElementsByClassName("initial_div-class")[0];
  if (initial_div) {
    //initial_div.removeEventListener('click', clickButton);
    initial_div.remove();
  }
  document.removeEventListener("mouseup", mouseUp);
  window.removeEventListener('scroll', scrollEvent);
}

window.addEventListener('beforeunload', onUnload);

function queryMoment() {
  console.log('query');
  var explanation = document.getElementById("explain_button");
  if (explanation) {
    explanation.remove();
  }
  var examples = document.getElementById("examples_button");
  if (examples) {
    examples.remove();
  }

  const query_button = document.getElementById("query_button");
  const buttonRect = query_button.getBoundingClientRect();
  const parentElement = query_button.parentNode;

  const query_input = document.createElement('input');
  query_input.type = 'text';
  query_input.setAttribute("id", "query_input");
  query_input.classList.add('query_input-class');
  //query_input.textContent = "What's your question...";
  query_input.value = "What's your question....";
  query_input.style.color = "#999"; 

  query_input.addEventListener('focus', function() {
    console.log(this.value);
    if (this.value=='What\'s your question....') {
      this.value='';
    }
  });
  query_input.addEventListener('blur', function() {
    if (this.value=='') {
      this.value='What\'s your question....';
  }
  });  

  query_input.style.position = "fixed";
  query_input.style.left = buttonRect.right + 10 + "px";
  var initialTop = buttonRect.top + window.pageYOffset - 10; 
  console.log("initial top", initialTop);
  query_input.style.top = initialTop - window.scrollY + 13 + "px"; 
  //query_input.style.backgroundColor = "transparent";
  //query_input.style.border = "0";
  query_input.style.color = "#0d0c0c";
  query_input.style.textAlign = "left";
  query_input.style.fontSize = "16px";
  query_input.style.opacity = "0.8";
  query_input.style.cursor = "pointer";

  parentElement.insertBefore(query_input, query_button.nextSibling);
}


function createHighlightDot(selection){
  var selection_coords = selection.getRangeAt(0).getBoundingClientRect();
  var text = selection.toString();
  console.log(text);
  if (text){
    console.log("Text highlighted: " + text);
    var initial_div = document.createElement("button");
    initial_div.setAttribute("id", "highlight_button");
    initial_div.classList.add('initial_div-class');
    initial_div.textContent = "⬤";
    initial_div.style.position = "fixed";
    initial_div.style.left = (selection_coords.left + selection_coords.width - 13) + "px";
    var initialTop = selection_coords.top + window.pageYOffset - 18; //10 is to compensate for the font-size
    console.log("initial top", initialTop);
    initial_div.style.top = initialTop - window.scrollY + "px"; //(event.pageY - window.scrollY + 10) + "px";
    initial_div.style.backgroundColor = "transparent";
    initial_div.style.border = "0";
    initial_div.style.color = "#d94141";
    initial_div.style.textAlign = "center";
    initial_div.style.fontSize = "16px";
    initial_div.style.opacity = "0.8";
    initial_div.style.cursor = "pointer";
    initial_div.style.transition = "color .5s ease-in-out, transform .5s ease-in-out";

    initial_div.addEventListener("mouseover", function(event) {
      event.target.style.color = "#41d95f";
      event.target.style.transform = "scale(3)";
    });
    
    initial_div.addEventListener("mouseout", function(event) {
      event.target.style.color = "#d94141";
      event.target.style.transform = "scale(1)";
    });

    initial_div.addEventListener("transitionend", function() {
      promise = Send(text);

      // create new button
      var explain_button = document.createElement("button");
      explain_button.classList.add('explain_button-class');
      explain_button.setAttribute("id", "explain_button");
      explain_button.textContent = "E";
      explain_button.style.position = "fixed";

      var initialTopExplain = (parseInt(initial_div.style.top) - 30) + window.pageYOffset; 

      explain_button.style.left = (parseInt(initial_div.style.left) + initial_div.offsetWidth + 10) + "px";
      explain_button.style.top =  initialTopExplain - window.scrollY + "px";
      explain_button.style.border = "1px solid black";
      explain_button.style.backgroundColor = "black";
      explain_button.style.color = "white";
      explain_button.style.textAlign = "center";
      explain_button.style.fontSize = "16px";
      explain_button.style.cursor = "pointer";
      explain_button.style.borderRadius = "50%";
      explain_button.setAttribute("id", "explain_button");

      explain_button.style.transition = "transform .5s ease-in-out";
      explain_button.addEventListener("mouseover", function(event) {
        event.target.style.transform = "scale(1.5)";
      });
      explain_button.addEventListener("mouseout", function(event) {
        event.target.style.transform = "scale(1)";
      });
      
      var query_button = document.createElement("button");
      query_button.classList.add('query_button-class');
      query_button.setAttribute("id", "query_button");
      query_button.textContent = "?";
      query_button.style.position = "fixed";
      query_button.style.left = (parseInt(initial_div.style.left) + initial_div.offsetWidth + 10) + "px";

      var initialTopQuery = (parseInt(initial_div.style.top)) + window.pageYOffset; //initial_div.style.top + window.pageYOffset; 

      query_button.style.top = initialTopQuery - window.scrollY + "px";//initialTopQuery - window.scrollY + "px";
      query_button.style.backgroundColor = "black";
      query_button.style.color = "white";
      query_button.style.border = "1px solid black";
      query_button.style.textAlign = "center";
      query_button.style.fontSize = "16px";
      query_button.style.cursor = "pointer";
      query_button.style.borderRadius = "50%";
      query_button.setAttribute("id", "query_button");

      query_button.style.transition = "transform .5s ease-in-out";
      query_button.addEventListener("mouseover", function(event) {
        event.target.style.transform = "scale(1.5)";
      });
      query_button.addEventListener("mouseout", function(event) {
        event.target.style.transform = "scale(1)";
      });

      var examples_button = document.createElement("button");
      examples_button.classList.add('examples_button-class');
      examples_button.setAttribute("id", "examples_button");
      examples_button.textContent = "C";
      examples_button.style.position = "fixed";
      examples_button.style.left = (parseInt(initial_div.style.left) + initial_div.offsetWidth + 10) + "px";

      var initialTopExamples = (parseInt(initial_div.style.top) + 30) + window.pageYOffset; 

      examples_button.style.top = initialTopExamples - window.scrollY + "px";
      examples_button.style.backgroundColor = "black";
      examples_button.style.color = "white";
      examples_button.style.border = "1px solid black";
      examples_button.style.textAlign = "center";
      examples_button.style.fontSize = "16px";
      examples_button.style.cursor = "pointer";
      examples_button.style.borderRadius = "50%";
      examples_button.setAttribute("id", "examples_button");

      examples_button.style.transition = "transform .5s ease-in-out";
      examples_button.addEventListener("mouseover", function(event) {
        event.target.style.transform = "scale(1.5)";
      });
      examples_button.addEventListener("mouseout", function(event) {
        event.target.style.transform = "scale(1)";
      });

      textBoxes.push([explain_button, initialTopExplain]);
      textBoxes.push([query_button, initialTopQuery]);
      textBoxes.push([examples_button, initialTopExamples]);

      var element = document.getElementById("highlight_button");
      element.remove(); // FIXME: cannot read properties of null 

      query_button.addEventListener('click', function() {
        console.log('removing buttons');
        queryMoment();
      });

      // add new button to document
      console.log('adding buttons');
      document.body.appendChild(explain_button);
      document.body.appendChild(query_button);
      document.body.appendChild(examples_button);


      query_button.addEventListener('click', function() {
        console.log('removing buttons');
        queryMoment();
      })
      explain_button.addEventListener("click", function(event) {
        var element = document.getElementById("query_button");
        element.remove();
        element = document.getElementById("examples_button");
        element.remove();

        var image = document.createElement("img");
        image.src = chrome.runtime.getURL("./my_loading.gif");
        image.style.position = "fixed";
        image.style.left = (parseInt(explain_button.style.left + 5) ) + "px";
        image.style.top = (parseInt(explain_button.style.top) + 30) + "px";
        image.style.maxWidth = "20px";
        image.style.maxHeight = "20px";
        image.style.borderRadius = "10px";
        
        // add image to document
        document.body.appendChild(image);
        console.log("before promise");
        promise.then(function(){
          console.log("after promis");
          var response_div = document.createElement("div");
          response_div.classList.add('response_div-class');
          response_div.innerHTML = txtOutput; //"What would you like to ask about this?";
          response_div.style.position = "fixed";
          response_div.style.left = (parseInt(explain_button.style.left + 20) ) + "px";
          //console.log("initial top", initialTop);
          response_div.style.top = (parseInt(explain_button.style.top) + 50) + "px";
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
          console.log("this runs");
          var delete_button = document.createElement("button");
          delete_button.classList.add('delete_button-class');
          delete_button.innerHTML = "X";
          delete_button.style.position = "absolute";
          delete_button.style.top = "5px";
          delete_button.style.right = "5px";
          delete_button.style.backgroundColor = "transparent";
          delete_button.style.border = "0";
          delete_button.style.color = "red";
          delete_button.style.fontSize = "20px";
          delete_button.style.cursor = "pointer";
  
          // add event listener to delete button to remove response_div
          delete_button.addEventListener("click", function() {
              console.log("this ran");
              response_div.remove();
              delete_button.remove();
          });
          document.body.appendChild(response_div);
          response_div.insertBefore(delete_button, response_div.childNodes[0]);
        });


        

      });
    });
    document.body.appendChild(initial_div);

    textBoxes.push([initial_div, initialTop]);


    // Add event listener to text box to remove it when clicked
    initial_div.addEventListener("click", function() {
      var element = document.getElementById("highlight_button");
      console.log(element);
      element.remove();

      console.log("removed");

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
    
  

        ///////////////////////////////////////
        // create delete button
        var delete_button = document.createElement("button");
        delete_button.classList.add('delete_button-class');
        delete_button.innerHTML = "X";
        delete_button.style.position = "absolute";
        delete_button.style.top = "5px";
        delete_button.style.right = "5px";
        delete_button.style.backgroundColor = "transparent";
        delete_button.style.border = "0";
        delete_button.style.color = "red";
        delete_button.style.fontSize = "20px";
        delete_button.style.cursor = "pointer";

        // add event listener to delete button to remove response_div
        delete_button.addEventListener("click", function() {
            console.log("this ran");
            response_div.remove();
            delete_button.remove();
        });

        document.body.appendChild(response_div);

        // add delete button to response_div
        response_div.insertBefore(delete_button, response_div.childNodes[0]);

        //////////////////////////////////
        textBoxes.push([response_div, initialTop]);
    
        
      })
      .catch(error => {
        console.log(error);
      })
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
      messages: [{'role':'user', 'content':"Please explain the following to me: " + in_message}],
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

// window.addEventListener('unload', function() {
//   chrome.runtime.disconnect();
// });

var sel_string = "";
var prev_sel_string = "";
// Add an event listener to the "mouseup" event on the document object to detect when the user highlights text.
function mouseUp() {
  chrome.runtime.sendMessage({action: "getVariable"}, function(response) {
    console.log(response.variable);
    if (response.variable == 1) {    // enabled
      if (sel_string != ""){
        prev_sel_string = sel_string;
      }
      var selection = window.getSelection();
      sel_string = selection.toString();
    
    if (sel_string && selection.rangeCount > 0 && !(sel_string === prev_sel_string)) { // Check if text is highlighted
      createHighlightDot(selection);
    }}
  })
}

document.addEventListener("mouseup", mouseUp);

function scrollEvent() {
  console.log(textBoxes.length);
  for (let i = 0; i < textBoxes.length; i++) {
    var scrollTop = window.scrollY;
    var newTop = textBoxes[i][1] - scrollTop;
    //console.log("now initial top is ", textBoxes[i][1]);
    textBoxes[i][0].style.top = newTop + 'px';
  }
}

window.addEventListener('scroll', scrollEvent);




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
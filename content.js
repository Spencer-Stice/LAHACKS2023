// import dotenv from 'dotenv';


// dotenv.config();
const apiUrl = 'https://api.openai.com/v1/chat/completions';



const YOUR_API_KEY = "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";

var txtOutput = "";

var query_picked = 0;

var query_return_done;

var image = document.createElement("img");

document.addEventListener("selectionchange", function() {
  if(document.getElementById('highlight_button'))
    document.getElementById('highlight_button').remove();
});

document.addEventListener("selectionchange", function() {
  if(document.getElementById('explain_button'))
    document.getElementById('explain_button').remove();
  if(document.getElementById('query_button'))
    document.getElementById('query_button').remove();
  if(document.getElementById('examples_button'))
    document.getElementById('examples_button').remove();
  if(document.querySelectorAll('.query_input-class')){
    const query_inputs = document.querySelectorAll('.query_input-class');
    query_inputs.forEach((query_inputs) => {
      query_inputs.remove();
    });
  }
});

document.addEventListener("selectionchange", function() {
  image.style.opacity = "0";
});


//PDF helper functions
const url = window.location.href;

//Gets the text from a pdf for an input page number
//Returns a promise, with text = a raw array of the pdf lines
function getText(pageNumber) {
  const loadingTask = pdfjsLib.getDocument(url);
  const loadingPage = loadingTask.promise.then(function(pdf) {
    var page = pdf.getPage(parseInt(pageNumber));
    return page;
  });
  const loadingText = loadingPage.then(function(page) {
    text = page.getTextContent();
    return text;
  });
  return loadingText;
}

//Cleans up the raw array of pdf lines
//Returns a string
function cleanPageText(text) {
  var pageText = "";
  var linesArray = text.items;
  for (var line in linesArray) {
    pageText += "\n" + linesArray[line].str;
  }
  return pageText;
}

function stylizePdfMenuButton(initial_div) {
  initial_div.setAttribute("id", "pdfMenuButton");
  initial_div.classList.add('initial_div-class');
  initial_div.textContent = "⬤";
  initial_div.style.position = "fixed";
  
  initial_div.style.backgroundColor = "transparent";
  initial_div.style.border = "0";
  initial_div.style.color = "#d94141";
  initial_div.style.textAlign = "center";
  initial_div.style.fontSize = "16px";
  initial_div.style.opacity = "0.8";
  initial_div.style.cursor = "pointer";
  initial_div.style.transition = "color .5s ease-in-out, transform .5s ease-in-out";
}

//creates pdf menu dot
function createHighlightDotPdf() {
  var menu_div = document.createElement("button");
  menu_div.style.left = 90 + "%";
  menu_div.style.top = 10 + "%"; 
  
  stylizePdfMenuButton(menu_div);

  menu_div.addEventListener("mouseover", function(event) {
    event.target.style.color = "#41d95f";
    event.target.style.transform = "scale(3)";
  });
  
  menu_div.addEventListener("mouseout", function(event) {
    event.target.style.color = "#d94141";
    event.target.style.transform = "scale(1)";
  });

  menu_div.addEventListener("transitionend", function(event) {
    if (event.propertyName == "color"){
      menu_div.remove();
      pdfPageQuery();
    }
  });

  document.body.appendChild(menu_div);
}

function stylizePdfPageQuery(box) {
  box.style.position = "fixed";
  box.style.left = 80 + "%";
  box.style.top = 10 + "%"; 
  box.style.color = "#0d0c0c";
  box.style.textAlign = "left";
  box.style.fontSize = "9px";
  box.style.opacity = "1";
  box.style.cursor = "pointer";
  box.style.resize = "none";
  box.style.overflow = "hidden";
  box.style.borderRadius = "15px";
  box.style.padding = "15px";
  box.style.maxHeight = "200px";
  box.style.overflowY = "scroll";
  box.style.width = "200px";
  box.style.height = "10px";
}

//creates a textbox to input which page the user would like explained
function pdfPageQuery() {
    const query_input = document.createElement('input');
    query_input.type = 'text';
    query_input.setAttribute("id", "query_input");
    query_input.classList.add('query_input-class');
    query_input.value = "Which page would you like to know more about?";
    query_input.style.color = "#999"; 
  
    query_input.addEventListener('focus', function() {
      console.log(this.value);
      if (this.value=='Which page would you like to know more about?') {
        this.value='';
      }
    });
    query_input.addEventListener('blur', function() {
      if (this.value=='') {
        this.value='Which page would you like to know more about?';
    }
    });  
  
    stylizePdfPageQuery(query_input);
  
    var height = 10;
    var level = 1;
  
    query_input.addEventListener('input', () => {
      if ((query_input.value.length / level) > 25) {
          height += 10;
          level += 1
          query_input.style.height = height + 'px';
          query_input.value += "\n";
      }
    });

    query_input.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        // Enter key was pressed

        const query_return_done = getText(query_input.value).then(function(text) {
          var message_to_send = cleanPageText(text);
          return Send(message_to_send, 1);
        });
  
        query_return_done.then(function(){
          handleResponse(parseInt(query_input.style.left), parseInt(query_input.style.top) + 60);
          query_input.remove();
          createHighlightDotPdf();
        });
      }
    });

    document.body.appendChild(query_input);

}

//Check for PDFs:
if (url.split(/[#?]/)[0].split('.').pop().trim() == "pdf") {
  //initialize pdf object
  var pdfjsLib = window['pdfjs-dist/build/pdf'];

  //create pdf dot
  createHighlightDotPdf();


  /*getText(1).then(function(text) {
    var temp = cleanPageText(text);
    createHighlightDotPdf(temp);
  });*/

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

function queryMoment(selectedText) {
  query_picked = 1;
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

  // create a new textarea element
  var textarea = document.createElement("textarea");

  // set the id and name attributes
  textarea.id = "input-field";
  textarea.name = "input-field";

  
  // set the number of rows
  textarea.style.maxHeight = "100px";
  textarea.style.padding = "10px";
  textarea.style.fontFamily = "Arial, sans-serif";
  textarea.style.border = "0";
  textarea.style.backgroundColor = "#dedede";
  textarea.rows = "2";
  textarea.addEventListener('input', function() {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  });

  const query_input = document.createElement('input').appendChild(textarea);
  query_input.type = 'text';
  query_input.setAttribute("id", "query_input_");
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

  var left = buttonRect.right + 10;
  var top = buttonRect.top + window.pageYOffset - 10 + 13;

  if (left / window.screen.width > 0.9) {
    left = window.screen.width - 300;
    top += 40;
    console.log("off the screen");
  }

  query_input.style.position = "fixed";
  query_input.style.left = left + "px";
  var initialTopQueryInput = top; 
  console.log("initial top", initialTopQueryInput);
  query_input.style.top = initialTopQueryInput - window.scrollY + "px"; 
  //query_input.style.backgroundColor = "transparent";
  //query_input.style.border = "0";
  query_input.style.display = "flex";
  query_input.style.flexDirection = "column";
  query_input.style.alignItems = "flex-start";
  query_input.style.marginBottom = "10px";
  query_input.style.width = "300px";
  query_input.style.minHeight = "10px";
  query_input.style.height = "auto";
  query_input.style.resize = "vertical";
  query_input.style.borderRadius = "10px";
  query_input.style.color = "black";
  query_input.classList.add('query_input-class');

  query_input.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      // Enter key was pressed
      const inputValue = query_input.value;
      console.log(selectedText);
      console.log(inputValue);
      var message_to_send = "I have a question about the following: " + selectedText + "Please tell me: " + inputValue;
      console.log(message_to_send);

      console.log("trying to add loading image");
      var load = document.createElement("img");
      load.src = chrome.runtime.getURL("./my_loading.gif");
      load.style.position = "fixed";
      load.style.opacity = "1";
      load.style.left = (parseInt(query_input.style.left) + 130 ) + "px";
      load.style.top = (parseInt(query_input.style.top) - 20) + "px";
      load.style.maxWidth = "20px";
      load.style.maxHeight = "20px";
      load.style.borderRadius = "10px";
      document.body.appendChild(load);


      query_return_done = Send(message_to_send, 2);

      

      query_return_done.then(function(){
        load.style.opacity = "0";
        handleResponse(parseInt(query_input.style.left), parseInt(query_input.style.top) + 60);
        query_input.style.left = 999999 + "px";
        });
    }
  });

  parentElement.insertBefore(query_input, query_button.nextSibling);

  textBoxes.push([query_input, initialTopQueryInput]);

}

function createHighlightDot(selection) {
  var initial_div = document.createElement("button");
  var selection_coords = selection.getRangeAt(0).getBoundingClientRect();
  initial_div.style.left = (selection_coords.right - 13) + "px";
  initial_div.style.top = selection_coords.top + window.pageYOffset - 18 - window.scrollY + "px"; 

  var text = selection.toString();

  createHighlightDotMain(initial_div, text);
}

function stylizeInitialDiv(initial_div) {
  initial_div.setAttribute("id", "highlight_button");
  initial_div.classList.add('initial_div-class');
  initial_div.textContent = "⬤";
  initial_div.style.position = "fixed";
  
  initial_div.style.backgroundColor = "transparent";
  initial_div.style.border = "0";
  initial_div.style.color = "#d94141";
  initial_div.style.textAlign = "center";
  initial_div.style.fontSize = "16px";
  initial_div.style.opacity = "0.8";
  initial_div.style.cursor = "pointer";
  initial_div.style.transition = "color .5s ease-in-out, transform .5s ease-in-out";
}

function stylizeOptionDiv(div) {
  div.style.border = "1px solid black";
  div.style.backgroundColor = "black";
  div.style.color = "white";
  div.style.textAlign = "center";
  div.style.fontSize = "16px";
  div.style.cursor = "pointer";
  div.style.borderRadius = "50%";
  div.style.position = "fixed";
  div.style.transition = "transform .5s ease-in-out";

  div.addEventListener("mouseover", function(event) {
    event.target.style.transform = "scale(1.5)";
  });
  div.addEventListener("mouseout", function(event) {
    event.target.style.transform = "scale(1)";
  });
}

function createHighlightDotMain(initial_div, text){
  var initialTop = parseInt(initial_div.style.top) + window.scrollY; //(event.pageY - window.scrollY + 10) + "px";

  if (text){
    
    stylizeInitialDiv(initial_div);
    
    initial_div.addEventListener("mouseover", function(event) {
      event.target.style.color = "#41d95f";
      event.target.style.transform = "scale(3)";
    });
    
    initial_div.addEventListener("mouseout", function(event) {
      event.target.style.color = "#d94141";
      event.target.style.transform = "scale(1)";
    });

    initial_div.addEventListener("transitionend", function(event) {
      if (initial_div.style.transform === "scale(3)" && event.propertyName === 'color') {
      promise = Send(text, 1);
      promise_examples = Send(text, 0)

      // create new button
      var explain_button = document.createElement("button");
      explain_button.classList.add('explain_button-class');
      explain_button.setAttribute("id", "explain_button");
      explain_button.textContent = "E";
      stylizeOptionDiv(explain_button);
      explain_button.style.left = (parseInt(initial_div.style.left) + initial_div.offsetWidth + 10) + "px";

      var initialTopExplain = (parseInt(initial_div.style.top) - 30) + window.pageYOffset; 
      explain_button.style.top =  initialTopExplain - window.scrollY + "px";
      
      var query_button = document.createElement("button");
      query_button.classList.add('query_button-class');
      query_button.setAttribute("id", "query_button");
      query_button.textContent = "?";
      stylizeOptionDiv(query_button);
      query_button.style.left = (parseInt(initial_div.style.left) + initial_div.offsetWidth + 10) + "px";

      var initialTopQuery = (parseInt(initial_div.style.top)) + window.pageYOffset; //initial_div.style.top + window.pageYOffset; 
      query_button.style.top = initialTopQuery - window.scrollY + "px";//initialTopQuery - window.scrollY + "px";

      var examples_button = document.createElement("button");
      examples_button.classList.add('examples_button-class');
      examples_button.setAttribute("id", "examples_button");
      examples_button.textContent = "C";
      stylizeOptionDiv(examples_button);
      examples_button.style.left = (parseInt(initial_div.style.left) + initial_div.offsetWidth + 10) + "px";

      var initialTopExamples = (parseInt(initial_div.style.top) + 30) + window.pageYOffset; 
      examples_button.style.top = initialTopExamples - window.scrollY + "px";

      textBoxes.push([explain_button, initialTopExplain]);
      textBoxes.push([query_button, initialTopQuery]);
      textBoxes.push([examples_button, initialTopExamples]);

      var element = document.getElementById("highlight_button");

      element.remove(); // FIXME: cannot read properties of null 

      query_button.addEventListener('click', function() {
        console.log("creating query text");
        queryMoment(text);
      });

      // add new button to document
      console.log('adding buttons');
      document.body.appendChild(explain_button);
      document.body.appendChild(query_button);
      document.body.appendChild(examples_button);


      explain_button.addEventListener("click", function(event) {
        query_picked = 0;
        var element = document.getElementById("query_button");
        element.remove();
        element = document.getElementById("examples_button");
        element.remove();

        image.src = chrome.runtime.getURL("./my_loading.gif");
        image.style.position = "fixed";
        image.style.opacity = "1";
        image.style.left = (parseInt(explain_button.style.left + 5) ) + "px";
        image.style.top = (parseInt(explain_button.style.top) + 30) + "px";
        image.style.maxWidth = "20px";
        image.style.maxHeight = "20px";
        image.style.borderRadius = "10px";
        
        // add image to document
        document.body.appendChild(image);
        console.log("before promise");
        promise.then( function () {
          console.log("after promis");
          if(query_picked !== 1){
            image.style.opacity = "0";
            console.log("opacity 0");
          }
          var element = document.getElementById("explain_button");
          element.remove();
          handleResponse(parseInt(explain_button.style.left + 100), parseInt(explain_button.style.top) + 50);
        }
        )
      });

      examples_button.addEventListener("click", function(event) {
        query_picked = 0;
        var element = document.getElementById("query_button");
        element.remove();
        element = document.getElementById("explain_button");
        element.remove();

        image.src = chrome.runtime.getURL("./my_loading.gif");
        image.style.position = "fixed";
        image.style.opacity = "1";
        image.style.left = (parseInt(examples_button.style.left + 5) ) + "px";
        image.style.top = (parseInt(examples_button.style.top) + 30) + "px";
        image.style.maxWidth = "20px";
        image.style.maxHeight = "20px";
        image.style.borderRadius = "10px";
        
        // add image to document
        document.body.appendChild(image);
        console.log("before promise");
        promise_examples.then(function(){
          console.log("after promis");
          if(query_picked !== 1){
            image.style.opacity = "0";
            console.log("opacity 0");
          }
          var element = document.getElementById("examples_button");
          element.remove();
          handleResponse(parseInt(examples_button.style.left + 100), parseInt(explain_button.style.top) + 50);
        });


        

      });


    }
    });
    document.body.appendChild(initial_div);

    textBoxes.push([initial_div, initialTop]);

  }
}

function handleResponse(left, top) {
    // Create text box for Chat-GPT response
    console.log("handle requests ran");
    console.log(left, window.screen.width);
    if (left / window.screen.width > 0.9) {
      left -= 150;
      top += 20;
      console.log("off the screen");
    }
    var response_div = document.createElement("div");
    response_div.classList.add('response_div-class');
    response_div.innerHTML = txtOutput; 
    response_div.style.position = "fixed";
    response_div.style.left = left + "px"; // (selection_coords.left + selection_coords.width - 10) + "px";
    var initialTop = top + window.pageYOffset;
    //console.log("initial top", initialTop);
    //console.log("scroll", window.scrollY);
    response_div.style.top = initialTop - window.scrollY + "px"; //initialTop - window.scrollY + "px"; 
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
    delete_button.innerHTML = "×";
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

    console.log("adding response div");
    document.body.appendChild(response_div);
    console.log("add response div");
    // add delete button to response_div
    response_div.insertBefore(delete_button, response_div.childNodes[0]);

    //////////////////////////////////
    textBoxes.push([response_div, initialTop]);  
}

// Function to make an HTTP POST request to the ChatGPT API
function Send(in_message, type) {

  var sModel = "gpt-3.5-turbo";// "text-davinci-003";
  var iMaxTokens = 100;
  var sUserId = "1";
  var dTemperature = 0.5;    
  var message_list = [];
  if(type === 0){
    message_list = [{'role':'user', 'content':"Please give me 3 examples of the following: " + in_message}];
  }
  else if(type === 1){
    message_list = [{'role':'user', 'content':"Please explain this to me in simple terms: " + in_message + ". I don't completely understand"}];
  }
  else{
    message_list = [{'role':'user', 'content':in_message}];
  }
  var data = {
      model: sModel,
      messages: message_list,
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
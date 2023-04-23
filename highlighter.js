export function createHighlighter(selection) {
    if (selection.rangeCount > 0) { // Check if text is highlighted
        var selection_coords = selection.getRangeAt(0).getBoundingClientRect();
        var text = selection.toString();
        console.log(text);
        if (text){
          console.log("Text highlighted: " + text);
          console.log("this is from another js file")
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
      }
    }
  }
  
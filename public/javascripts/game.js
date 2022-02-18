const INPUT_ID = "guess";
const FOCUS_CLASS = "focus";

function select (_this) {
    var place = (_this.id).replace(/\D/g,'');

    removeHighlight()
    _this.classList.add(FOCUS_CLASS);

    var elem = document.getElementById(INPUT_ID);
    elem.focus();
    elem.setSelectionRange(place, place);
}

function inputEntered(_this) {
    // _this.value = _this.value.replace(/^\D/g, "")
    updateUi(_this.value)
    updateHighlight()
}

function updateUi(string) {
    var i = 0;
    var elem = document.getElementById("select" + i);
    while (elem != null) {
        if (i < string.length) {
            elem.innerHTML = string[i];
        } else {
            elem.innerHTML = "";
        }
        var elem = document.getElementById("select" + ++i);
    }
}

function removeNext (_this, event) {
    // if letter or space
    if ((event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 32) {
        var elem = document.getElementById(_this.id);
        var original = elem.selectionEnd;
        if (elem.selectionEnd < elem.value.length && elem.selectionStart == elem.selectionEnd) {
            elem.value = elem.value.slice(0, elem.selectionEnd) + elem.value.slice(elem.selectionEnd + 1, elem.value.length);
            elem.setSelectionRange(original, original);
        }
    }
}

function updateHighlight() {
    removeHighlight()
    var input = document.getElementById(INPUT_ID);
    var elem = document.getElementById("select" + (Math.min(input.selectionEnd)));
    if (elem != null) {
        elem.classList.add(FOCUS_CLASS);
    }
}

function removeHighlight() {
    elements=document.getElementsByClassName(FOCUS_CLASS)

    for(element of elements){
        element.classList.remove(FOCUS_CLASS)
    }
}

function press (e) {
    console.log("Press")
    e.preventDefault();
    cur_focus = document.activeElement;
    cur_focus.innerHTML = _this.value;
    var next = cur_focus;
    while (next = next.nextElementSibling) {
        if (next == null)
            break;
        if (next.tagName.toLowerCase() === "input") {
            next.focus();
            break;
        }
    }
}

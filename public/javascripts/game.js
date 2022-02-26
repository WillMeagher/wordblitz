const INPUT_ID = "guess";
const FOCUS_CLASS = "focus";
const CUR_INPUT_CLASS = "cur-input";
const FORM_ID = "answer-form";
var caret_place = 0;

// on actual keyboard keypress
document.addEventListener('keydown', function (event) {
    var key = event.key;
    enterInput(key);
});

// on onscreen keyboard keypress
function onClickKey (_this) {
    if (_this.firstChild && _this.firstChild.nodeName == "I") {
        if (_this.firstChild.classList.contains("fa-level-down-alt")) {
            document.getElementById(FORM_ID).submit();
        } else {
            enterInput("Backspace");
        }
    } else if (caret_place < getStrLen()) {
        var character = ((_this.innerHTML == "_") ? " " : _this.innerHTML);
        enterInput(character);
    }
}

// on word spot click
function onClickSelect (_this) {
    caret_place = (_this.id).replace(/\D/g,'');
    removeHighlight()
    _this.classList.add(FOCUS_CLASS);
}

function getStrLen() {
    return document.getElementsByClassName(CUR_INPUT_CLASS).length;
}

function removeNextChar() {
    var elem = document.getElementById(INPUT_ID);
    if (caret_place < elem.value.length) {
        elem.value = elem.value.slice(0, caret_place) + elem.value.slice(caret_place + 1, elem.value.length);
    }
}

function updateBoxContent() {
    var i = 0;
    var cur_guess = document.getElementById(INPUT_ID).value;
    var elem = document.getElementById("select" + i);
    while (elem != null) {
        if (i < cur_guess.length) {
            elem.innerHTML = cur_guess[i];
        } else {
            elem.innerHTML = "";
        }
        var elem = document.getElementById("select" + ++i);
    }
}

function updateHighlight() {
    removeHighlight()
    var elem = document.getElementById("select" + caret_place.toString());
    if (elem != null) {
        elem.classList.add(FOCUS_CLASS);
    }
}

function removeHighlight() {
    elements = document.getElementsByClassName(FOCUS_CLASS)

    for(element of elements){
        element.classList.remove(FOCUS_CLASS)
    }
}

function addCharacterAt(character, place) {
    var input_element = document.getElementById(INPUT_ID);
    var cur_string = input_element.value;
    new_string = cur_string.substring(0, place) + character + cur_string.substr(place);
    input_element.value = new_string;
    return new_string;
}

function enterInput(key) {

    if (key.match(/^[a-z ]$/g)) { 
        // character or space
        if (caret_place < getStrLen()) {
            removeNextChar();
            addCharacterAt(key, caret_place);
            caret_place = parseInt(caret_place, 10) + 1;
        }
    } else if (key == "Backspace") { 
        // backspace
        if (caret_place > 0) {
            caret_place = parseInt(caret_place, 10) - 1;
            removeNextChar();
            addCharacterAt(" ", caret_place);
        }
    } else if (key == "Delete") { 
        // delete
        if (caret_place < getStrLen()) {
            removeNextChar();
            addCharacterAt(" ", caret_place);
            caret_place = parseInt(caret_place, 10) + 1;
        }
    } else if (key == "ArrowLeft") {
        if (caret_place > 0) {
            caret_place = parseInt(caret_place, 10) - 1;
        }
    } else if (key == "ArrowRight") {
        if (caret_place < getStrLen()) {
            caret_place = parseInt(caret_place, 10) + 1;
        }
    }

    updateBoxContent();
    updateHighlight();
    console.log(caret_place);

    var input_element = document.getElementById(INPUT_ID);
    var cur_string = input_element.value;
    console.log(cur_string);
}
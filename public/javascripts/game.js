const INPUT_ID = "guess";
const FOCUS_CLASS = "focus";
const CUR_INPUT_CLASS = "cur-input";
const FORM_ID = "answer-form";

document.addEventListener('keydown', function (event) {
    var input_element = document.getElementById(INPUT_ID);
    if (document.activeElement != input_element && ((event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 32 || event.keyCode == 46 || event.keyCode == 8)) { 
        var caret_place = input_element.selectionEnd;
        input_element.focus();
        input_element.setSelectionRange(caret_place, caret_place);
        onKeyDownGuess(event);
    }
});

function getStrLen() {
    return document.getElementsByClassName(CUR_INPUT_CLASS).length;
}

function onClickSelect (_this) {
    var caret_place = (_this.id).replace(/\D/g,'');

    removeHighlight()
    _this.classList.add(FOCUS_CLASS);

    var elem = document.getElementById(INPUT_ID);
    elem.focus();
    elem.setSelectionRange(caret_place, caret_place);
}

function inputEntered(_this) {
    _this.value = _this.value.replace(/[^a-z ]/g, "")
    updateBoxContent()
    updateHighlight()
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

function onKeyDownGuess(event) {
    var input_element = document.getElementById(INPUT_ID);
    var caret_place = input_element.selectionEnd;

    if ((event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 32) { 
        // character or space
        if (caret_place < getStrLen()) {
            removeNextChar();
            addCharacterAt(event.key, caret_place);
            input_element.focus();
            input_element.setSelectionRange(caret_place + 1, caret_place + 1);
        } else {
            input_element.focus();
            input_element.setSelectionRange(caret_place, caret_place);
        }
        event.preventDefault();
    } else if (event.keyCode == 8) { 
        // backspace
        backspace();
        event.preventDefault();
    } else if (event.keyCode == 46) { 
        // delete
        if (caret_place < getStrLen()) {
            removeNextChar();
            addCharacterAt(" ", caret_place);
            input_element.focus();
            input_element.setSelectionRange(caret_place + 1, caret_place + 1);
        } else {
            input_element.focus();
            input_element.setSelectionRange(caret_place, caret_place);
        }
        event.preventDefault();
    }

    // TODO add support for arrow keys just move caret_place +-1 if not at end
}

function removeNextChar() {
    var elem = document.getElementById(INPUT_ID);
    var caret_place = elem.selectionEnd;
    if (caret_place < elem.value.length && elem.selectionStart == caret_place) {
        elem.value = elem.value.slice(0, caret_place) + elem.value.slice(caret_place + 1, elem.value.length);
        elem.setSelectionRange(caret_place, caret_place);
    }
}

function backspace() {
    var input_element = document.getElementById(INPUT_ID);
    var caret_place = input_element.selectionEnd;
    if (caret_place != 0) {
        input_element.value = input_element.value.slice(0, input_element.selectionEnd - 1) + " " + input_element.value.slice(input_element.selectionEnd, input_element.value.length);
        input_element.focus();
        input_element.setSelectionRange(caret_place - 1, caret_place - 1);
    }
}

function updateHighlight() {
    removeHighlight()
    var input = document.getElementById(INPUT_ID);
    var elem = document.getElementById("select" + input.selectionEnd);
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

function onClickKey (_this) {
    var input_element = document.getElementById(INPUT_ID);
    var caret_place = input_element.selectionEnd;

    if (_this.firstChild && _this.firstChild.nodeName == "I") {
        if (_this.firstChild.classList.contains("fa-level-down-alt")) {
            document.getElementById(FORM_ID).submit();
        } else {
            backspace();
        }
    } else if (caret_place < getStrLen()) {
        var character = ((_this.innerHTML == "_") ? " " : _this.innerHTML);
        removeNextChar();
        addCharacterAt(character, caret_place);
        input_element.focus();
        input_element.setSelectionRange(caret_place + 1, caret_place + 1);
    } else {
        input_element.focus();
        input_element.setSelectionRange(caret_place, caret_place);
    }

    updateBoxContent();
    updateHighlight();
}

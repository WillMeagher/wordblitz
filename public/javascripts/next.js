function next (_this) {
    _this.value = _this.value.replace(/[^a-z ]/, '')
    if (_this.value.length >= parseInt(_this.attributes["maxlength"].value, 10)) {
        var next = _this.nextElementSibling;
        if (next.tagName.toLowerCase() === "input" && next.type.toLowerCase() !== "submit") {
            next.click();
        }
    }
    // Move to previous field if empty (user pressed backspace)
    else if (_this.value.length === 0 && _this !== _this.parentNode.firstChild) {
        var previous = _this.previousElementSibling;
        if (previous.tagName.toLowerCase() === "input") {
            previous.click();
        }   
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

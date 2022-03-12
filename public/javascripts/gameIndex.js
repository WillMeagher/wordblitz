const GAME_TYPE_ID = "game-type";
const WORD_LEN_ID = "word-len";
const LEFT_TYPE_ARROW_ID = "left-type-arrow";
const RIGHT_TYPE_ARROW_ID = "right-type-arrow";
const LEFT_LEN_ARROW_ID = "left-len-arrow";
const RIGHT_LEN_ARROW_ID = "right-len-arrow";
const DESCRIPTION_ID = "description";
var cur_len = consts.DEFAULT_WORD_LEN;
var cur_type = consts.DEFAULT_GAME_TYPE;

function updateType() {
    var type = document.getElementById(GAME_TYPE_ID);
    type.innerHTML = cur_type[0].toUpperCase() + cur_type.substring(1);
    var description = document.getElementById(DESCRIPTION_ID);
    description.innerHTML = consts.DESCRIPTIONS[cur_type];
}

function updateLen() {
    var elem = document.getElementById(WORD_LEN_ID);
    elem.innerHTML = cur_len + " Letter";
}

function decreaseType() {
    var cur_index = consts.GAME_TYPES.indexOf(cur_type);
    if (cur_index != 0) {
        cur_type = consts.GAME_TYPES[cur_index - 1];
    }

    var right = document.getElementById(RIGHT_TYPE_ARROW_ID);
    right.style.visibility = "visible";

    if (cur_index - 1 == 0) {
        var left = document.getElementById(LEFT_TYPE_ARROW_ID);
        left.style.visibility = "hidden";
    }

    updateType();
}

function increaseType() {
    var cur_index = consts.GAME_TYPES.indexOf(cur_type);
    if (cur_index != consts.GAME_TYPES.length - 1) {
        cur_type = consts.GAME_TYPES[cur_index + 1];
    }

    var left = document.getElementById(LEFT_TYPE_ARROW_ID);
    left.style.visibility = "visible";

    if (cur_index + 1 == consts.GAME_TYPES.length - 1) {
        var right = document.getElementById(RIGHT_TYPE_ARROW_ID);
        right.style.visibility = "hidden";
    }

    updateType();
}

function decreaseLen() {
    if (cur_len != consts.MIN_WORD_LEN) {
        cur_len = cur_len - 1;
    }

    var right = document.getElementById(RIGHT_LEN_ARROW_ID);
    right.style.visibility = "visible";

    if (cur_len == consts.MIN_WORD_LEN) {
        var left = document.getElementById(LEFT_LEN_ARROW_ID);
        left.style.visibility = "hidden";
    }

    updateLen();
}

function increaseLen() {
    if (cur_len != consts.MAX_WORD_LEN) {
        cur_len = cur_len + 1;
    }

    var left = document.getElementById(LEFT_LEN_ARROW_ID);
    left.style.visibility = "visible";

    if (cur_len == consts.MAX_WORD_LEN) {
        var right = document.getElementById(RIGHT_LEN_ARROW_ID);
        right.style.visibility = "hidden";
    }

    updateLen();
}

function play() {
    document.location.href="/game/" + cur_type + "/" + cur_len;
}

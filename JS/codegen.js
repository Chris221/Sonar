var tree;
var code = [];
var cErrors = 0;
var cWarnings = 0;
var staticData = new StaticData();
var codeString = "";
var heap = [];
var heapAddress = 256;

var MAX = 256;
var TEMPORARY_ADDRESS = "X1";
var SECONDARY_TEMPORARY_ADDRESS = "X2";
var trueAddress = "FB";
var falseAddress = "F5";

function gen(ast) {
    tree = ast;
    code = [];
    cErrors = 0;
    cWarnings = 0;
    staticData = new StaticData();
    codeString = "";
    heap = [];
    heapAddress = 256;

    generate();

    return codeString;
}

//Sets the code log
function codeLog(text, override = false) {
    //Appends new logging to current log
    var lText = $('#Lexer_log').val() + "#CODEGEN -- " + text + "\n";
    //if verbose mode
    if (!override) {
        if (!verbose) {
            //stops from ouputing
            text = "DO NOT OUTPUT";
        }
    }
    //if not supposed to be output
    if (text == "DO NOT OUTPUT") {
        //No need to change
        lText = $('#Lexer_log').val();
    }
    //Sets the Log
    $('#Lexer_log').text(lText);
}

function generate() {
    trueAddress = numtoHex(addToHeap('true'));
    falseAddress = numtoHex(addToHeap('false'));
    traverseTree(ast.root, 0);
    addHex(breakOp);

    codeLog("Getting the Code...");
    codeLog("Taking the Heap...");
    codeLog("Putting them together with 00s...");
    for (var i = code.length; i < MAX - heap.length; i++) {
        code.push("00");
    }
    for (var i = 0; i < heap.length; i++) {
        code.push(heap[i])
    }

    codeString = code.join(' ');
}

/* ----------------------------------------- Hex Related Functions ----------------------------------------- */
// Adds padding to a word to ensure that it is of the specified size
function pad(word, size, padder) {
    var paddedWord = "" + word;
    while (paddedWord.length < size) {
        paddedWord = padder + paddedWord;
    }
    return paddedWord;
}

// Converts a string to hexidecimal
function toHexidecimal(str) {
    return str.toString(16);
}

function addHex(val) {
    code.push(val);
    if (verbose) {
        codeLog("Pushing [ " + val + " ] byte to memory...");
    }
}

function toHex(val) {
    return pad(toHexidecimal(val.charCodeAt(0)), 2, '0').toUpperCase();
 }
 
  function numtoHex(val) {
    return pad(toHexidecimal(parseInt(val)), 2, '0').toUpperCase();
 }
 /* --------------------------------------- End Hex Related Functions --------------------------------------- */

function traverseTree(pos, depth) {
    if (pos.name == "Root")
            cRoot(pos.children, depth);
        else if (pos.name.includes("Program"))
            cProgram(pos.children, depth);
        else if (pos.name == "Block")
            cBlock(pos, depth);
        else if (pos.name == "VarDecl")
            cVarDecl(pos, depth);
        else if (pos.name == "AssignmentStatement")
            cAssign(pos, depth);
        else if (pos.name == "Print")
            cPrint(pos, depth);
        else if (pos.name == "IfStatement")
            cIf(pos, depth);
        else if (pos.name == "WhileStatement")
            cWhile(pos, depth);
        else if (pos.name == "Equality")
            cEquality(pos, depth);
        else if (pos.name == "Inequality")
            cInequality(pos, depth);
        else if (pos.name == "true" || pos.name == "false")
            cBool(pos, depth);
        else if (pos.type == "CHARLIST")
            cString(pos, depth);
        else if ("abcdefghijklmnopqrstuvwxyz".includes(pos.name))
            cID(pos, depth);
        else if ("0123456789".includes(pos.name))
            cDigit(pos, depth);
        else if (pos.name == "Addition") {
            return cAddition(pos, depth);
        } else {
            for (var i = 0; i < pos.children.length; i++) {
                //moves deeper on each one
                traverseTree(pos.children[i], depth);
            }
        }
}

function cRoot(pos, depth) {
    //loops through the level
    for (var i = 0; i < pos.length; i++) {
        //moves deeper on each one
        traverseTree(pos[i], depth);
    }
}

function cProgram(pos, depth) {
    //loops through the level
    for (var i = 0; i < pos.length; i++) {
        //moves deeper on each one
        traverseTree(pos[i], depth);
    }
}

function cBlock(pos, depth) {
    //Generating
    codeLog("Generating [ Block ] on line " + pos.line + "..");
    //enter scope
    codeLog("Entering Scope [ "+pos.scope+" ]..");
    if (verbose) {
        codeLog("Found [ " + pos.name + " ] on line " + pos.line + " in scope " + pos.scope + "...");
    }
    //loops through the level
    for (var i = 0; i < pos.children.length; i++) {
        //moves deeper on each one
        traverseTree(pos.children[i], depth + 1);
    }
    //Out of scope
    codeLog("Leaving Scope [ "+pos.scope+" ]..");
    //Finished
    codeLog("Finished [ Block ] on line " + pos.line + "..");
}

function cAddition(pos, depth) {
    //Generating
    codeLog("Generating [ Addition ] on line " + pos.line + "..");

    traverseTree(pos.children[0], depth);
    addHex(storeAccInMemo);
    addHex(TEMPORARY_ADDRESS);
    addHex('XX');
    addHex(loadAccWithConst);
    addHex(numtoHex(pos.children[0].name));
    addHex(addWithCarry);
    addHex(TEMPORARY_ADDRESS);
    addHex('XX');

    //Finished
    codeLog("Finished [ Addition ] on line " + pos.line + "..");
}

function cVarDecl(pos, depth) {
    //Generating
    codeLog("Generating [ Declaration ] on line " + pos.line + "..");

    addHex(loadAccWithConst);
    addHex('00');
    var address = staticData.add(pos.children[0], depth);
    addHex(storeAccInMemo);
    addHex(address);
    addHex('XX');

    //Finished
    codeLog("Finished [ Declaration ] on line " + pos.line + "..");
}

function cAssign(pos, depth) {
    //Generating
    codeLog("Generating [ Assignment ] on line " + pos.line + "..");

    traverseTree(pos.children[1], pos.scope);
    var address = staticData.get(pos.children[0], depth);
    addHex(storeAccInMemo);
    addHex(address);
    addHex('XX');

    //Finished
    codeLog("Finished [ Assignment ] on line " + pos.line + "..");
}

function cPrint(pos, depth) {
    //Generating
    codeLog("Generating [ Print ] on line " + pos.line + "..");

    //Finished
    codeLog("Finished [ Print ] on line " + pos.line + "..");
}

function cWhile(pos, depth) {
    //Generating
    codeLog("Generating [ While ] on line " + pos.line + "..");


    //Finished
    codeLog("Finished [ While ] on line " + pos.line + "..");
}

function cIf(pos, depth) {
    //Generating
    codeLog("Generating [ If ] on line " + pos.line + "..");


    //Finished
    codeLog("Finished [ If ] on line " + pos.line + "..");
}

function cInequality(pos, depth) {
    //Generating
    codeLog("Generating [ Inequality ] on line " + pos.line + "..");


    //Finished
    codeLog("Finished [ Inequality ] on line " + pos.line + "..");
}

function cEquality(pos, depth) {
    //Generating
    codeLog("Generating [ Equality ] on line " + pos.line + "..");


    //Finished
    codeLog("Finished [ Equality ] on line " + pos.line + "..");
}

function cID(pos, depth) {
    //Generating
    codeLog("Generating [ ID ] on line " + pos.line + "..");

    var address = staticData.get(pos, depth);
    addHex(loadAccFromMemo);
    addHex(address);

    //Finished
    codeLog("Finished [ ID ] on line " + pos.line + "..");
}

function cDigit(pos, depth) {
    //Generating
    codeLog("Generating [ Digit ] on line " + pos.line + "..");

    addHex(loadAccWithConst);
    addHex(numtoHex(pos.value));

    //Finished
    codeLog("Finished [ Digit ] on line " + pos.line + "..");
}

function cBool(pos, depth) {
    //Generating
    codeLog("Generating [ Bool ] on line " + pos.line + "..");

    if (pos.value === 'true') {
        addHex(loadAccWithConst);
        addHex(toHex("1"));
    } else {
        addHex(loadAccWithConst);
        addHex(toHex("0"));
    }
    addHex(storeAccInMemo);
    addHex(TEMPORARY_ADDRESS);
    addHex('XX');
    addHex(loadXWithConst);
    addHex(toHex("1"));
    addHex(compareMemoToX);
    addHex(TEMPORARY_ADDRESS);
    addHex('XX');

    //Finished
    codeLog("Finished [ Bool ] on line " + pos.line + "..");
}

function cString(pos, depth) {
    //Generating
    codeLog("Generating [ String ] on line " + pos.line + "..");

    var value = numtoHex(addToHeap(pos.name));
    addHex(loadAccWithConst);
    addHex(value);

    //Finished
    codeLog("Finished [ String ] on line " + pos.line + "..");
}

function addToHeap(str) {
    heap.unshift("00");
    heapAddress--;
    for (var i = str.length-1; i >= 0; i--) {
        heap.unshift(toHex(str.charAt(i)));
        heapAddress--;
    }
    codeLog("Added string [ "+str+" ] to heap, address "+heapAddress+" [ "+numtoHex(heapAddress)+" ]...");
    return heapAddress;
}
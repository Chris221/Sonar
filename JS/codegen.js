var tree;
var code = [];
var cErrors = 0;
var cWarnings = 0;
var staticData = new StaticData();
var codeString = "";
var heap = [];
var heapAddress = 256;
var trueAddress;
var falseAddress;

var MAX = 256;
var TEMP_ADDRESS_ONE = "X1";
var TEMP_ADDRESS_TWO = "X2";

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

    $('#Lexer_log').text($('#Lexer_log').val() + "\n");

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

 function getTypeFromST(id, scope, start = st.cur) {
    //if the current level has symbols
    for (var i = 0; i < start.symbols.length; i++) {
        //when the correct ID is found
        if (id == start.symbols[i].getKey() && scope == start.symbols[i].scope) {
            //returns the type
            return start.symbols[i].type;
        } else if (id == start.symbols[i].getKey() && scope >= start.symbols[i].scope) {
            //returns the type
            return start.symbols[i].type;
        }
    }
    //If lower level, search there
    if (start.children != undefined || start.children != null) {
        //calls a search in the lower levels
        for (var i = 0; i < start.children.length; i++) {
            return getTypeFromST(id, scope, start.children[i]);
        }
    }
}

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
    addHex(TEMP_ADDRESS_ONE);
    addHex('XX');
    addHex(loadAccWithConst);
    addHex(numtoHex(pos.children[0].name));
    addHex(addWithCarry);
    addHex(TEMP_ADDRESS_ONE);
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

    if (pos.children[0].type == "ID") {
        var address = staticData.get(pos.children[0], depth);
        var varType = getTypeFromST(pos.children[0].name, pos.children[0].scope);
        console.log(varType)

        if (varType == "int") {

        } else if (varType == "string") {

        } else if (varType == "boolean") {

        }

    } else if (pos.children[0].type == "CHARLIST") {
        var address = numtoHex(addToHeap(pos.children[0].name));

        addHex(loadAccFromMemo);
        addHex(address);
        addHex(loadYWithConst);
        addHex(address);
        addHex(storeAccInMemo);
        addHex(TEMP_ADDRESS_ONE);
        addHex('XX');
        addHex(loadXWithConst);
        addHex(PrintStr);
        addHex(systemCall);
    } else {
    }
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
    addHex(TEMP_ADDRESS_ONE);
    addHex('XX');
    addHex(loadXWithConst);
    addHex(printInt);
    addHex(compareMemoToX);
    addHex(TEMP_ADDRESS_ONE);
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
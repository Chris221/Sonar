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
    //adds true to heap, gets location
    trueAddress = numtoHex(addToHeap('true'));
    //adds false to heap, gets location
    falseAddress = numtoHex(addToHeap('false'));
    //starts the tree movement
    traverseTree(ast.root, 0);
    //adds a break to the very end for clean eanding
    addHex(breakOp);

    //calls backpatching
    backpatch();

    //if outputting
    if (verbose) {
        //break lines in the log
        $('#Lexer_log').text($('#Lexer_log').val() + "\n");

        //random banter for outputing code and heap being combined
        codeLog("Getting the Code...");
        codeLog("Taking the Heap...");
        codeLog("Putting them together with 00s...");
        //outs the memory 
        codeLog("Memory  "+(code.length+heap.length)+"/"+MAX+"...");
    }
    
    //if the heap and code arent a full 256
    for (var i = code.length; i < MAX - heap.length; i++) {
        //adds empty space
        code.push("00");
    }
    //loops through heap
    for (var i = 0; i < heap.length; i++) {
        //adds the heap to the code
        code.push(heap[i])
    }

    codeString = code.join(' ');
}

//Backpatching!
function backpatch() {
    //Begin
    codeLog("Beginning Backpatching...");

    //gets new address
    var addressOne = numtoHex(code.length + staticData.length());
    //if outputting
    if (verbose) {
        //Outputs the change to the new address
        codeLog("Replacing [ " + TEMP_ADDRESS_ONE + " ] with [ " + addressOne + " ]...");
    }
    //checks for the first temp value
    if (code.includes(TEMP_ADDRESS_ONE)) {
        for (var i = 0; i < code.length; i++) {
            //if this element is temp 1
            if (code[i] == TEMP_ADDRESS_ONE) {
                //debug
                if (debug) {
                    //output found
                    console.log("Found a "+TEMP_ADDRESS_ONE)
                }
                //replace the first temp
                code[i] = addressOne;
            }
        }
    }

    //gets new address
    var addressTwo = numtoHex(code.length + staticData.length() + 1);
    //if outputting
    if (verbose) {
        //Outputs the change to the new address
        codeLog("Replacing [ " + TEMP_ADDRESS_TWO + " ] with [ " + addressTwo + " ]...");
    }
    //checks for the second temp value
    if (code.includes(TEMP_ADDRESS_TWO)) {
        //Loops for it
        for (var i = 0; i < code.length; i++) {
            //if this element is temp 2
            if (code[i] == TEMP_ADDRESS_TWO) {
                //debug
                if (debug) {
                    //output found
                    console.log("Found a "+TEMP_ADDRESS_TWO)
                }
                //replace the second temp
                code[i] = addressTwo;
            }
        }
    }
    //if outputting
    if (verbose) {
        //Outputs the change to the new address
        codeLog("Replacing [ XX ] with [ 00 ]...");
    }
    //checks for the XX
    if (code.includes("XX")) {
        //Loops for it
        for (var i = 0; i < code.length; i++) {
            //if this element is temp 2
            if (code[i] == "XX") {
                //debug
                if (debug) {
                    //output found
                    console.log("Found a XX")
                }
                //replace the second temp
                code[i] = "00";
            }
        }
    }

    //end
    codeLog("Backpatching Done...");
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
    //adds the hex to the Array
    code.push(val);
    //if outputing
    if (verbose) {
        //output to log
        codeLog("Pushing [ " + val + " ] byte to memory...");
    }
}

function toHex(val) {
    //turns chars into HEX
    return pad(toHexidecimal(val.charCodeAt(0)), 2, '0').toUpperCase();
 }
 
  function numtoHex(val) {
    //turns ints into HEX
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
    //id values
    if (pos.children[0].type == "ID") {
        var address = staticData.get(pos.children[0], depth);
        var varType = getTypeFromST(pos.children[0].name, pos.children[0].scope);

        //ID ints
        if (varType == "int") {
            //int print op codes
            addHex(loadYWithConst);
            addHex(address);
            addHex(loadXWithConst);
            addHex(printInt);
            addHex(systemCall);
        //ID strings
        } else if (varType == "string") {
            //string print op codes
            addHex(loadYWithConst);
            addHex(address);
            addHex(loadXWithConst);
            addHex(PrintStr);
            addHex(systemCall);
        //ID booleans
        } else if (varType == "boolean") {
            //bool print op codes
            addHex(loadXWithConst);
            addHex(printInt);
            addHex(compareMemoToX);
            addHex(address);
            addHex(loadYWithConst);
            addHex(falseAddress);
            addHex(branchNBytes);
            addHex("02");
            addHex(loadYWithConst);
            addHex(trueAddress);
            addHex(loadXWithConst);
            addHex(PrintStr);
            addHex(systemCall);

        }
    //raw strings
    } else if (pos.children[0].type == "CHARLIST") {
        //adds the string to heap
        var address = numtoHex(addToHeap(pos.children[0].name));
        //string print op codes
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
    //booleans and Ints
    } else {
        //processes booleans and Ints
        traverseTree(pos.children[0],depth);
        //raw boolean print codes
        if (pos.children[0].type == "Bool" || pos.children[0].type == "Equality" || pos.children[0].type == "Inequality") {
            //boolean print op codes
            addHex(loadXWithConst);
            addHex(printInt);
            addHex(loadYWithConst);
            addHex(falseAddress);
            addHex(branchNBytes);
            addHex("02");
            addHex(loadYWithConst);
            addHex(trueAddress);
            addHex(loadXWithConst);
            addHex(PrintStr);
            addHex(systemCall);
        //raw int print codes
        } else {
            //int print op codes
            addHex(loadXWithConst);
            addHex(printInt);
            addHex(storeAccInMemo);
            addHex(TEMP_ADDRESS_ONE);
            addHex(loadYFromMemo);
            addHex(TEMP_ADDRESS_ONE);
            addHex(systemCall);
        }
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
    addHex(numtoHex(pos.name));

    //Finished
    codeLog("Finished [ Digit ] on line " + pos.line + "..");
}

function cBool(pos, depth) {
    //Generating
    codeLog("Generating [ Bool ] on line " + pos.line + "..");

    if (pos.value === 'true') {
        addHex(loadAccWithConst);
        addHex(numtoHex("1"));
    } else {
        addHex(loadAccWithConst);
        addHex(numtoHex("0"));
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
//tree placeholder
var tree;
//code array
var code = [];
//errors
var cErrors = 0;
//warnings
var cWarnings = 0;
//new reference table for ID
var staticData = new StaticData();
//string for code
var codeString = "";
//defines heap array
var heap = [];
//starting heap address
var heapAddress = 256;
//defines the placeholders for true/false
var trueAddress;
var falseAddress;

//constants
var MAX = 256;
var TEMP_ADDRESS_ONE = "X1";
var TEMP_ADDRESS_TWO = "X2";

function gen(ast) {
    //resets
    tree = ast;
    code = [];
    cErrors = 0;
    cWarnings = 0;
    staticData = new StaticData();
    codeString = "";
    heap = [];
    heapAddress = 256;

    //calls code gen
    generate();

    //returns codestring
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

    //if the code is longer then 256
    if (code.length > MAX) {
        //increases errors
        cErrors++;
        //outputs error
        codeLog("ERROR! Not enough memory "+code.length+"/"+MAX+"...");
    }

    //joins the code in a nice readable string
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

    //loops through variables and defines there new locations
    for (var key in staticData.variables) {
        //gets new address location
        var newAddress = numtoHex(code.length + staticData.variables[key].offset);
        //gets the temp address location
        var tempAddress = staticData.variables[key].address;
        //if outputting
        if (verbose) {
            //Outputs the change to the new address
            codeLog("Replacing [ " + tempAddress + " ] with [ " + newAddress + " ]...");
        }
        //Loops for it
        for (var i = 0; i < code.length; i++) {
            //if this element is tempAddress 
            if (code[i] == tempAddress) {
                //debug
                if (debug) {
                    //output found
                    console.log("Found a "+tempAddress)
                }
                //replace the second temp
                code[i] = newAddress;
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
    // Adds padding
    function pad(word, size, padder) {
        var paddedWord = "" + word;
        while (paddedWord.length < size) {
            paddedWord = padder + paddedWord;
        }
        return paddedWord;
    }

    function toHexidecimal(str) {
        //Converts a string to hex
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

//Boolean Logic
function booleanLogic(pos) {
    //temp values
    var e1, e2;
    //children elements
    var elementOne = pos.children[0];
    var elementTwo = pos.children[1];

    //if Bool
    if (elementOne.type == "BOOL") {
        //get which
        e1 = elementOne.name;
    //if not
    } else {
        //continue down
        e1 = ""+booleanLogic(elementOne);
    }

    //if Bool
    if (elementTwo.type == "BOOL") {
        //get which
        e2 = elementTwo.name;
        //if not
    } else {
        //continue down
        e2 = ""+booleanLogic(elementTwo);
    }
    //If this one is an equals
    if (pos.type == "Equality") {
        //then this must be
        if (e1 == e2) {
            //so true
            return true;
        //otherwise
        } else {
            //false
            return false;
        }
    //if not an equal statement
    } else {
        //then this must be
        if (e1 != e2) {
            //true
            return true;
        //otherwise
        } else {
            //false
            return false;
        }
    }
}

function traverseTree(pos, depth) {
    //moves through the tree looking at the level
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

    //move through the tree
    traverseTree(pos.children[0], depth);
    //stores into memory
    addHex(storeAccInMemo);
    addHex(TEMP_ADDRESS_ONE);
    addHex('XX');
    //loads constant
    addHex(loadAccWithConst);
    addHex(numtoHex(pos.children[0].name));
    //adds to the accum from memory
    addHex(addWithCarry);
    addHex(TEMP_ADDRESS_ONE);
    addHex('XX');

    //Finished
    codeLog("Finished [ Addition ] on line " + pos.line + "..");
}

function cVarDecl(pos, depth) {
    //Generating
    codeLog("Generating [ Declaration ] on line " + pos.line + "..");
    //loads 00
    addHex(loadAccWithConst);
    addHex('00');
    //gets temp address
    var address = staticData.add(pos.children[0], depth);
    //stores to memory
    addHex(storeAccInMemo);
    addHex(address);
    addHex('XX');

    //Finished
    codeLog("Finished [ Declaration ] on line " + pos.line + "..");
}

function cAssign(pos, depth) {
    //Generating
    codeLog("Generating [ Assignment ] on line " + pos.line + "..");

    //move through the tree
    traverseTree(pos.children[1], pos.scope);
    //gets temp address
    var address = staticData.get(pos.children[0], depth);
    //stores to memory
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
        //gets the temp address
        var address = staticData.get(pos.children[0], depth);
        //gets the id type
        var varType = getTypeFromST(pos.children[0].name, pos.children[0].scope);

        //ID ints
        if (varType == "int") {
            //int print op codes
            //loads from memory
            addHex(loadYFromMemo);
            addHex(address);
            addHex("XX");
            //loads the print int op
            addHex(loadXWithConst);
            addHex(printInt);
            //break
            addHex(systemCall);
        //ID strings
        } else if (varType == "string") {
            //string print op codes
            //loads from memory
            addHex(loadYFromMemo);
            addHex(address);
            addHex("XX");
            //loads the print string op
            addHex(loadXWithConst);
            addHex(PrintStr);
            //break
            addHex(systemCall);
        //ID booleans
        } else if (varType == "boolean") {
            //bool print op codes
            //loads x with 1
            addHex(loadXWithConst);
            addHex(printInt);
            //loads from memory
            addHex(compareMemoToX);
            addHex(address);
            addHex("XX");
            //loads y with false
            addHex(loadYWithConst);
            addHex(falseAddress);
            //jump 2
            addHex(branchNBytes);
            addHex("02");
            //load y with true
            addHex(loadYWithConst);
            addHex(trueAddress);
            //loads the print string op
            addHex(loadXWithConst);
            addHex(PrintStr);
            //break
            addHex(systemCall);

        }
    //raw strings
    } else if (pos.children[0].type == "CHARLIST") {
        //adds the string to heap
        var address = numtoHex(addToHeap(pos.children[0].name));
        //string print op codes
        //loads memory
        addHex(loadAccFromMemo);
        addHex(address);
        addHex("XX");
        //loads the y
        addHex(loadYWithConst);
        addHex(address);
        //store in temp
        addHex(storeAccInMemo);
        addHex(TEMP_ADDRESS_ONE);
        addHex('XX');
        //loads the print str op code
        addHex(loadXWithConst);
        addHex(PrintStr);
        //break
        addHex(systemCall);
    //booleans and Ints
    } else {
        //processes booleans and Ints
        traverseTree(pos.children[0],depth);
        //raw boolean print codes
        if (pos.children[0].type == "Bool" || pos.children[0].type == "Equality" || pos.children[0].type == "Inequality") {
            //boolean print op codes
            //loads 1 into x
            addHex(loadXWithConst);
            addHex(printInt);
            //loads the false location into y
            addHex(loadYWithConst);
            addHex(falseAddress);
            //jumps if 
            addHex(branchNBytes);
            addHex("02");
            //loads the true location into y
            addHex(loadYWithConst);
            addHex(trueAddress);
            //loads the print str op into x
            addHex(loadXWithConst);
            addHex(PrintStr);
            //Break
            addHex(systemCall);
        //raw int print codes
        } else {
            //int print op codes
            //loads print int code
            addHex(loadXWithConst);
            addHex(printInt);
            //stores to the temp address
            addHex(storeAccInMemo);
            addHex(TEMP_ADDRESS_ONE);
            addHex('XX');
            //loads the temp in y
            addHex(loadYFromMemo);
            addHex(TEMP_ADDRESS_ONE);
            addHex('XX');
            //Break
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
    cEquality(pos, depth);

    //Finished
    codeLog("Finished [ Inequality ] on line " + pos.line + "..");
}

function cEquality(pos, depth) {
    //Generating
    codeLog("Generating [ Equality ] on line " + pos.line + "..");
    //if theres a nested bool types
    if (pos.children[0].name == "Equality" || pos.children[0].name == "Inequality" || pos.children[1].name == "Equality" || pos.children[1].name == "Inequality") {
        //Let Boolean Logic handle that one little 6502 assembler
        if (booleanLogic(pos)) {
            //loads true
            addHex(loadAccWithConst);
            addHex("01");
            addHex("XX");
            addHex(loadXWithConst);
            addHex("01");
            addHex("XX");
        } else {
            //loads false
            addHex(loadAccWithConst);
            addHex("01");
            addHex("XX");
            addHex(loadXWithConst);
            addHex("00");
            addHex("XX");
        }
    //if comparing strings
    } else if (pos.children[0].type == "CHARLIST" && pos.children[1].type == "CHARLIST") {
        //compares strings
        if (pos.children[0].name == pos.children[1].name) {
            //loads true
            addHex(loadAccWithConst);
            addHex("01");
            addHex("XX");
            addHex(loadXWithConst);
            addHex("01");
            addHex("XX");
        } else {
            //loads false
            addHex(loadAccWithConst);
            addHex("01");
            addHex("XX");
            addHex(loadXWithConst);
            addHex("00");
            addHex("XX");
        }

        //stores in memory
        addHex(storeAccInMemo);
        addHex(TEMP_ADDRESS_ONE);
        addHex("XX");
        //compares to memory
        addHex(compareMemoToX);
        addHex(TEMP_ADDRESS_ONE);
    //compares the rest
    } else {
        //gets first loaded
        traverseTree(pos.children[0], depth);

        //stores in memory
        addHex(storeAccInMemo);
        addHex(TEMP_ADDRESS_TWO);
        //gets second loaded
        traverseTree(pos.children[1], depth);

        //stores in memory
        addHex(storeAccInMemo);
        addHex(TEMP_ADDRESS_ONE);
        //loads from memory
        addHex(loadXFromMemo);
        addHex(TEMP_ADDRESS_TWO);
        //compare to memory
        addHex(compareMemoToX);
        addHex(TEMP_ADDRESS_ONE);

        //loads false
        addHex(loadAccWithConst);
        addHex("00");
        addHex("XX");
        //jump 2 if true
        addHex(BRANCH_IF_Z_FLAG_EQUALS_ZERO);
        addHex("02");
        //true
        addHex(loadAccWithConst);
        addHex("01");
        addHex("XX");
    }

    //Finished
    codeLog("Finished [ Equality ] on line " + pos.line + "..");
}

function cID(pos, depth) {
    //Generating
    codeLog("Generating [ ID ] on line " + pos.line + "..");

    //gets address of ID
    var address = staticData.get(pos, depth);
    //loads address
    addHex(loadAccFromMemo);
    addHex(address);
    addHex("XX");

    //Finished
    codeLog("Finished [ ID ] on line " + pos.line + "..");
}

function cDigit(pos, depth) {
    //Generating
    codeLog("Generating [ Digit ] on line " + pos.line + "..");

    //loads digits 
    addHex(loadAccWithConst);
    addHex(numtoHex(pos.name));

    //Finished
    codeLog("Finished [ Digit ] on line " + pos.line + "..");
}

function cBool(pos, depth) {
    //Generating
    codeLog("Generating [ Bool ] on line " + pos.line + "..");

    //if true
    if (pos.name === 'true') {
        //load true
        addHex(loadAccWithConst);
        addHex(numtoHex("1"));
    //otherwise
    } else {
        //load false
        addHex(loadAccWithConst);
        addHex(numtoHex("0"));
    }
    //store into memory
    addHex(storeAccInMemo);
    addHex(TEMP_ADDRESS_ONE);
    addHex('XX');
    //loads X with 1
    addHex(loadXWithConst);
    addHex(printInt);
    //compares to previous memory
    addHex(compareMemoToX);
    addHex(TEMP_ADDRESS_ONE);
    addHex('XX');

    //Finished
    codeLog("Finished [ Bool ] on line " + pos.line + "..");
}

function cString(pos, depth) {
    //Generating
    codeLog("Generating [ String ] on line " + pos.line + "..");

    //adds the string to the heap
    var value = numtoHex(addToHeap(pos.name));
    //loads the location of the string
    addHex(loadAccWithConst);
    addHex(value);
    addHex("XX");

    //Finished
    codeLog("Finished [ String ] on line " + pos.line + "..");
}

function addToHeap(str) {
    //adds the terminate value
    heap.unshift("00");
    //removes one from the heap
    heapAddress--;
    //loops through the string
    for (var i = str.length-1; i >= 0; i--) {
        //adds the hex value to the string
        heap.unshift(toHex(str.charAt(i)));
        //removes one from the heap
        heapAddress--;
    }
    if (verbose) {
        //outputs info about the add
        codeLog("Added string [ "+str+" ] to heap, address "+heapAddress+" [ "+numtoHex(heapAddress)+" ]...");
    }
    //returns heap address
    return heapAddress;
}
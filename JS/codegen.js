//tree placeholder
var tree;
//code array
var code = [];
//errors
var cErrors = 0;
//new reference table for ID codes
var staticData = new StaticData();
//new reference table jump codes
var jumpTable = new JumpTable();
//string for code
var codeString = "";
var codeString2 = "";
//defines heap array
var heap = [];
//defines string table
var stringTable = new StringTable();
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
    staticData = new StaticData();
    jumpTable = new JumpTable();
    codeString = "";
    codeString2 = "";
    heap = [];
    stringTable = new StringTable();
    heapAddress = 256;

    //calls code gen
    generate();

    //If no errors then
    if (!cErrors) {
        //Passed Code Gen
        logText += "<br /><div class=\"codegen completed-text\" id=\"codegen-completed-text\"><span class=\"codegen-title\">Code Generation</span> <span class=\"passed\">passed</span> with 0 <span class=\"warning\">warnings</span> and " + cErrors + " <span class=\"error\">errors</span></div>";
        //otherwise
    } else {
        //Failed Code Gen
        logText += "<br /><div class=\"codegen completed-text\" id=\"codegen-completed-text\"><span class=\"codegen-title\">Code Generation</span> <span class=\"failed\">FAILED</span> with 0 <span class=\"warning\">warnings</span> and " + cErrors + " <span class=\"error\">errors</span></div>";
    }
    //returns codestring
    return codeString;
}

//Sets the code log
function codeLog(text, override = false) {
    //Appends new logging to current log
    var lText = "<div class=\"codegen\"><span class=\"codegen-title\">#CODEGEN</span> -- " + text + "</div>";
    //if verbose mode
    if (!override) {
        //Sets the Verbose Log
        logTextVerbose += lText;
        //if not
    } else {
        //Sets the Verbose Log
        logTextVerbose += lText;
        //Sets the Log
        logText += lText;
    }
}

function generate() {
    //Code gen starting 
    codeLog("<span id=\"codegen-start-text\">Code Generating Program <span class=\"line\">" + programNumber + "</span>...</span>", true);
    //adds true to heap, gets location
    trueAddress = addToHeap('true');
    //adds false to heap, gets location
    falseAddress = addToHeap('false');
    //starts the tree movement
    traverseTree(ast.root, 0);
    //adds a break to the very end for clean eanding
    addHex(breakOp);

    //calls backpatching
    backpatch();
    //if outputing
    if (verbose) {
        //break lines in the log
        logText += "<br />";
    }

    //random banter for outputing code and heap being combined
    codeLog("Getting the Code...");
    codeLog("Taking the Heap...");
    codeLog("Putting them together with <span class=\"code\">00</span>s...");
    //outs the memory 
    codeLog("Memory  <span class=\"line\">" + (code.length + heap.length) + "</span>/<span class=\"line\">" + MAX + "</span>...");

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
        codeLog("<span class=\"error\">ERROR!</span> Not enough memory <span class=\"codegen-title\">" + code.length + "</span>/<span class=\"codegen-title\">" + MAX + "</span>...", true);
    }

    //joins the code in a nice readable string
    codeString2 = code.join(' ');
    //calls the pretty code function
    codeToString();
}

//Backpatching!
function backpatch() {
    //if outputing
    if (verbose) {
        //break lines in the log
        logText += "<br />";
    }
    //Begin
    codeLog("Beginning Backpatching...");

    //gets new address
    var addressOne = numtoHex(code.length + staticData.length());
    //Outputs the change to the new address
    codeLog("Replacing [ <span class=\"code\">" + TEMP_ADDRESS_ONE + "</span> ] with [ <span class=\"code\">" + addressOne + "</span> ]...");
    //checks for the first temp value
    if (code.includes(TEMP_ADDRESS_ONE)) {
        for (var i = 0; i < code.length; i++) {
            //if this element is temp 1
            if (code[i] == TEMP_ADDRESS_ONE) {
                //replace the first temp
                code[i] = addressOne;
            }
        }
    }

    //gets new address
    var addressTwo = numtoHex(code.length + staticData.length() + 1);
    //Outputs the change to the new address
    codeLog("Replacing [ <span class=\"code\">" + TEMP_ADDRESS_TWO + "</span> ] with [ <span class=\"code\">" + addressTwo + "</span> ]...");
    //checks for the second temp value
    if (code.includes(TEMP_ADDRESS_TWO)) {
        //Loops for it
        for (var i = 0; i < code.length; i++) {
            //if this element is temp 2
            if (code[i] == TEMP_ADDRESS_TWO) {
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
        //Outputs the change to the new address
        codeLog("Replacing [ <span class=\"code\">" + tempAddress + "</span> ] with [ <span class=\"code\">" + newAddress + "</span> ]...");
        //Loops for it
        for (var i = 0; i < code.length; i++) {
            //if this element is tempAddress 
            if (code[i] == tempAddress) {
                //replace the second temp
                code[i] = newAddress;
            }
        }
    }

    //loops through Jumps and defines there correct locations
    for (var key in jumpTable.variables) {
        //start of the block
        var start = jumpTable.variables[key].startingAddress;
        //end of the block
        var end = jumpTable.variables[key].endingAddress;
        //gets the distance to move
        var move = numtoHex(end - start - 2);
        //Outputs the change to the new address
        codeLog("Replacing [ <span class=\"code\">" + key + "</span> ] with [ <span class=\"code\">" + move + "</span> ]...");
        //Loops for it
        for (var i = 0; i < code.length; i++) {
            //if this element is the jump key 
            if (code[i] == key) {
                //replace the jump
                code[i] = move;
            }
        }
    }

    //Outputs the change to the new address
    codeLog("Replacing [ <span class=\"code\">XX</span> ] with [ <span class=\"code\">00</span> ]...");
    //checks for the XX
    if (code.includes("XX")) {
        //Loops for it
        for (var i = 0; i < code.length; i++) {
            //if this element is temp 2
            if (code[i] == "XX") {
                //replace the second temp
                code[i] = "00";
            }
        }
    }

    //end
    codeLog("Backpatching Done...");
}

function codeToString() {
    var heap = false;
    for (var i = 0; i < code.length; i++) {
        var current = code[i];
        if (current == "00" && (code[i+1] == "00" || heap)) {
            heap = true;
            codeString += "<b class=\"text-muted\">"+current+"</b>";
        } else if (heap) {
            codeString += "<b class=\"text-success\">"+current+"</b>";
        } else if (current == "A9" || current == "AD" || current == "A2" || current == "A0" || current == "D0") {
            codeString += "<b class=\"text-danger\">"+current+"</b>";
        } else if (current == "8D" || current == "6D" || current == "AE" || current == "AC" || current == "EC" || current == "EE") {
            codeString += "<b class=\"text-warning\">"+current+"</b>";
        } else if (current == "EA") {
            codeString += "<b class=\"lime\">"+current+"</b>";
        } else if (current == "FF") {
            codeString += "<b class=\"text-dark\">"+current+"</b>";
        } else {
            codeString += "<b class=\"text-info\">"+current+"</b>";
        }
        codeString += " ";
    }
    codeString.trim();
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
    //output to log
    codeLog("Pushing [ <span class=\"code\">" + val + "</span> ] byte to memory...");
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

function getTypeFromSThelper(id, scope, start = st.cur) {
    //if the scopes mataches return 
    if (scope == start.scope) {
        return start;
    }
    //If lower level, search there
    if (start.children.length != 0) {
        //calls a search in the higher levels
        for (var i = 0; i < start.children.length; i++) {
            var t = getTypeFromSThelper(id, scope, start.children[i]);
            if (t != undefined) {
                return t;
            }
        }
    }
}

function getTypeFromST(id, scope, start = getTypeFromSThelper(id, scope)) {
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
    //If higher level, search there
    if (start.parent != undefined || start.parent != null) {
        return getTypeFromST(id, scope, start.parent);
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
        e1 = "" + elementOne.name;
        //if string then true
    } else if (elementOne.type == "CHARLIST") {
        //if the string has value
        if (elementOne.name.length > 0) {
            //sets true
            e1 = "true";
            //otherwise
        } else {
            //sets false
            e1 = "false";
        }
        //if ID
    } else if (elementOne.type == "ID") {
        //gets the type
        var varType = getTypeFromST(elementOne.name, elementOne.scope);
        //if string
        if (varType == "string") {
            //sets true
            e1 = "true";
            //if not
        } else {
            //sets the name
            e1 = "" + elementOne.name;
        }
        //if digit
    } else if (elementOne.type == "DIGIT") {
        //sets the digit
        e1 = "" + elementOne.name;
        //if not
    } else {
        //continue down
        e1 = "" + booleanLogic(elementOne);
    }

    //if Bool
    if (elementTwo.type == "BOOL") {
        //get which
        e2 = "" + elementTwo.name;
        //if string
    } else if (elementTwo.type == "CHARLIST") {
        //if the string has value
        if (elementTwo.name.length > 0) {
            //sets true
            e2 = "true";
            //otherwise
        } else {
            //sets false
            e2 = "false";
        }
        //if ID
    } else if (elementTwo.type == "ID") {
        //gets the type        
        var varType = getTypeFromST(elementTwo.name, elementTwo.scope);
        //if string
        if (varType == "string") {
            //sets true
            e2 = "true";
            //if not
        } else {
            //sets the name
            e2 = "" + elementTwo.name;
        }
        //if digit
    } else if (elementTwo.type == "DIGIT") {
        //sets the digit
        e2 = "" + elementTwo.name;
        //if not
    } else {
        //continue down
        e2 = "" + booleanLogic(elementTwo);
    }
    //If element one is a digit
    if (elementOne.type == "DIGIT" && elementTwo.type != "DIGIT") {
        //if e1 is more then 0
        if (e1 > 0) {
            //true
            e1 = "true";
            //otherwise
        } else {
            //false
            e1 = "false";
        }
        //If element two is a digit
    } else if (elementOne.type != "DIGIT" && elementTwo.type == "DIGIT") {
        //if e2 is more then 0
        if (e2 > 0) {
            //true
            e2 = "true";
            //otherwise
        } else {
            //false
            e2 = "false";
        }
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
    } else if (pos.type == "Inequality") {
        //then this must be
        if (e1 != e2) {
            //true
            return true;
            //otherwise
        } else {
            //false
            return false;
        }
    } else {
        /* Duplicated
        //not supported
        comErrors++;
        //text about issue
        comErrorsStr += "<div class=\"error\">Addition in Equality and Inequality statements is not supported in this Compiler.</div>";
        comErrorsStr += "<div class=\"error\">The issue was found on line <span class=\"line\">" + pos.line + "</span>...</div><br />";
        */
    }
}

function traverseTree(pos, depth) {
    //moves through the tree looking at the level
    //root
    if (pos.name == "Root")
        cRoot(pos.children, depth);
    //program
    else if (pos.name.includes("Program"))
        cProgram(pos.children, depth);
    //block
    else if (pos.name == "Block")
        cBlock(pos, depth);
    //Variable Declairation
    else if (pos.name == "VarDecl")
        cVarDecl(pos, depth);
    //Assignment Statments
    else if (pos.name == "AssignmentStatement")
        cAssign(pos, depth);
    //Print Statements
    else if (pos.name == "Print")
        cPrint(pos, depth);
    //If Statements
    else if (pos.name == "IfStatement")
        cIf(pos, depth);
    //While Statements
    else if (pos.name == "WhileStatement")
        cWhile(pos, depth);
    //Equality
    else if (pos.name == "Equality")
        cEquality(pos, depth);
    //Inequality
    else if (pos.name == "Inequality")
        cInequality(pos, depth);
    //True or False variables
    else if (pos.name == "true" || pos.name == "false")
        cBool(pos, depth);
    //String variables
    else if (pos.type == "CHARLIST")
        cString(pos, depth);
    //ID variables
    else if ("abcdefghijklmnopqrstuvwxyz".includes(pos.name))
        cID(pos, depth);
    //Integer variables
    else if ("0123456789".includes(pos.name))
        cDigit(pos, depth);
    //Addition
    else if (pos.name == "Addition") {
        return cAddition(pos, depth);
    } else {
        //loops through trees kids and moves down incase one is missed
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
    codeLog("Generating [ <span class=\"code-words\">Block</span> ] on line <span class=\"line\">" + pos.line + "</span>..");
    //enter scope
    codeLog("Entering Scope [ <span class=\"code\">" + pos.scope + "</span> ]..");
    //output
    //loops through the level
    for (var i = 0; i < pos.children.length; i++) {
        //moves deeper on each one
        traverseTree(pos.children[i], depth + 1);
    }
    //Out of scope
    codeLog("Leaving Scope [ <span class=\"code\">" + pos.scope + "</span> ]..");
    //Finished
    codeLog("Finished [ <span class=\"code-words\">Block</span> ] on line <span class=\"line\">" + pos.line + "</span>..");
}

function cAddition(pos, depth) {
    //Generating
    codeLog("Generating [ <span class=\"code-words\">Addition</span> ] on line <span class=\"line\">" + pos.line + "</span>..");

    //move through the tree
    traverseTree(pos.children[1], depth);
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
    codeLog("Finished [ <span class=\"code-words\">Addition</span> ] on line <span class=\"line\">" + pos.line + "</span>..");
}

function cVarDecl(pos, depth) {
    //Generating
    codeLog("Generating [ <span class=\"code-words\">Declaration ] on line <span class=\"line\">" + pos.line + "</span>..");
    //loads 00
    addHex(loadAccWithConst);
    addHex('00');
    //gets temp address
    var address = staticData.add(pos.children[0], pos.scope);
    //stores to memory
    addHex(storeAccInMemo);
    addHex(address);
    addHex('XX');

    //Finished
    codeLog("Finished [ <span class=\"code-words\">Declaration</span> ] on line <span class=\"line\">" + pos.line + "</span>..");
}

function cAssign(pos, depth) {
    //Generating
    codeLog("Generating [ <span class=\"code-words\">Assignment</span> ] on line <span class=\"line\">" + pos.line + "</span>..");

    //move through the tree
    traverseTree(pos.children[1], depth);
    //gets temp address
    var address = staticData.get(pos.children[0], pos.scope);
    //stores to memory
    addHex(storeAccInMemo);
    addHex(address);
    addHex('XX');

    //Finished
    codeLog("Finished [ <span class=\"code-words\">Assignment</span> ] on line <span class=\"line\">" + pos.line + "</span>..");
}

function cPrint(pos, depth) {
    //Generating
    codeLog("Generating [ <span class=\"code-words\">Print</span> ] on line <span class=\"line\">" + pos.line + "</span>..");
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
        var address = addToHeap(pos.children[0].name);
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
        traverseTree(pos.children[0], depth);
        //raw boolean print codes
        if (pos.children[0].type == "BOOL" || pos.children[0].type == "Equality" || pos.children[0].type == "Inequality") {
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
    codeLog("Finished [ <span class=\"code-words\">Print</span> ] on line <span class=\"line\">" + pos.line + "</span>..");
}

function cWhile(pos, depth) {
    //Generating
    codeLog("Generating [ <span class=\"code-words\">While</span> ] on line <span class=\"line\">" + pos.line + "</span>..");

    //gets the starting address
    var start = code.length;
    //handles the conitional
    traverseTree(pos.children[0], depth);
    //defines a jump variable
    var tempAddress = jumpTable.add(code.length);
    codeLog("Generating [ <span class=\"code\">" + tempAddress + "</span> ] on line <span class=\"line\">" + pos.line + "</span>..");
    //jump to jump variable
    addHex(branchNBytes);
    addHex(tempAddress);

    //handles the block
    traverseTree(pos.children[1], depth);

    addHex(loadAccWithConst);
    addHex("00");
    addHex(storeAccInMemo);
    addHex(TEMP_ADDRESS_ONE);
    addHex("XX");
    addHex(loadXWithConst);
    addHex("01");
    addHex(compareMemoToX);
    addHex(TEMP_ADDRESS_ONE);
    addHex("XX");

    var jump = numtoHex(256 - code.length + start - 2);
    addHex(branchNBytes);
    addHex(jump);

    jumpTable.get(tempAddress).endingAddress = code.length;

    //Finished
    codeLog("Finished [ <span class=\"code-words\">While</span> ] on line <span class=\"line\">" + pos.line + "</span>..");
}

function cIf(pos, depth) {
    //Generating
    codeLog("Generating [ <span class=\"code-words\">If</span> ] on line <span class=\"line\">" + pos.line + "</span>..");
    //processes the conditional
    traverseTree(pos.children[0], depth);
    //makes a new jump element
    var address = jumpTable.add(code.length);
    //jumps to temp
    addHex(branchNBytes);
    addHex(address);
    //processes the block statement
    traverseTree(pos.children[1], depth);
    //sets the end of the up for later use
    jumpTable.get(address).endingAddress = code.length;

    //Finished
    codeLog("Finished [ <span class=\"code-words\">If</span> ] on line <span class=\"line\">" + pos.line + "</span>..");
}

function cInequality(pos, depth) {
    //rewrites for modification later
    pos.type = "Equality";
    //Generating
    codeLog("Generating [ <span class=\"code-words\">Inequality</span> ] on line <span class=\"line\">" + pos.line + "</span>..");

    //runs equality to handle most of the work
    cEquality(pos, depth);
    //negate the equals..
    //loads 0
    addHex(loadAccWithConst);
    addHex("00");
    //jumps 2
    addHex(branchNBytes);
    addHex("02");
    //loads 1
    addHex(loadAccWithConst);
    addHex("01");
    //loads 0 into x
    addHex(loadXWithConst);
    addHex("00");
    //stores in memory
    addHex(storeAccInMemo);
    addHex(TEMP_ADDRESS_ONE);
    addHex("XX");
    //compares
    addHex(compareMemoToX);
    addHex(TEMP_ADDRESS_ONE);
    addHex("XX");

    //Finished
    codeLog("Finished [ <span class=\"code-words\">Inequality</span> ] on line <span class=\"line\">" + pos.line + "</span>..");
}

function cEquality(pos, depth) {
    //Generating
    codeLog("Generating [ <span class=\"code-words\">Equality</span> ] on line <span class=\"line\">" + pos.line + "</span>..");
    //if theres a nested bool types
    if (pos.children[0].name == "Equality" || pos.children[0].name == "Inequality" || pos.children[1].name == "Equality" || pos.children[1].name == "Inequality") {
        //Let Boolean Logic handle that one little 6502 assembler
        if (booleanLogic(pos)) {
            //loads true
            //loads 1
            addHex(loadAccWithConst);
            addHex("01");
            //loads 1 into x
            addHex(loadXWithConst);
            addHex("01");
        } else {
            //loads false
            //loads 1
            addHex(loadAccWithConst);
            addHex("01");
            //loads 0 into x
            addHex(loadXWithConst);
            addHex("00");
        }

        //stores in memory
        addHex(storeAccInMemo);
        addHex(TEMP_ADDRESS_ONE);
        addHex("XX");
        //compares to memory
        addHex(compareMemoToX);
        addHex(TEMP_ADDRESS_ONE);
        addHex("XX");
        //if comparing strings
    } else if (pos.children[0].type == "CHARLIST" && pos.children[1].type == "CHARLIST") {
        //compares strings
        if (pos.children[0].name == pos.children[1].name) {
            //loads true
            //loads 1
            addHex(loadAccWithConst);
            addHex("01");
            //loads 1 into x
            addHex(loadXWithConst);
            addHex("01");
        } else {
            //loads false
            //loads 1
            addHex(loadAccWithConst);
            addHex("01");
            //loads 0 into x
            addHex(loadXWithConst);
            addHex("00");
        }

        //stores in memory
        addHex(storeAccInMemo);
        addHex(TEMP_ADDRESS_ONE);
        addHex("XX");
        //compares to memory
        addHex(compareMemoToX);
        addHex(TEMP_ADDRESS_ONE);
        addHex("XX");
         //if addition below compiler wont support it
    } else if (pos.children[0].type == "Addition" || pos.children[1].type == "Addition") {
        /* Duplicated
        //not supported
        comErrors++;
        //text about issue
        comErrorsStr += "<div class=\"error\">Addition in Equality and Inequality statements is not supported in this Compiler.</div>";
        comErrorsStr += "<div class=\"error\">The issue was found on line <span class=\"line\">" + pos.line + "</span>...</div><br />";
        */
        //compares the rest
    } else {
        //gets first loaded
        traverseTree(pos.children[0], depth);

        //stores in memory
        addHex(storeAccInMemo);
        addHex(TEMP_ADDRESS_TWO);
        addHex("XX");
        //gets second loaded
        traverseTree(pos.children[1], depth);

        //stores in memory
        addHex(storeAccInMemo);
        addHex(TEMP_ADDRESS_ONE);
        addHex("XX");
        //loads from memory
        addHex(loadXFromMemo);
        addHex(TEMP_ADDRESS_TWO);
        addHex("XX");
        //compare to memory
        addHex(compareMemoToX);
        addHex(TEMP_ADDRESS_ONE);
        addHex("XX");

        //loads false
        addHex(loadAccWithConst);
        addHex("00");
        //jump 2 if true
        addHex(branchNBytes);
        addHex("02");
        //true
        addHex(loadAccWithConst);
        addHex("01");
    }

    //Finished
    codeLog("Finished [ <span class=\"code-words\">Equality</span> ] on line <span class=\"line\">" + pos.line + "</span>..");
}

function cID(pos, depth) {
    //Generating
    codeLog("Generating [ <span class=\"code-words\">ID</span> ] on line <span class=\"line\">" + pos.line + "</span>..");

    //gets address of ID
    var address = staticData.get(pos, pos.scope);

    //loads address
    addHex(loadAccFromMemo);
    addHex(address);
    addHex("XX");

    //Finished
    codeLog("Finished [ <span class=\"code-words\">ID</span> ] on line <span class=\"line\">" + pos.line + "</span>..");
}

function cDigit(pos, depth) {
    //Generating
    codeLog("Generating [ <span class=\"code-words\">Digit</span> ] on line <span class=\"line\">" + pos.line + "</span>..");

    //loads digits 
    addHex(loadAccWithConst);
    addHex(numtoHex(pos.name));

    //Finished
    codeLog("Finished [ <span class=\"code-words\">Digit</span> ] on line <span class=\"line\">" + pos.line + "</span>..");
}

function cBool(pos, depth) {
    //Generating
    codeLog("Generating [ <span class=\"code-words\">Bool</span> ] on line <span class=\"line\">" + pos.line + "</span>..");

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
    codeLog("Finished [ <span class=\"code-words\">Bool</span> ] on line <span class=\"line\">" + pos.line + "</span>..");
}

function cString(pos, depth) {
    //Generating
    codeLog("Generating [ <span class=\"code-words\">String</span> ] on line <span class=\"line\">" + pos.line + "</span>..");

    //adds the string to the heap
    var value = addToHeap(pos.name, pos.line);
    //loads the location of the string
    addHex(loadAccWithConst);
    addHex(value);

    //Finished
    codeLog("Finished [ <span class=\"code-words\">String</span> ] on line <span class=\"line\">" + pos.line + "</span>..");
}

function addToHeap(str, line = 0) {
    //checks the table for already used strings
    if (returningHeap = stringTable.get(str)) {
        //outputs it was found
        codeLog("Found string [ <span class=\"code\">" + str + "</span> ] in the heap at address " + returningHeap + "...");
        //returns the address
        return returningHeap;
    }
    //if no string..
    if (str.length == 0) {
        //outputs it was found
        codeLog("Found an empty string on line " + line + " pointing it to FF...");
        //points to 00
        return 'FF';
    }
    //adds the terminate value
    heap.unshift("00");
    //removes one from the heap
    heapAddress--;
    //loops through the string
    for (var i = str.length - 1; i >= 0; i--) {
        //adds the hex value to the string
        heap.unshift(toHex(str.charAt(i)));
        //removes one from the heap
        heapAddress--;
    }
    //adds to the string table
    stringTable.add(numtoHex(heapAddress), str);
    //outputs info about the add
    codeLog("Added string [ <span class=\"code\">" + str + "</span> ] to heap, address " + heapAddress + " [ <span class=\"code\">" + numtoHex(heapAddress) + "</span> ]...");
    //returns heap address
    return numtoHex(heapAddress);
}
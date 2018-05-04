var tree;
var code = [];
var cErrors = 0;
var cWarnings = 0;
var staticData = new StaticData();
var TEMPORARY_ADDRESS = "TMP1";
var SECONDARY_TEMPORARY_ADDRESS = "TMP2";

function gen(ast) {
    tree = ast;
    code = [];
    cErrors = 0;
    cWarnings = 0;
    staticData = new StaticData();

    code = generate();

    return code;
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
    traverseTree(ast.root, 0);
    addHex(breakOp);
}

/* ----------------------------------------- Hex Related Functions ----------------------------------------- */
function addHex(val) {
    code.push(val);
    if (verbose) {
        codeLog("Pushing [ " + val + " ] byte to memory...");
    }
}

function toHex(val) {
    return pad(toHexidecimal(val.charCodeAt(0)), 2, '0');
 }
 
  function numtoHex(val) {
    return pad(toHexidecimal(parseInt(value)), 2, '0').toUpperCase();
 }
 /* --------------------------------------- End Hex Related Functions --------------------------------------- */

function traverseTree(pos, depth) {
    if (!pos.children || pos.children.length === 0) {
        console.log(pos.name + " at depth " + depth);
    } else {
        if (pos.name == "Root")
            cRoot(pos.children, depth);
        else if (pos.name.includes("Program"))
            cProgram(pos.children, depth);
        else if (pos.name == "Block")
            cBlock(pos.children, depth);
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
            cEqualy(pos, depth);
        else if (pos.name == "Inequality")
            cInequaly(pos, depth);
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
    if (verbose) {
        codeLog("Found [ " + pos.name + " ] on line " + pos.line + " in scope " + pos.scope + "...");
    }
    //loops through the level
    for (var i = 0; i < pos.length; i++) {
        //moves deeper on each one
        traverseTree(pos[i], depth + 1);
    }
}

function cAddition(pos, depth) {
}

function cVarDecl(pos, depth) {
}

function cAssign(pos, depth) {
}

function cPrint(pos, depth) {
}

function cWhile(pos, depth) {
}

function cIf(pos, depth) {
}

function cInequality(pos, depth) {

}

function cEquality(pos, depth) {
}
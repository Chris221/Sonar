var tree;
var code = [];
var cErrors = 0;
var cWarnings = 0;

function gen(ast) {
    tree = ast;
    code = [];
    cErrors = 0;
    cWarnings = 0;

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
            cAssignState(pos, depth);
        else if (pos.name == "Print")
            cPrintState(pos, depth);
        else if (pos.name == "IfStatement")
            cIfState(pos, depth);
        else if (pos.name == "WhileStatement")
            cWhileState(pos, depth);
        else if (pos.name == "Addition") {
            return cAddition(pos, depth);
        } else {
            for (var i = 0; i < pos.children.length; i++) {
                //moves deeper on each one
                traverseTree(pos.children[i], depth + 1);
            }
        }
    }
}

function cRoot(pos, depth) {
    //loops through the level
    for (var i = 0; i < pos.length; i++) {
        //moves deeper on each one
        traverseTree(pos[i], depth + 1);
    }
}

function cProgram(pos, depth) {
    //loops through the level
    for (var i = 0; i < pos.length; i++) {
        //moves deeper on each one
        traverseTree(pos[i], depth + 1);
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

}
}
// JavaScript Document

//defines the token list
var aTokens = [];
//defines the token number
var aTokenNumber = 0;
//defines the current token
var aCurrentToken;
//defines the analysis errors
var aErrors = 0;
//defines the analysis warnings
var aWarnings = 0;
//defines the scope
var scope = -1;
//defines the scope level
var scopeLevel = -1;
//defines the temp ID
var tempID = null;
//defines the temp value
var tempValue = null;
//defines the temp type
var tempType = null;
//defines the adding bool
var addingValue = false;
//defines the symbol table HTML string
var symboltable = "";

//sets the AST and root node
var ast = new Tree();
ast.addNode("Root", "branch");

//sets the symbol tree
var st = new symbolTree();

//resets the globals, AST, and symbol tree
function aResetGlobals() {
    aTokens = [];
    aTokenNumber = 0;
    aCurrentToken;
    aErrors = 0;
    aWarnings = 0;
    addingValue = false;
    tempID = null;
    tempType = null;
    scope = -1;
    scopeLevel = -1;

    ast = new Tree();
    ast.addNode("Root", "branch");
    st = new symbolTree();
}

function aGetToken() {
    //increases token count
    aTokenNumber++;
    //sets current token
    aCurrentToken = aTokens[0];
    //removes the token from the list
    aTokens.shift();
}

function aCheckNext() {
    //Gets next
    return aTokens[0];
}

function checkIfVarExists(id) {
    //Checks if the symbol already exists in the scope
    for (var i = 0; i < st.cur.symbols.length; i++) {
        //when the correct ID is found
        if (id == st.cur.symbols[i].getKey()) {
            //returns the line
            return st.cur.symbols[i].getLine();
        }
    }
}

function buildSymbolTable(level, r = "") {
    //if the current level has symbols
    if (level.symbols.length > 0) {
        //for each symbol 
        for (var i = 0; i < level.symbols.length; i++) {
            //add row to table
            r += "<tr><td>" + level.symbols[i].getKey() + "</td><td>" + level.symbols[i].getType() + "</td><td>" + level.symbols[i].getScope() + "</td><td>" + level.symbols[i].getLine() + "</td></tr>";
        }
    }
    //If lower level, search there
    if (level.children != undefined || level.children != null) {
        //loops through all children
        for (var j = 0; j < level.children.length; j++) {
            //calls a search in the lover levels
            r = buildSymbolTable(level.children[j], r);
        }
    }
    //return table
    return r;
}

function checkIfAllVarsUsed(level) {
    //if the current level has symbols
    if ((level.parent != undefined || level.parent != null) && level.symbols.length > 0) {
        //Checks all symbols if they were used
        for (var i = 0; i < level.symbols.length; i++) {
            //when the correct ID is found
            if (level.symbols[i].utilized == false) {
                //increases Warnings
                aWarnings++;
                //outputs error
                analysisLog("Warning! ID [ " + level.symbols[i].getKey() + " ] on line " + level.symbols[i].line + " was never utilized...");
            }
        }
        //If higher level, search there
    }
    if (level.parent != undefined || level.parent != null) {
        //calls a search in the higher levels
        checkIfAllVarsUsed(level.parent);
    }
}

function setVarUsed(id, level) {
    //if the current level has symbols
    if ((level.parent != undefined || level.parent != null) && level.symbols.length > 0) {
        //Checks if the symbol already exists in the scope
        for (var i = 0; i < level.symbols.length; i++) {
            //when the correct ID is found
            if (id == level.symbols[i].getKey()) {
                //Outputs setting text
                analysisLog("Variable [ " + id + " ] used on line " + aCurrentToken.line + "...");
                //sets initialized and the value
                level.symbols[i].utilized = true;
            }
        }
    }
    //If higher level, search there
    if (level.parent != undefined || level.parent != null) {
        //calls a search in the higher levels
        setVarUsed(id, level.parent);
    }
}

function setVarValue(id, val, level) {
    //if the current level has symbols
    if ((level.parent != undefined || level.parent != null) && level.symbols.length > 0) {
        //Checks if the symbol already exists in the scope
        for (var i = 0; i < level.symbols.length; i++) {
            //when the correct ID is found
            if (id == level.symbols[i].getKey()) {
                //Outputs setting text
                analysisLog("Setting variable [ " + id + " ] on line " + aCurrentToken.line + " to [ " + val + " ]...");
                //sets initialized and the value
                level.symbols[i].initialized = true;
                level.symbols[i].value = val;
                //gets the scope for later 
                var localScope = level.symbols[i].scope;
            }
        }
    }
    //If higher level, search there
    if (level.parent != undefined || level.parent != null) {
        //calls a search in the higher levels
        setVarValue(id, val, level.parent);
    }
    for (var i = 0; i < allSymbols.length; i++) {
        //when the correct ID is found in the right scope
        if ((id == allSymbols[i].getKey()) && (localScope == allSymbols[i].scope)) {
            //Outputs setting text
            //sets initialized and the value
            allSymbols[i].initialized = true;
            allSymbols[i].value = val;
        }
    }
}

function isThere(id, level) {
    //if the current level has symbols
    if ((level.parent != undefined || level.parent != null) && level.symbols.length > 0) {
        //finds the ID
        for (var i = 0; i < level.symbols.length; i++) {
            //when the correct ID is found
            if (id == level.symbols[i].getKey()) {
                //returns true
                return true;
            }
        }
    }
    //If higher level, search there
    if (level.parent != undefined || level.parent != null) {
        //calls a search in the higher levels
        return getVarType(id, level.parent);
    }
    //or doesn't
    return false;
}

function getVarType(id, level) {
    //if the current level has symbols
    if ((level.parent != undefined || level.parent != null) && level.symbols.length > 0) {
        //Gets the type of ID
        for (var i = 0; i < level.symbols.length; i++) {
            //when the correct ID is found
            if (id == level.symbols[i].getKey()) {
                //returns the type
                return level.symbols[i].type;
            }
        }
    }
    //If higher level, search there
    if (level.parent != undefined || level.parent != null) {
        //calls a search in the higher levels
        return getVarType(id, level.parent);
    }
}

function getVarValue(id, level) {
    //if the current level has symbols
    if ((level.parent != undefined || level.parent != null) && level.symbols.length > 0) {
        //Gets the value of ID
        for (var i = 0; i < level.symbols.length; i++) {
            //when the correct ID is found
            if (id == level.symbols[i].getKey() && programNumber == level.symbols[i].programNumber) {
                //returns the value
                return level.symbols[i].value;
            }
        }
    }
    //If higher level, search there
    if (level.parent != undefined || level.parent != null) {
        //calls a search in the higher levels
        return getVarValue(id, level.parent);
    }
}

//runs the analyzer
function analyzer(input) {
    //resets the globals
    aResetGlobals();
    //if verbose
    analysisLog("Analysing program " + programNumber + "..\n", true);
    //sets the token list
    aTokens = input;
    //calls the first token check
    aProgram();

    //Checks for unutilized IDs
    checkIfAllVarsUsed(st.cur);

    //Defines the completion text
    var completedText = "\nThe semantic analysis successfully passed with " + aWarnings + " warnings";

    //if any errors
    if (aErrors) {
        //Sets failed for the completed semantic analysis output
        completedText = "\nThe semantic analysis FAILED with " + aErrors + " errors and " + aWarnings + " warnings";
    } else {
        //outputs AST and Scope Tree to there locations on the page
        $('#ast').val($('#ast').val() + ast.toString());
        $('#scopetree').val($('#scopetree').val() + "Program " + programNumber + "\n" + st.toString() + "\n");
        //sets the table
        var table = buildSymbolTable(st.cur);
        //if table is empty
        if (table == "" || table == null || table == undefined) {
            table = "<tr><td><b><i>NA</i></b></td><td><b><i>NA</i></b></td><td><b><i>NA</i></b></td><td><b><i>NA</i></b></td></tr>";
        }
        symboltable += "Program " + programNumber + "<br/><table><tr><th>ID Name</th><th>Type</th><th>Scope</th><th>Line</th></tr>" + table + "</table><br />";
        $('#symboltable').html(symboltable);
    }
    //Outputs the completed Text
    $('#Lexer_log').text($('#Lexer_log').val() + completedText);

    //returns error number
    return aErrors;
}

function addBranch(name) {
    //Creates a Branch
    ast.addNode(name, "branch", aCurrentToken.line, scope, name);
}

//Sets the analysis log
function analysisLog(text, override = false) {
    //Appends new logging to current log
    var lText = $('#Lexer_log').val() + "ANALYZER -- " + text + "\n";
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

function aProgram() {
    //starts ast branch
    ast.addNode("Program " + programNumber, "branch");

    //debugging
    if (debug && verbose) {
        analysisLog("Program..");
    }

    //moves token pointer
    aGetToken();

    // Initialize parsing of Block
    aBlock();

    //Checks for EOP
    if (aCurrentToken.type == "EOP") {
        //moves token pointer
        aGetToken();
    }

    //back out a level in the ast
    ast.kick();
}

function aBlock() {
    //increases the scope levels
    scopeLevel++;
    scope++;

    //debugging
    if (debug && verbose) {
        analysisLog("Block..");
    }

    //Creates Scope Node in Symbol Tree
    st.addNode("ScopeLevel: " + scope, "branch", scope);

    //Creates a Branch
    addBranch("Block");

    //Checks for LEFT_BRACE
    if (aCurrentToken.type == "LEFT_BRACE") {
        //changes the token
        aGetToken();
    }

    // Initialize parsing of StatementList
    aStatementList();

    //Checks for RIGHT_BRACE
    if (aCurrentToken.type == "RIGHT_BRACE") {
        //moves token pointer
        aGetToken();
    }

    scopeLevel--;
    // Kicks you one Scope up the Symbol Tree
    st.kick();
}

function aStatementList() {
    //debugging
    if (debug && verbose) {
        analysisLog("Statement List..");
    }
    //if a Right Brace
    if (aCurrentToken.type == "RIGHT_BRACE") {
        //NOTHING TIME TO RETURN!!!
        //if any other statement keyword
    } else if (aCurrentToken.type == "PRINT" || aCurrentToken.type == "ID"
        || aCurrentToken.type == "INT" || aCurrentToken.type == "STRING"
        || aCurrentToken.type == "BOOLEAN" || aCurrentToken.type == "WHILE"
        || aCurrentToken.type == "IF" || aCurrentToken.type == "LEFT_BRACE") {
        //goes to statement
        aStatement();
        //calls self
        aStatementList();
    }
}

//checks for statements
function aStatement() {
    //debugging
    if (debug && verbose) {
        analysisLog("Statement..");
    }
    //if print
    if (aCurrentToken.type == "PRINT") {
        //goes to print statements
        aPrintStatement();
        //if ID
    } else if (aCurrentToken.type == "ID") {
        //goes to assignment statements
        aAssignmentStatement();
        //if INT, STRING, or BOOLEAN
    } else if (aCurrentToken.type == "INT" || aCurrentToken.type == "STRING" || aCurrentToken.type == "BOOLEAN") {
        //goes to variable declarations
        aVarDecl();
        //if WHILE
    } else if (aCurrentToken.type == "WHILE") {
        //goes to while statements
        aWhileStatement();
        //if IF
    } else if (aCurrentToken.type == "IF") {
        //goes to if statements
        aIfStatement();
        //if LEFT_BRACE
    } else if (aCurrentToken.type == "LEFT_BRACE") {
        //goes to block
        aBlock();
    }
}

//handles the print statement
function aPrintStatement() {
    //Creates a Branch
    addBranch("Print");

    //debugging
    if (debug && verbose) {
        analysisLog("Print..");
    }
    //Changes the token
    aGetToken();
    //if LEFT_PARENTHESES
    if (aCurrentToken.type == "LEFT_PARENTHESES") {
        //Changes the token
        aGetToken();
    }

    //goes to expressions
    aExpr();

    //if RIGHT_PARENTHESES
    if (aCurrentToken.type == "RIGHT_PARENTHESES") {
        //Changes the token
        aGetToken();
    }

    //backs out a branch
    ast.kick();
}

//handles assignment statements
function aAssignmentStatement() {
    //Creates a Branch
    addBranch("AssignmentStatement");
    //debugging
    if (debug && verbose) {
        analysisLog("assignmentStatement..");
    }
    //if ASSIGNMENT_OPERATOR
    if (aCurrentToken.type == "ID") {
        //sets the id and type for later
        var id = aCurrentToken.value;
        var type = getVarType(id, st.cur);
        if (type == undefined) {
            //increases errors
            aErrors++;
            //outputs error
            analysisLog("ERROR! ID [ " + id + " ] on line " + aCurrentToken.line + " was not declared in scope " + scope + "...");
        }
        if (!addingValue) {
            //when adding set the temp globals to the locals
            tempID = id;
            try {
                tempType = type.toUpperCase();
            } catch (e) {
                tempType = null;
            }
            //turn on adding value bool
            addingValue = true;
            //if temps don't exist
            if (tempValue == null || tempValue == undefined) {
                //set it
                tempValue = getVarValue(id, st.cur);
                //if temps exist
            } else {
                //add them
                tempValue = Number(tempValue) + Number(getVarValue(id, st.cur));
            }
        }

        //goes to ID
        aID();
    }


    //if ASSIGNMENT_OPERATOR
    if (aCurrentToken.type == "ASSIGNMENT_OPERATOR") {
        //changes the token
        aGetToken();
        //if adding
        if (addingValue) {
            //a digit
            if (aCurrentToken.type == "DIGIT") {
                //if temp is an int
                if (tempType == "INT") {
                    //and next is not a plus
                    if (aCheckNext().type != "PLUS") {
                        //if temp is 0
                        if (tempValue == 0) {
                            //set temp
                            tempValue = Number(aCurrentToken.value);
                            //otherwise
                        } else {
                            //add them together
                            tempValue = Number(tempValue) + Number(aCurrentToken.value);
                        }
                        //then set the value
                        setVarValue(tempID, tempValue, st.cur);
                        //reset temps and adding bool
                        addingValue = false;
                        tempID = null;
                        tempType = null;
                        tempValue = null;
                    } else {
                        tempValue = null;
                    }
                } else if (tempType == "BOOLEAN") {
                    if (Number(aCurrentToken.value) > 0) {
                        var t = true;
                    } else {
                        t = false;
                    }
                    //add the value
                    setVarValue(tempID, t, st.cur);
                    //reset the tempory bool and ID
                    addingValue = false;
                    tempID = null;
                    tempType = null;
                    tempValue = null;
                } else {
                    //increases errors
                    aErrors++;
                    //outputs error
                    analysisLog("ERROR! ID [ " + tempID + " ] was expecting type [ " + tempType + " ] but was given [ INT ]...");
                }
                //an id
            } else if (aCurrentToken.type == "ID") {
                var cvType = getVarType(aCurrentToken.value, st.cur).toUpperCase();
                if (tempType != cvType) {
                    //increases errors
                    aErrors++;
                    //outputs error
                    analysisLog("ERROR! Type mismatch [ " + id + " ] on line " + aCurrentToken.line + " is defined as [ " + tempType + " ] and was assigned [ " + cvType + " ]...");
                }
                //if temp is 0
                if (tempValue == 0) {
                    //set temp
                    tempValue = getVarValue(aCurrentToken.value, st.cur);
                    //otherwise
                } else {
                    //add them together
                    tempValue = Number(tempValue) + Number(getVarValue(aCurrentToken.value, st.cur));
                }
                //then set the value
                setVarValue(tempID, tempValue, st.cur);
                //reset temps and adding bool
                addingValue = false;
                tempID = null;
                tempType = null;
                tempValue = null;
                //a bool value
            } else if ((aCurrentToken.type == "TRUE") || (aCurrentToken.type == "FALSE")) {
                //if temp type is a bool
                if (tempType == "BOOLEAN") {
                    //set val
                    var val;
                    //if type is true
                    if (aCurrentToken.type == "TRUE") {
                        //set bool val
                        val = true;
                        //if type is false
                    } else if (aCurrentToken.type == "FALSE") {
                        //set bool val
                        val = false;
                    }
                    //then set the value
                    setVarValue(tempID, val, st.cur);
                    //reset temps and adding bool
                    addingValue = false;
                    tempID = null;
                    tempType = null;
                    tempValue = null;
                    //must be error
                } else {
                    //increases errors
                    aErrors++;
                    //outputs error
                    analysisLog("ERROR! ID [ " + tempID + " ] was expecting type [ " + tempType + " ] but was given [ BOOLEAN ]...");
                }
            }
        }
        //goes to expr
        aExpr();
    }

    //backs out a branch
    ast.kick();
}

//handles variable declarations
function aVarDecl() {
    //Creates a Branch
    addBranch("VarDecl");
    //debugging
    if (debug && verbose) {
        analysisLog("varDecl..");
    }
    //temp variable for getting the type of var
    var type = aCurrentToken.type.toLowerCase();
    //changes the token
    aGetToken();
    //if ID
    if (aCurrentToken.type == "ID") {
        //Checks if previously declared
        if (line = checkIfVarExists(aCurrentToken.value)) {
            //increases errors
            aErrors++;
            //outputs error
            analysisLog("ERROR! ID [ " + aCurrentToken.value + " ] on line " + aCurrentToken.line + " was prevously declared on line " + line + "...");
        } else {
            //Create new symbol
            var symbol = new Symbol(aCurrentToken.value, type, aCurrentToken.line, scope, scopeLevel, programNumber, false, false, false);
            //Adds the symbol to Current Branch
            st.cur.symbols.push(symbol);
            //Adds the symbol to allSymbols
            allSymbols.push(symbol);
            //outputs variable declared
            analysisLog("New variable declared [ " + aCurrentToken.value + " ] on line " + aCurrentToken.line + " with type [ " + type + " ]...");
        }
        //goes to aID
        aID();
    }

    //backs out a branch
    ast.kick();
}

function aWhileStatement() {
    //Creates a Branch
    addBranch("WhileStatement");
    //debugging
    if (debug && verbose) {
        analysisLog("whileStatement..");
    }
    //changes the token
    aGetToken();
    //if LEFT_PARENTHESES, TRUE, or FALSE
    if (aCurrentToken.type == "LEFT_PARENTHESES" || aCurrentToken.type == "TRUE" || aCurrentToken.type == "FALSE") {
        //go to boolean expression
        aBooleanExpr();
        //changes the token
        aGetToken();
        //goes to block
        aBlock();
    }

    //backs out a branch
    ast.kick();
}

function aIfStatement() {
    //Creates a Branch
    addBranch("IfStatement");
    //debugging
    if (debug && verbose) {
        analysisLog("ifStatement..");
    }
    //changes the token
    aGetToken();
    //if LEFT_PARENTHESES, TRUE, or FALSE
    if (aCurrentToken.type == "LEFT_PARENTHESES" || aCurrentToken.type == "TRUE" || aCurrentToken.type == "FALSE") {
        //go to boolean expression
        aBooleanExpr();
        //changes the token
        aGetToken();
        //goes to block
        aBlock();
    }

    //backs out a branch
    ast.kick();
}

//handles expressions
function aExpr() {
    //debugging
    if (debug && verbose) {
        analysisLog("Expr..");
    }
    //if Digit
    if (aCurrentToken.type == "DIGIT") {
        //go to int expression
        aIntExpr();
        //if Quote
    } else if (aCurrentToken.type == "QUOTE") {
        //go to string expression
        aStringExpr();
        //if left parentheses
    } else if (aCurrentToken.type == "LEFT_PARENTHESES" || aCurrentToken.type == "TRUE" || aCurrentToken.type == "FALSE") {
        //go to boolean expression
        aBooleanExpr();
        //if left parentheses
    } else if (aCurrentToken.type == "ID") {
        //if adding a value
        if (addingValue) {
            //if temp is 0
            if (tempValue == 0) {
                //gets temp value
                tempValue = Number(getVarValue(aCurrentToken.value, st.cur));
                //otherwise
            } else {
                //adds the values together
                tempValue = Number(tempValue) + Number(getVarValue(aCurrentToken.value, st.cur));
            }
            //sets value
            setVarValue(tempID, tempValue, st.cur);
            //reset temps and adding bool
            addingValue = false;
            tempID = null;
            tempType = null;
            tempValue = null;
        } else {
            //marks the var as used
            setVarUsed(aCurrentToken.value, st.cur);
        }
        //go to ID
        aID();
    }
}

//handles int expressions
function aIntExpr() {
    //debugging
    if (debug && verbose) {
        analysisLog("intExpr..");
    }
    //if next is PLUS add branch
    if (aCheckNext().type == "PLUS") {
        addBranch("Addition");
    }
    //if adding a value
    if (addingValue) {
        //if temp is null
        if (tempValue == null) {
            //gets temp value
            tempValue = Number(aCurrentToken.value);
            //otherwise
        } else {
            //adds the values together
            tempValue = Number(tempValue) + Number(aCurrentToken.value);
        }
    }
    //goes to aID
    aID();

    //if PLUS
    if (aCurrentToken.type == "PLUS") {
        //changes the token
        aGetToken();
        //goes to expr
        aExpr();

        //backs out a branch
        ast.kick();
    }
    //if adding a value
    if (addingValue) {
        //adds the values together
        tempValue = Number(tempValue) + Number(aCurrentToken.value);
    }
}

//handles string expressions
function aStringExpr() {

    //debugging
    if (debug && verbose) {
        analysisLog("stringExpr..");
    }

    //cheks for first quote
    if (aCurrentToken.type == "QUOTE") {
        //changes the token
        aGetToken();
    }

    //goes to char list
    var s = aCharList();

    //cheks for second quote
    if (aCurrentToken.type == "QUOTE") {
        //if adding a value
        if (addingValue) {
            //if temp type is a string
            if (tempType == "STRING") {
                //add the value
                setVarValue(tempID, s, st.cur);
                //reset the tempory bool and ID
                addingValue = false;
                tempID = null;
                tempType = null;
                tempValue = null;
            } else if (tempType == "BOOLEAN") {
                if (s.length > 0) {
                    var t = true;
                } else {
                    t = false;
                }
                //add the value
                setVarValue(tempID, t, st.cur);
                //reset the tempory bool and ID
                addingValue = false;
                tempID = null;
                tempType = null;
                tempValue = null;
            } else {
                //increases errors
                aErrors++;
                //outputs error
                analysisLog("ERROR! ID [ " + tempID + " ] was expecting type [ " + tempType + " ] but was given [ STRING ]...");
            }
        }
        //changes the token
        aGetToken();
    }
}

function aID() {
    //if type is ID
    if (aCurrentToken.type == "ID") {
        //if is not defined
        if (!isThere(aCurrentToken.value, st.cur)) {
            //increases errors
            aErrors++;
            //outputs error
            analysisLog("ERROR! ID [ " + aCurrentToken.value + " ] on line " + aCurrentToken.line + " was used before it was declared...");
        }
    }
    // Creates a leaf
    ast.addNode(aCurrentToken.value, "leaf", aCurrentToken.line, scope, aCurrentToken.type);
    //Changes the token
    aGetToken();
}

//handles char list
function aCharList() {
    //debugging
    if (debug && verbose) {
        analysisLog("charList..");
    }

    //sets string val
    var r = aCurrentToken.value;
    //gets next token
    aGetToken();
    //if CHAR
    if (aCurrentToken.type == "CHAR") {
        //creturns self concating self
        return (r + aCharList());
        //otherwise
    } else {
        //return self
        return r;
    }
}


//handles boolean expression
function aBooleanExpr() {
    //debugging
    if (debug && verbose) {
        analysisLog("booleanExpr..");
    }
    if (aCurrentToken.type == "TRUE" || aCurrentToken.type == "FALSE") {
        //goes to aID
        aID();
    }
    //if LEFT_PARENTHESES
    if (aCurrentToken.type == "LEFT_PARENTHESES") {
        //changes the token
        aGetToken();
        //declairs a close out bool
        var closeOut = false;
        //if DOUBLE_EQUALS or NOT_EQUALS
        if (aCheckNext().type == "DOUBLE_EQUALS") {
            //Creates a Branch
            addBranch("Equality");
            //sets close out bool for the branch
            closeOut = true;
        } else if (aCheckNext().type == "NOT_EQUALS") {
            //Creates a Branch
            addBranch("Inequality");
            //sets close out bool for the branch
            closeOut = true;
        }
        //goes to expression
        aExpr();
        //if DOUBLE_EQUALS or NOT_EQUALS
        if (aCurrentToken.type == "DOUBLE_EQUALS" || aCurrentToken.type == "NOT_EQUALS") {
            //changes the token
            aGetToken();
            //goes to expression
            aExpr();
        }
        //if the current branch has two leaves
        if (ast.cur.children.length >= 2) {
            //loop through them
            for (var i = 0; i < (ast.cur.children.length - 1); i++) {
                //if this and the next are both IDs
                if (ast.cur.children[i].type == "ID" && ast.cur.children[i + 1].type == "ID") {
                    //if the types don't match
                    if (getVarType(ast.cur.children[i].name, st.cur) != getVarType(ast.cur.children[i + 1].name, st.cur)) {
                        //increases errors
                        aErrors++;
                        //outputs error
                        analysisLog("ERROR! ID [ " + ast.cur.children[i].name + " ] on line " + ast.cur.children[i].line + " type [ " + getVarType(ast.cur.children[i].name, st.cur) + " ] cannot be compared to [ " + getVarType(ast.cur.children[i + 1].name, st.cur) + " ]...");
                    }
                }
            }
        }

        //if RIGHT_PARENTHESES
        if (aCurrentToken.type == "RIGHT_PARENTHESES") {
            //changes the token
            aGetToken();
        }

        //if close out branch
        if (closeOut) {
            //backs out a branch
            ast.kick();
        }
    }
}
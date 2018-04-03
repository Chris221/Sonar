// JavaScript Document

//defines the token list, current token, parser errors, brace level, program level, program level counter, in print, in bool, and finished.
var aTokens = [];
var aTokenNumber = 0;
var aCurrentToken;
var aErrors = 0;
var aWarnings = 0;
var scope = -1;
var scopeLevel = -1;
var tempID = null;
var tempValue = null;
var tempType = null;
var addingValue = false;

//sets the AST and root node
var ast = new Tree();
ast.addNode("Root", "branch");

//sets the symbol tree
var st = new symbolTree();

//resets the globals and AST
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
    for(var i = 0; i < st.cur.symbols.length; i++) {
        //when the correct ID is found
        if (id == st.cur.symbols[i].getKey()) {
            //returns the line
            return st.cur.symbols[i].getLine();
        }
    }
}

function checkIfAllVarsUsed(level) {
    //Checks if the symbol already exists in the scope
    //if symbols exist search 
    if ((level.parent != undefined || level.parent != null) && level.symbols.length > 0) {
        for(var i = 0; i < level.symbols.length; i++) {
            //when the correct ID is found
            if (level.symbols[i].utilized == false && programNumber == level.symbols[i].programNumber) {
                //increases Warnings
                aWarnings++;
                //outputs error
                analysisLog("Warning! ID [ "+level.symbols[i].getKey()+" ] on line "+level.symbols[i].line+" was never utilized...");
            }
        }
    //If higher level, search there
    } else if (level.parent != undefined || level.parent != null) {
        //calls a search in the higher levels
        checkIfVarUsed(level.parent);
    }
}

function setVarUsed(id, level) {
    //Checks if the symbol already exists in the scope
    //if symbols exist search 
    if ((level.parent != undefined || level.parent != null) && level.symbols.length > 0) {
        for(var i = 0; i < level.symbols.length; i++) {
            //when the correct ID is found
            if (id == level.symbols[i].getKey()) {
                //Outputs setting text
                analysisLog("Variable [ "+id+" ] used on line "+aCurrentToken.line+"...");
                //sets initialized and the value
                level.symbols[i].utilized = true;
            }
        }
    //If higher level, search there
    } else if (level.parent != undefined || level.parent != null) {
        //calls a search in the higher levels
        setVarUsed(id,level.parent);
    }
}

function setVarValue(id, val, level) {
    //Checks if the symbol already exists in the scope
    //if symbols exist search 
    if ((level.parent != undefined || level.parent != null) && level.symbols.length > 0) {
        for(var i = 0; i < level.symbols.length; i++) {
            //when the correct ID is found
            if (id == level.symbols[i].getKey()) {
                //Outputs setting text
                analysisLog("Setting variable [ "+id+" ] on line "+aCurrentToken.line+" to [ "+val+" ]...");
                //sets initialized and the value
                level.symbols[i].initialized = true;
                level.symbols[i].value = val;
            }
        }
    //If higher level, search there
    } else if (level.parent != undefined || level.parent != null) {
        //calls a search in the higher levels
        setVarValue(id,val,level.parent);
    }
    for(var i = 0; i < allSymbols.length; i++) {
        //when the correct ID is found
        if (id == allSymbols[i].getKey()) {
            //Outputs setting text
            //sets initialized and the value
            allSymbols[i].initialized = true;
            allSymbols[i].value = val;
        }
    }
}

function getVarType(id,level) {
    //Gets the type of ID
    //if symbols exist search 
    if (level.symbols.length > 0) {
        for(var i = 0; i < level.symbols.length; i++) {
            //when the correct ID is found
            if (id == level.symbols[i].getKey() && programNumber == level.symbols[i].programNumber) {
                //returns the type
                return level.symbols[i].type;
            }
        }
    //If higher level, search there
    } else if (level.parent != undefined || level.parent != null) {
        //calls a search in the higher levels
        return getVarType(id,level.parent);
    }
}

function getVarValue(id,level) {
    //Gets the type of ID
    //if symbols exist search 
    if (level.symbols.length > 0) {
        for(var i = 0; i < level.symbols.length; i++) {
            //when the correct ID is found
            if (id == level.symbols[i].getKey() && programNumber == level.symbols[i].programNumber) {
                //returns the type
                return level.symbols[i].value;
            }
        }
    //If higher level, search there
    } else if (level.parent != undefined || level.parent != null) {
        //calls a search in the higher levels
        return getVarValue(id,level.parent);
    }
}
 
//runs the analyzer
function analyzer(input) {
    //resets the globals
    aResetGlobals();
    //if verbose
    analysisLog("Analysing program "+programNumber+"..\n",true);
    //sets the token list
    aTokens = input;
    //calls the first token check
    aProgram();

    //Checks for unutilized IDs
    checkIfAllVarsUsed(st.cur);

    //Defines the completion text
    var completedText = "\nThe semantic analysis successfully passed with "+aWarnings+" warnings";
    
    //if any errors
    if (aErrors) {
		//Sets failed for the completed semantic analysis output
		completedText = "\nThe semantic analysis FAILED with "+aErrors+" errors and "+aWarnings+" warnings";
	} else {
        $('#ast').val($('#ast').val()+ast.toString());
        $('#scopetree').val($('#scopetree').val()+"Program "+programNumber+"\n"+st.toString());
    }
	//Outputs the completed Text
	$('#Lexer_log').text($('#Lexer_log').val()+completedText);
    
    //returns error number
    return aErrors;
}

function addBranch(name) {
    //Creates a Branch
    ast.addNode(name, "branch", aCurrentToken.line, scope, name);
}

//Sets the parsers log
function analysisLog(text,override = false) {
    //Appends new logging to current log
    var lText = $('#Lexer_log').val()+"ANALYZER -- "+text+"\n";
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
    ast.addNode("Program "+programNumber, "branch");

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
    if (aCurrentToken.type == "RIGHT_BRACE"){
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
        var id = aCurrentToken.value;
        var type = getVarType(id, st.cur);
        if (type == undefined) {
            //increases errors
            aErrors++;
            //outputs error
            analysisLog("ERROR! ID [ "+id+" ] on line "+aCurrentToken.line+" was not declared in scope "+scope+"...");
        }
        if (!addingValue) {
            tempID = id;
            tempType = type.toUpperCase();
            addingValue = true;
            if (tempValue == null || tempValue == undefined) {
                tempValue = getVarValue(id,st.cur);
            } else {
                tempValue = Number(tempValue) + Number(getVarValue(id,st.cur));
            }
        }
        
        //goes to ID
        aID();
    }


    //if ASSIGNMENT_OPERATOR
    if (aCurrentToken.type == "ASSIGNMENT_OPERATOR") {
        //changes the token
        aGetToken();
        if (addingValue) {
            if (aCurrentToken.type == "DIGIT") {
                if (tempType == "INT") {
                    if (aCheckNext().type != "PLUS") {
                        if (tempValue == 0) {
                            tempValue = Number(aCurrentToken.value);
                        } else {
                            tempValue =  Number(tempValue) + Number(aCurrentToken.value);
                        }
                        setVarValue(tempID,tempValue,st.cur);
                        addingValue = false;
                        tempID = null;
                        tempType = null;
                        tempValue = null;
                    } else {
                        tempValue = null;
                    }
                } else {
                    //increases errors
                    aErrors++;
                    //outputs error
                    analysisLog("ERROR! ID [ "+tempID+" ] was expecting type [ "+tempType+" ] but was given [ INT ]...");
                }
            } else if (aCurrentToken.type == "ID") {
                if (tempValue == 0) {
                    tempValue = Number(getVarValue(aCurrentToken.value,st.cur));
                } else {
                    tempValue = Number(tempValue) + Number(getVarValue(aCurrentToken.value,st.cur));
                }
                setVarValue(tempID,tempValue,st.cur);
                addingValue = false;
                tempID = null;
                tempType = null;
                tempValue = null;
            } else if ((aCurrentToken.type == "TRUE") || (aCurrentToken.type == "FALSE")) {
                if (tempType == "BOOLEAN") {
                    var val;
                    if (aCurrentToken.type == "TRUE") {
                        val = true;
                    } else if (aCurrentToken.type == "FALSE") {
                        val = false;
                    }
                    setVarValue(tempID,val,st.cur);
                    addingValue = false;
                    tempID = null;
                    tempType = null;
                    tempValue = null;
                } else {
                    //increases errors
                    aErrors++;
                    //outputs error
                    analysisLog("ERROR! ID [ "+tempID+" ] was expecting type [ "+tempType+" ] but was given [ BOOLEAN ]...");
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
            analysisLog("ERROR! ID [ "+aCurrentToken.value+" ] on line "+aCurrentToken.line+" was prevously declared on line "+line+"...");
        } else {
            //Create new symbol
            var symbol = new Symbol(aCurrentToken.value, type, aCurrentToken.line, scope, scopeLevel, programNumber, false, false, false);
            //Adds the symbol to Current Branch
            st.cur.symbols.push(symbol);
            //Adds the symbol to allSymbols
            allSymbols.push(symbol);
            analysisLog("New variable declared [ "+aCurrentToken.value+" ] on line "+aCurrentToken.line+" with type [ "+type+" ]...");
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
            if (tempValue == 0) {
                tempValue = Number(getVarValue(aCurrentToken.value,st.cur));
            } else {
                tempValue =  Number(tempValue) + Number(getVarValue(aCurrentToken.value,st.cur));
            }
            setVarValue(tempID,tempValue,st.cur);
            addingValue = false;
            tempID = null;
            tempType = null;
            tempValue = null;
        } else {
            setVarUsed(aCurrentToken.value,st.cur);
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
        if (tempValue == null) {
            tempValue = Number(aCurrentToken.value);
        } else {
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
        tempValue += aCurrentToken.value;
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
            if (tempType == "STRING") {
                //add the value
                setVarValue(tempID,s,st.cur);
                //reset the tempory bool and ID
                addingValue = false;
                tempID = null;
                tempType = null;
                tempValue = null;
            } else {
                //increases errors
                aErrors++;
                //outputs error
                analysisLog("ERROR! ID [ "+tempID+" ] was expecting type [ "+tempType+" ] but was given [ STRING ]...");
            }
        }
        //changes the token
        aGetToken();
    }
}

function aID() {
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
    
    var r = aCurrentToken.value;
    aGetToken();
    if (aCurrentToken.type == "CHAR") {
        return (r+aCharList());
    } else {
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
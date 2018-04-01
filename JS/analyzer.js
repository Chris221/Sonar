// JavaScript Document

//defines the token list, current token, parser errors, brace level, program level, program level counter, in print, in bool, and finished.
var aTokens = [];
var aTokenNumber = 0;
var aCurrentToken;
var aErrors = 0;
var scope = -1;
var scopeLevel = -1;

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
    scope = -1;
    scopeLevel = -1;

    ast = new Tree();
    ast.addNode("Root", "branch");
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
 
//runs the analyzer
function analyzer(input) {
    //resets the globals
    aResetGlobals();
    //if verbose
    if (verbose) {
        //Outputs starting
        parserLog("Semantic Analysis is starting..\n");
    }
    //sets the token list
    aTokens = input;
    //calls the first token check
    aProgram();

    //Defines the completion text
    var completedText = "\nThe semantic analysis successfully passed";
    
    //if any errors
    if (pErrors) {
		//Sets failed for the completed semantic analysis output
		completedText = "\nThe semantic analysis FAILED with errors ("+aErrors+")";
	} else {
        $('#ast').val($('#ast').val()+ast.toString());
    }
	//Outputs the completed Text
	$('#Lexer_log').text($('#Lexer_log').val()+completedText);
    
    //returns error number
    return ast;
}

function addBranch(name) {
    //Creates a Branch
    ast.addNode(name, "branch", aCurrentToken.line, scope, name);
}

//Sets the parsers log
function analysisLog(text) {
    //Appends new logging to current log
    var lText = $('#Lexer_log').val()+"ANALYZER -- "+text+"\n";
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
        //nothing
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
    //moves token pointer
    aGetToken();

    //Creates a Branch
    addBranch("StatementList");

    //debugging
    if (debug && verbose) {
        analysisLog("Statement List..");
    }
    //if a Right Brace
    if (aCurrentToken.type == "RIGHT_BRACE") {
    //if any other statement keyword
    } else if (aCurrentToken.type == "PRINT" || aCurrentToken.type == "ID" 
    || aCurrentToken.type == "INT" || aCurrentToken.type == "STRING"
    || aCurrentToken.type == "BOOLEAN" || aCurrentToken.type == "WHILE" 
    || aCurrentToken.type == "IF" || aCurrentToken.type == "LEFT_BRACE") {
        //goes to statement
        aStatement();
        //changes the token
        aGetToken();
        //calls self
        aStatementList();
    }
    //backs out a branch
    ast.kick();
}

//checks for statements
function aStatement() {
    //Creates a Branch
    addBranch("Statement");
    
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
    //backs out a branch
    ast.kick();
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
function assignmentStatement() {
    //Creates a Branch
    addBranch("AssignmentStatement");
    //debugging
    if (debug && verbose) {
        analysisLog("assignmentStatement..");
    }
    //goes to ID
    aID();
    //changes the token
    aGetToken();

    //if ASSIGNMENT_OPERATOR
    if (aCurrentToken.type == "ASSIGNMENT_OPERATOR") {
        //changes the token
        aGetToken();
        //goes to expr
        aExpr();
    }

    //backs out a branch
    ast.kick();
}

//handles expressions
function aExpr() {
    //Creates a Branch
    addBranch("Expr");

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
        //go to ID
        aID();
    }

    //backs out a branch
    ast.kick();
}

//handles int expressions
function aIntExpr() {
    //Creates a Branch
    addBranch("IntExpr");

    //debugging
    if (debug && verbose) {
        analysisLog("intExpr..");
    }
    //Changes the token
    aGetToken();

    //if PLUS
    if (aCurrentToken.type == "PLUS") {
        //changes the token
        aGetToken();
        //goes to expr
        aExpr();
    }
    //backs out a branch
    ast.kick();
}
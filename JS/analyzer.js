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
    if (aTokens.length > 0 && (debug && verbose)) {
        console.log("Current Token ("+aTokens.length+" left)");
        console.log("Type: " + aCurrentToken.type);
        console.log("Value: " + aCurrentToken.value);
        console.log("Line: " + aCurrentToken.line);
        console.log("Column: " + aCurrentToken.column);
    }
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
        analysisLog("Semantic Analysis is starting..\n");
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
        $('#scopetree').val(st.toString());
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
        //goes to ID
        aID();
    }


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

//handles variable declarations
function aVarDecl() {
    //Creates a Branch
    addBranch("VarDecl");
    //debugging
    if (debug && verbose) {
        analysisLog("varDecl..");
    }
    //changes the token
    aGetToken();
    //if ID
    if (aCurrentToken.type == "ID") {
		//Creates new symbol
		var symbol = new Symbol(aCheckNext.type, aCurrentToken.type, aCurrentToken.line, scope, scopeLevel, false, false, "");
		
		//Adds the symbol to Current Branch
		st.cur.symbols.push(symbol);
		
		//Adds the symbol to allSymbols
		allSymbols.push(symbol);
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
    //Changes the token
    aGetToken();

    //if PLUS
    if (aCurrentToken.type == "PLUS") {
        //changes the token
        aGetToken();
        //goes to expr
        aExpr();

        //backs out a branch
        ast.kick();
    }
}

//handles string expressions
function aStringExpr() {

    //debugging
    if (debug && verbose) {
        analysisLog("stringExpr..");
    }

    //changes the token
    aGetToken();

    //goes to char list
    aCharList();

    //cheks for second quote
    if (aCurrentToken.type == "QUOTE") {
        //changes the token
        aGetToken();
}

//handles boolean expression
function aBooleanExpr() {
    //debugging
    if (debug && verbose) {
        analysisLog("booleanExpr..");
    }
    //if LEFT_PARENTHESES
    if (aCurrentToken.type == "LEFT_PARENTHESES") {
        //changes the token
        aGetToken();
        //goes to expression
        aExpr();
        //changes the token
        aGetToken();
        //if DOUBLE_EQUALS or NOT_EQUALS
        if (aCurrentToken.type == "DOUBLE_EQUALS" || aCurrentToken.type == "NOT_EQUALS") {
            //changes the token
            aGetToken();
            //goes to expression
            aExpr();
        }
    }
}
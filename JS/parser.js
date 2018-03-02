// JavaScript Document

//defines the token list, current token, parser errors, brace level, program level, program level counter, in print, in bool, and finished.
var tokens = [];
var currentToken;
var pErrors = 0;
var braceLevel = 0;
var programLevel = 1;
var programLevelCounter = 0;
var inPrint = false;
var inBool = false;
var finished = false;

//sets the CST and root node
var cst = new Tree();
cst.addNode("Root", "branch");

//resets the globals and cst
function resetGlobals() {
    tokens = [];
    currentToken;
    pErrors = 0;
    braceLevel = 0;
    programLevel = 1;
    programLevelCounter = 0;
    inPrint = false;
    inBool = false;
    finished = false;

    cst = new Tree();
    cst.addNode("Root", "branch");
}

function getToken() {
    //sets current token
    currentToken = tokens[0];
    //removes the token from the list
    tokens.shift();
    //returns the current token
    //return currentToken;
}

function checkNext() {
    //Gets next
    return tokens[0];
}

//runs the parser
function parser(input) {
    //resets the globals
    resetGlobals();
    //if verbose
    if (verbose) {
        //Outputs starting
        parserLog("Parser is starting..\n");
    }
    //sets the token list
    tokens = input;
    //calls the first token check
    program();

    //Defines the completion text
    var completedText = "\nThe parser successfully passed";
    
    //if any errors
    if (pErrors) {
		//Sets failed for the completed parser output
		completedText = "\nThe parser FAILED with errors ("+pErrors+")";
		//Makes the visual parser red
		$('#parser').addClass("btn-danger").removeClass("btn-secondary").removeClass("btn-btn-success");
	} else {
		//Makes the visual parser green
        $('#parser').addClass("btn-success").removeClass("btn-secondary").removeClass("btn-danger");
        $('#cst').val(cst.toString());
    }
	//Outputs the completed Text
	$('#Lexer_log').text($('#Lexer_log').val()+completedText);
    
    //returns error number
    return pErrors;
}

//handles the left brace
function leftBrace() {
    //Outputs the token found
    handle();
    //increases the braceLevel
    braceLevel++;
    //backs out
    return;
}

//handles the right brace
function rightBrace() {
    //Outputs the token found
    handle();
    //decreases the braceLevel
    braceLevel--;
    //backs out
    return;
}

//handles the IDs
function iD() {
    //Outputs the token found
    handle();
    //backs out
    return;
}

//handles the right brace
function eOP() {
    //Outputs the token found
    handle();
    //increases the programLevel
    programLevel++;
    //backs out
    return;
}

function statementList() {
    //starts cst branch
    cst.addNode("StatementList", "branch");
    //debugging
    if (debug && verbose) {
        parserLog("Statement List..");
    }
    //if a Right Brace
    if (currentToken.type == "RIGHT_BRACE") {
        //cst backs out a branch
        cst.kick();
        //go to block
        block();
    //if any other statement keyword
    } else if (currentToken.type == "PRINT" || currentToken.type == "ID" 
    || currentToken.type == "INT" || currentToken.type == "STRING"
    || currentToken.type == "BOOLEAN" || currentToken.type == "WHILE" 
    || currentToken.type == "IF" || currentToken.type == "LEFT_BRACE") {
        //goes to statement
        statement();
        //cst backs out a branch
        cst.kick();
        //if the current token is EOP then  loop here
        while (currentToken.type != "EOP") {
            //changes the token
            getToken();
            //calls self
            statementList();
        }
    } else {
        //increases errors
        pErrors++;
        //Outputs failed
        handle("PRINT, ID, INT, STRING, BOOLEAN, WHILE, STRING, IF, LEFT_BRACE, RIGHT_BRACE");
    }
    //cst backs out a branch
    cst.kick();
    //backs out
    return;
}

//checks for blocks
function block() {
    //debugging
    if (debug && verbose) {
        parserLog("Block..");
    }
    //if current token is a lerft brace
    if (currentToken.type == "LEFT_BRACE") {
        //starts cst branch
        cst.addNode("Block", "branch");
        //goes to left brace
        leftBrace();
        //changes the token
        getToken();
        //Goes to statementList
        statementList();
    //if current token is a Right brace
    } else if (currentToken.type == "RIGHT_BRACE" ) {
        //goes to right brace
        rightBrace();
        //changes the token
        getToken();
        //cst backs out a branch
        cst.kick();
        if (currentToken.type == "EOP" && (braceLevel == 0)) {
            //go to eOP
            eOP();
            //cst backs out a branch
            cst.kick();
            //go to program
            program();
        } else {
            //cst backs out a branch
            cst.kick();
            //goes to statement
            statementList();
        }
        //backs out
        return;
    } else {
        //increases errors
        pErrors++;
        //Outputs failed
        handle("LEFT_BRACE, RIGHT_BRACE");
    }
    //backs out
    return;
}

//checks for programs
function program() {
    //breaks out of the parsers loop
    if (tokens.length == 0) {
        //debugging
        if (debug && verbose) {
            parserLog("Program KILLED..");
        }
        //backs out of the program
        return;
    }
    //Changes token
    getToken();
    //debugging
    if (debug && verbose) {
        parserLog("Program..");
    }
    if (programLevel != programLevelCounter) {
        if (programLevel >= 2) {
            lText = $('#Lexer_log').val()+"\n";
            $('#Lexer_log').text(lText);
        }
        //Outputs program number
        parserLog("Parsing Program #"+programLevel);
        //increases the counter
        programLevelCounter++;
    }
    
    //if current token is a lerft brace
    if (currentToken.type == "LEFT_BRACE") {
        //starts cst branch
        cst.addNode("Program "+programLevel, "branch");
        //Goes to the block
        block();
    }
    //cst backs out a branch
    cst.kick();
    //backs out
    return;
}

//checks for statements
function statement() {
    //starts cst branch
    cst.addNode("Statement", "branch");
    //debugging
    if (debug && verbose) {
        parserLog("Statement..");
    }
    //if print
    if (currentToken.type == "PRINT") {
        //goes to print statements
        printStatement();
    //if ID
    } else if (currentToken.type == "ID") {
        //goes to assignment statements
        assignmentStatement();
    //if INT, STRING, or BOOLEAN
    } else if (currentToken.type == "INT" || currentToken.type == "STRING" || currentToken.type == "BOOLEAN") {
        //goes to variable declarations
        varDecl();
    //if WHILE
    } else if (currentToken.type == "WHILE") {
        //goes to while statements
        whileStatement();
    //if IF
    } else if (currentToken.type == "IF") {
        //goes to if statements
        ifStatement();
    //if LEFT_BRACE or RIGHT_BRACE
    } else if (currentToken.type == "LEFT_BRACE" || currentToken.type == "RIGHT_BRACE") {
        //cst backs out a branch
        cst.kick();
        //goes to block
        block();
    } else {
        //increases errors
        pErrors++;
        //Outputs failed
        handle("PRINT, ID, INT, STRING, BOOLEAN, WHILE, STRING, IF, LEFT_BRACE, RIGHT_BRACE");
    }
    //cst backs out a branch
    cst.kick();
    //cst backs out a branch
    cst.kick();
    //backs out
    return;
}

//handles the print statement
function printStatement() {
    //starts cst branch
    cst.addNode("Print", "branch");
    //debugging
    if (debug && verbose) {
        parserLog("Print..");
    }
    //handels the print
    handle();
    //Changes the token
    getToken();
    //changes to in print
    inPrint = true;
    //if LEFT_PARENTHESES
    if (currentToken.type == "LEFT_PARENTHESES") {
        //goes to left parentheses for print
        leftParentheses();
    } else {
        //increases errors
        pErrors++;
        //Outputs failed
        handle("LEFT_PARENTHESES");
    }
    //cst backs out a branch
    cst.kick();
    //backs out
    return;
}

//handles the print left parentheses statement
function leftParentheses() {
    //debugging
    if (debug && verbose) {
        parserLog("Parentheses..");
    }
    //handels the print
    handle();
    //if in bool
    if (inBool) {
        //debugging
        if (debug && verbose) {
            parserLog("Parentheses (Bool)..");
        }
        //changes the token
        getToken();
        //goes to expression
        expr();

        //changes the token
        getToken();
        //if DOUBLE_EQUALS or NOT_EQUALS
        if (currentToken.type == "DOUBLE_EQUALS" || currentToken.type == "NOT_EQUALS") {
            //handles the current token either one
            handle();
            //changes the token
            getToken();
            //goes to expression
            expr();
        } else {
            //increases errors
            pErrors++;
            //Outputs failed
            handle("DOUBLE_EQUALS, NOT_EQUALS");
        }
    //if in print
    } else if (inPrint) {
        //debugging
        if (debug && verbose) {
            parserLog("Parentheses (Print)..");
        }
        //changes the token
        getToken();
        //goes to expresion
        expr();
    }
    //if any errors back out
    if (pErrors) {//debugging
        if (debug && verbose) {
            parserLog("Parentheses KILLED..");
        }
        //backs out
        return;
    }
    
    //debugging
    if (debug && verbose) {
        parserLog("Parentheses end..");
    }

    //changes the token
    getToken();
    //cheks for right parentheses
    if (currentToken.type == "RIGHT_PARENTHESES") {
        //handles right parentheses
        handle();
        //if in bool
        if (inBool) {
            //leave bool
            inBool = false;
        } else if (inPrint) {
            //leave print
            inPrint = false;
        }
        //backs out
        return;
   } else {
        //increases errors
        pErrors++;
        //Outputs failed
        handle("RIGHT_PARENTHESES");
    }

    //backs out
    return;
}

//handles expressions
function expr() {
    //starts cst branch
    cst.addNode("Expr", "branch");
    //debugging
    if (debug && verbose) {
        parserLog("Expr..");
    }
    //if Digit
    if (currentToken.type == "DIGIT") {
        //go to int expression
        intExpr();
    //if Quote
    } else if (currentToken.type == "QUOTE") {
        //go to string expression
        stringExpr();
    //if left parentheses
    } else if (currentToken.type == "LEFT_PARENTHESES" || currentToken.type == "TRUE" || currentToken.type == "FALSE") {
        //go to boolean expression
        booleanExpr();
    //if left parentheses
    } else if (currentToken.type == "ID") {
        //go to ID
        iD();
    } else {
        //increases errors
        pErrors++;
        //Outputs failed
        handle("DIGIT, QUOTE, LEFT_PARENTHESES, TRUE, FALSE, ID");
    }

    //cst backs out a branch
    cst.kick();
    //backs out
    return;
}

//handles int expressions
function intExpr() {
    //starts cst branch
    cst.addNode("Expr", "branch");
    //debugging
    if (debug && verbose) {
        parserLog("intExpr..");
    }
    //handles the digit
    handle();
    //if PLUS
    if (checkNext().type == "PLUS") {
        //changes the token
        getToken();
        //handles the Plus
        handle();
        //changes the token
        getToken();
        //goes to expr
        expr();
        //cst backs out a branch
        cst.kick();
        //backs out
        return;
    } else {
        //cst backs out a branch
        cst.kick();
        //backs out
        return;
    }
}

//handles string expressions
function stringExpr() {
    //starts cst branch
    cst.addNode("StringExpr", "branch");
    //debugging
    if (debug && verbose) {
        parserLog("stringExpr..");
    }
    //handles the quote
    handle();

    //changes the token
    getToken();

    //starts cst branch
    cst.addNode("CharList", "branch");
    //goes to char list
    charList();

    //cheks for second quote
    if (currentToken.type == "QUOTE") {
        //cst backs out a branch
        cst.kick();
        //handles the second quote
        handle();
    } else {
        //increases errors
        pErrors++;
        //Outputs failed
        handle("QUOTE");
    }
    //cst backs out a branch
    cst.kick();
    //backs out
    return;
}

//handles char list
function charList() {
    //debugging
    if (debug && verbose) {
        parserLog("charList..");
    }
    //if CHAR
    if (currentToken.type == "CHAR") {
        //handles the char
        handle();
        //changes the token
        getToken();
        //Calls self
        charList();
    //if QUOTE
    } else if (currentToken.type == "QUOTE") {
        //backs out
        return;
    } else {
        //increases errors
        pErrors++;
        //Outputs failed
        handle("CHAR, QUOTE");
    }
    //backs out
    return;
}

//handles boolean expression
function booleanExpr() {
    //starts cst branch
    cst.addNode("BooleanExpr", "branch");
    //debugging
    if (debug && verbose) {
        parserLog("booleanExpr..");
    }
    //if LEFT_PARENTHESES
    if (currentToken.type == "LEFT_PARENTHESES") {
        //enters bool
        inBool = true;
        //go to left parentheses
        leftParentheses();
    } else {
        //handles the boolean val
        handle();
    }
    //cst backs out a branch
    cst.kick();
    //backs out
    return;
}

//handles assignment statements
function assignmentStatement() {
    //starts cst branch
    cst.addNode("AssignmentStatement", "branch");
    //debugging
    if (debug && verbose) {
        parserLog("assignmentStatement..");
    }
    //if ID
    if (currentToken.type == "ID") {
        //handles the ID
        handle();
        //changes the token
        getToken();
        //if ASSIGNMENT_OPERATOR
        if (currentToken.type == "ASSIGNMENT_OPERATOR") {
            //handles the ASSIGNMENT_OPERATOR
            handle();
            //changes the token
            getToken();
            //goes to expr
            expr();
        } else {
            //increases errors
            pErrors++;
            //Outputs failed
            handle("ASSIGNMENT_OPERATOR");
        }
    } else {
        //increases errors
        pErrors++;
        //Outputs failed
        handle("ID");
    }
    //cst backs out a branch
    cst.kick();
    //backs out
    return;
}

//handles variable declarations
function varDecl() {
    //starts cst branch
    cst.addNode("VariableDeclaration", "branch");
    //debugging
    if (debug && verbose) {
        parserLog("varDecl..");
    }
    //handles type
    handle();
    //changes the token
    getToken();
    //if ID
    if (currentToken.type == "ID") {
        //handles the ID
        handle();
    } else {
        //increases errors
        pErrors++;
        //Outputs failed
        handle("ID");
    }
    //cst backs out a branch
    cst.kick();
    //backs out
    return;
}

function whileStatement() {
    //starts cst branch
    cst.addNode("WhileStatement", "branch");
    //debugging
    if (debug && verbose) {
        parserLog("whileStatement..");
    }
    //handles while
    handle();
    //changes the token
    getToken();
    //if LEFT_PARENTHESES, TRUE, or FALSE
    if (currentToken.type == "LEFT_PARENTHESES" || currentToken.type == "TRUE" || currentToken.type == "FALSE") {
        //go to boolean expression
        booleanExpr();
        //changes the token
        getToken();
        //goes to block
        block();
    } else {
        //increases errors
        pErrors++;
        //Outputs failed
        handle("LEFT_PARENTHESES, TRUE, FALSE");
    }
    //cst backs out a branch
    cst.kick();
    //backs out
    return;
}

function ifStatement() {
    //starts cst branch
    cst.addNode("IfStatement", "branch");
    //debugging
    if (debug && verbose) {
        parserLog("ifStatement..");
    }
    //handles if
    handle();
    //changes the token
    getToken();
    //if LEFT_PARENTHESES, TRUE, or FALSE
    if (currentToken.type == "LEFT_PARENTHESES" || currentToken.type == "TRUE" || currentToken.type == "FALSE") {
        //go to boolean expression
        booleanExpr();
        //changes the token
        getToken();
        //goes to block
        block();
    } else {
        //increases errors
        pErrors++;
        //Outputs failed
        handle("LEFT_PARENTHESES, TRUE, FALSE");
    }
    //cst backs out a branch
    cst.kick();
    //backs out
    return;
}

//handles the parsering and CST
function handle(unexpected = '') {
    //sets the type of the token
    var type = currentToken.type;
    //sets the value of the token
    var value = currentToken.value;
    //sets the line of the token
	var line = currentToken.line;
    //sets the col of the token
    var column = currentToken.column;

    //Defines text
    var text;

    //Figures out if it is a successful or unexpected token output
    if (!unexpected) {
        text = "Passed! Expected token found [ "+type+" ] with a value of [ "+value+" ] on line "+line+", "+column+"..."; 
        cst.addNode(currentToken.value, "leaf", currentToken.line);
        
        //if verbose mode
	    if (!verbose) {
            //stops from ouputing
            text = "DO NOT OUTPUT";
        }
    } else {
        text = "Failed! Unexpected token found [ "+type+" ] on line "+line+", "+column;
        //processes the the first text
        parserLog(text);
        text =  "------  Expected token(s) [ "+unexpected+" ] on line "+line+", "+column+"...";
    }
    //processes the text
    parserLog(text);
}

//Sets the parsers log
function parserLog(text) {
    //Appends new logging to current log
    var lText = $('#Lexer_log').val()+"PARSER -- "+text+"\n";
    //if not supposed to be output
    if (text == "DO NOT OUTPUT") {
        //No need to change
        lText = $('#Lexer_log').val();
    }
    //Sets the Log
    $('#Lexer_log').text(lText);
}
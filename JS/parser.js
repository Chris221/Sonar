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
    //sets the token list
    tokens = input;
    //calls the first token check
    program();

    //Defines the completion text
    var completedText = "<br /><span class=\"parser-title\">Parser</span> <span class=\"passed\">passed</span> with 0 <span class=\"warning\">warnings</span> and " + pErrors + " <span class=\"error\">errors</span>";

    //if any errors
    if (pErrors) {
        //Sets failed for the completed parser output
        completedText = "<br /><span class=\"parser-title\">Parser</span> <span class=\"failed\">FAILED</span> with 0 <span class=\"warning\">warnings</span> and " + pErrors + " <span class=\"error\">errors</span>";;
        //Makes the visual parser red
        //$('#parser').addClass("btn-danger").removeClass("btn-secondary").removeClass("btn-btn-success");
    } else {
        //Makes the visual parser green
        //$('#parser').addClass("btn-success").removeClass("btn-secondary").removeClass("btn-danger");
        $('#cst').val($('#cst').val() + cst.toString());
    }
    //Outputs the completed Text
    logText += "<div class=\"parser completed-text\" id=\"parser-completed-text\" >" + completedText + "</div>";

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
    //starts cst branch
    cst.addNode("ID", "branch");
    //Outputs the token found
    handle();
    //cst backs out a branch
    cst.kick();
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
    parserLog("Statement List..");
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
    parserLog("Block..");
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
    } else if (currentToken.type == "RIGHT_BRACE") {
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
        parserLog("Program KILLED..");
        //backs out of the program
        return;
    }
    //Changes token
    getToken();
    //debugging
    parserLog("Program..");
    if (programLevel != programLevelCounter) {
        //Outputs program number
        parserLog("<span id=\"parser-start-text\">Parsing Program <span class=\"line\">" + programNumber + "</span>...</span>",true);
        //increases the counter
        programLevelCounter++;
    }

    //if current token is a lerft brace
    if (currentToken.type == "LEFT_BRACE") {
        //starts cst branch
        cst.addNode("Program " + programNumber, "branch");
        //Goes to the block
        block();
    } else {
        //increases errors
        pErrors++;
        //Outputs failed
        handle("LEFT_BRACE");
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
    parserLog("Statement..");
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
    } else if ((currentToken.type == "LEFT_BRACE" && braceLevel != 0) || currentToken.type == "RIGHT_BRACE") {
        //cst backs out a branch
        cst.kick();
        //goes to block
        block();
    } else if (currentToken.type == "LEFT_BRACE" && braceLevel == 0) {
        //increases errors
        pErrors++;
        //Outputs failed
        handle("EOP");
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
    parserLog("Print..");
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
    parserLog("Parentheses..");
    //handels the print
    handle();
    //if in bool
    if (inBool) {
        //debugging
        parserLog("Parentheses (Bool)..");
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
        parserLog("Parentheses (Print)..");
        //changes the token
        getToken();
        //goes to expresion
        expr();
    }
    //if any errors back out
    if (pErrors) {
        //debugging
        parserLog("Parentheses KILLED..");
        //backs out
        return;
    }

    //debugging
    parserLog("Parentheses end..");

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
    parserLog("Expr..");
    //if Digit
    if (currentToken.type == "DIGIT") {
        //go to int expression
        intExpr();
        //if Quote
    } else if (currentToken.type == "QUOTE") {
        //go to string expression
        stringExpr();
        //if left parentheses
    } else if (currentToken.type == "LEFT_PARENTHESES" || currentToken.type == "BOOL") {
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
    cst.addNode("IntExpr", "branch");
    //debugging
    parserLog("intExpr..");
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
    parserLog("stringExpr..");
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
    parserLog("charList..");
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
    parserLog("booleanExpr..");
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
    parserLog("assignmentStatement..");
    //if ID
    if (currentToken.type == "ID") {
        //goes to  ID
        iD();
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
    parserLog("varDecl..");
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
    parserLog("whileStatement..");
    //handles while
    handle();
    //changes the token
    getToken();
    //if LEFT_PARENTHESES, TRUE, or FALSE
    if (currentToken.type == "LEFT_PARENTHESES" || currentToken.type == "BOOL") {
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
    parserLog("ifStatement..");
    //handles if
    handle();
    //changes the token
    getToken();
    //if LEFT_PARENTHESES, TRUE, or FALSE
    if (currentToken.type == "LEFT_PARENTHESES" || currentToken.type == "BOOL") {
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
        text = "<span class=\"passed\">Passed!</span> Expected token found [ <span class=\"code-words\">" + type + "</span> ] with a value of [ <span class=\"code-words\">" + value + "</span> ] on line <span class=\"line\">" + line + "</span>, <span class=\"line\">" + column + "</span>...";
        cst.addNode(currentToken.value, "leaf", currentToken.line);

        //if verbose mode
        if (!verbose) {
            //stops from ouputing
            text = "DO NOT OUTPUT";
        }
        //processes the text
        parserLog(text);
    } else {
        text = "<span class=\"failed\">Failed!</span> Unexpected token found [ <span class=\"error\">" + type + "</span> ] on line <span class=\"line\">" + line + "</span>, <span class=\"line\">" + column + "</span>...";
        //processes the the first text
        parserLog(text,true);
        text = "------  Expected token(s) [ <span class=\"code-words\">" + unexpected + "</span> ] on line <span class=\"line\">" + line + "</span>, <span class=\"line\">" + column + "</span>...";
        //processes the text
        parserLog(text,true);
    }
}

//Sets the parsers log
function parserLog(text, override = false) {
    //Appends new logging to current log
    var lText = "<div class=\"parser\"><span class=\"parser-title\">PARSER</span> -- " + text + "</div>";
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
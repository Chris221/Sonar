// JavaScript Document

//defines the token list, current token, brace level and parser errors.
var tokens = [];
var currentToken, pErrors;
var braceLevel = 0;

//sets the debug for parser
var pDebug = true;

function getToken() {
    //sets current token
    currentToken = tokens[0];
    //removes the token from the list
    tokens.shift();
    //returns the current token
    //return currentToken;
}

//runs the parser
function parser(input) {
    //Outputs starting
    parserLog("\n\nParser is starting..\n\n");
    //sets the token list
    tokens = input;
    //calls the first token check
    program();
}

//handles the left brace
function leftBrace() {
    //Outputs the token found
    handle(currentToken);
    //increases the braceLevel
    braceLevel++;
    return;
}

//handles the right brace
function rightBrace() {
    //Outputs the token found
    handle(currentToken);
    //decreases the braceLevel
    braceLevel--;
    return;
}

function statementList() {
    getToken;
    if (currentToken == "PRINT" || currentToken == "ID" 
    || currentToken == "INT" || currentToken == "STRING"
    || currentToken == "BOOLEAN" || currentToken == "WHILE" 
    || currentToken == "IF" || currentToken == "LEFT_BRACE"
    || currentToken == "RIGHT_BRACE") {
    if (pDebug) {
        parserLog("Statement List..");
    }
        statement();
    } else {
        //increases errors
        pErrors++;
        //Outputs failed
        text = "Failed! Unexpected token found [ "+type+" ] on line "+line+", "+column+"...";  
        parserLog(text);
    }
}

//checks for blocks
function block() {
    if (currentToken == "LEFT_BRACE") {
    if (pDebug) {
        parserLog("Block..");
    }
        leftBrace();
        statementList();
    } else if (currentToken == "RIGHT_BRACE" ) {
        rightBrace();
        program();
    } else {
        //increases errors
        pErrors++;
        //Outputs failed
        text = "Failed! Unexpected token found [ "+type+" ] on line "+line+", "+column+"...";  
        parserLog(text);
    }
}

//checks for programs
function program() {
    getToken;
    if (currentToken == "LEFT_BRACE") {
    if (pDebug) {
        parserLog("Program..");
    }
        block();
    } else if ((braceLevel == 0) || (currentToken != "EOP")) {
        //increases errors
        pErrors++;
        //Outputs failed
        handle(currentToken, "LEFT_BRACE");
    }

    if (currentToken == "EOP") {
        eOP();
        program();
    }  
}

//checks for statements
function statement() {
    if (currentToken == "PRINT") {
    if (pDebug) {
        parserLog("Statement..");
    }
        printStatement();
    } else if (currentToken == "ID") {
        assignmentStatement();
    } else if (currentToken == "INT" || currentToken == "STRING" || currentToken == "BOOLEAN") {
        varDecl();
    } else if (currentToken == "WHILE") {
        whileStatement();
    } else if (currentToken == "IF") {
        ifStatement();
    } else if (currentToken == "LEFT_BRACE" || currentToken == "RIGHT_BRACE") {
        block();
    } else {
        //increases errors
        pErrors++;
        //Outputs failed
        text = "Failed! Unexpected token found [ "+type+" ] on line "+line+", "+column+"...";  
        parserLog(text);
    }
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

    if (!unexpected) {
        text = "Passed! Expected token found [ "+type+" ] with a value of [ "+value+" ] on line "+line+", "+column+"..."; 
    } else {
        text = "Failed! Unexpected token found [ "+type+" ]!\n Expected token [ "+unexpected+" ] on line "+line+", "+column+"...";  
    }
    parserLog(text);
}

//Sets the parsers log
function parserLog(text) {
    //Appends new logging to current log
    var lText = $('#Lexer_log').val()+"PARSER -- "+text+"\n";
    //Sets the Log
    $('#Lexer_log').text(lText);
}

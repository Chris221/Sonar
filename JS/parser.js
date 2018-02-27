// JavaScript Document

//defines the token list, current token, brace level and parser errors.
var tokens = [];
var currentToken, pErrors;
var braceLevel = 0;

function getToken() {
    //sets current token
    currentToken = tokens[0];
    //removes the token from the list
    tokens.shift();
    //returns the current token
    return currentToken;
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
function block() {
    if (currentToken == "LEFT_BRACE") {
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

//handles the parsering and CST
function handle(token, unexpected = '') {
    //sets the type of the token
    var type = token.type;
    //sets the value of the token
    var value = token.value;
    //sets the line of the token
	var line = token.line;
    //sets the col of the token
    var column = token.column;

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

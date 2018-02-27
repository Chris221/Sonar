// JavaScript Document

//defines the token list, current token and brace level
var tokens = [];
var currentToken, braceLevel;

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
    //gets the first token
    var token = getToken();
    if (token.type == "LEFT_BRACE") {
        //Call leftBrace to check the next token
        leftBrace();
    } else {
        //Outputs unexpected token
        handle(currentToken,"LEFT_BRACE");
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
    var column = token.col;

    //Defines text
    var text;

    if (!unexpected) {
        text = "Passed! Expected token found [ "+type+" ] with a value of [ "+value+" ] on line "+line+", "+column+"..."; 
    } else {
        text = "Failed! Unexpected token found [ "+type+" ]!\n Expected token [ "+unexpected+" ] on line "+line+", "+column+"...";  
    }
    parserLog(text);
}

function parserLog(text) {
    //Appends new logging to current log
    var lText = $('#Lexer_log').val()+"PARSER -- "+text+"\n";
    //Sets the Log
    $('#Lexer_log').text(lText);
}

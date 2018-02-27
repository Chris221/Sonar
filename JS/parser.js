// JavaScript Document

//defines the token list, current token and bracket level
var tokens = [];
var currentToken, bracketLevel;

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
function parserLog(text) {
    //Appends new logging to current log
    var lText = $('#Lexer_log').val()+"LEXER -- "+text+"\n";
    //Sets the Log
    $('#Lexer_log').text(lText);
}

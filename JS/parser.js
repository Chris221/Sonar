// JavaScript Document

var tokens = [];
//runs the parser
function parser(input) {
    //sets the token list
    tokens = input;
function parserLog(text) {
    //Appends new logging to current log
    var lText = $('#Lexer_log').val()+"LEXER -- "+text+"\n";
    //Sets the Log
    $('#Lexer_log').text(lText);
}

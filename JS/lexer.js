// JavaScript Document

//The lexer is scary and confusing :'(

function lexer(input) {
	//Intializes warning and errors
	var warnings = 0;
	var errors = 0;
	
	//Clears the log
	$('#Lexer_log').text("");
	
	//defines the token list
	var tokens = [];
	
	//takes the input and splits on carrage returns
	var lines = input.split("\n");
	
	//TESTING LOG
	LexLog(input);
	
	//returns the tokens
	return tokens;
}

function LexLog(text) {
	//Appends new logging to current log
	var lText = $('#Lexer_log').val()+"LEXER: "+text+"\n";
	//Sets the Log
	$('#Lexer_log').text(lText);
}
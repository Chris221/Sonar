// JavaScript Document

//The lexer make much more sense now thanks to Dr. Dennis Mirante

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
	//defines the line variable for individual line checking
	var line;
	//Line by Line analysis
	for (var cLine = 0; cLine < lines.length; cLine++) {
		line = lines[cLine];
		
	}
	
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
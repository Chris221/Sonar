// JavaScript Document

//The lexer makes much more sense now thanks to Dr. Dennis Mirante

//defines the token list
var tokens = [];

function lexer(input) {
	//Intializes warning and errors
	var warnings = 0;
	var errors = 0;
	
	//Clears the log
	$('#Lexer_log').text("");
	
	//Resets the token list
	tokens = [];
	
	//Takes the input and splits on carrage returns
	var lines = input.split("\n");
	//Defines the line variable for individual line checking, along with character for column checking
	var line, character;
	//Line by line analysis
	for (var cLine = 0; cLine < lines.length; cLine++) {
		//Sets the line
		line = lines[cLine];
		
		//Column by column analysis
		for (var column = 0; column < line.length; column++) {
			//Sets current character;
			character = line[column];
		}
	}
	
	//Returns the tokens
	return tokens;
}

function LexLog(text) {
	//Appends new logging to current log
	var lText = $('#Lexer_log').val()+"LEXER: "+text+"\n";
	//Sets the Log
	$('#Lexer_log').text(lText);
}
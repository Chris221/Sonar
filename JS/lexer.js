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
			//LexLog("column location: "+(column+1));
			//Sets current character;
			character = line[column];
			
			//Checks if the variable is the id 'i'
			if (character == 'i') {
				//Checks if its intended to be 'if', 'int', or just 'i'
				if (line[column+1] == 'f') {
					//Adds the 'if' token
					addToken("IF","if",cLine+1,column+1);
					//Moves the pointer
					column++;
				} else if (line[column+1] == 'n' && line[column+2] == 't') {
					//Adds the 'int' token
					addToken("INT","int",cLine+1,column+1);
					//Moves the pointer
					column+=2;
				} else {
					//Adds the 'i' token
					addToken("ID","i",cLine+1,column+1);
				}
			}
			
			//Checks if the variable is the id 'p'
			if (character == 'p') {
				//Checks if its intended to be 'print' or just 'p'
				if (line[column+1] == 'r' && line[column+2] == 'i' && line[column+3] == 'n' && line[column+4] == 't') {
					//Adds the 'print' token
					addToken("PRINT","print",cLine+1,column+1);
					//Moves the pointer
					column+=4;
				} else {
					//Adds the 'p' token
					addToken("ID","p",cLine+1,column+1);
				}
			}
			
			//Checks if the variable is the id 'w'
			if (character == 'w') {
				//Checks if its intended to be 'while' or just 'w'
				if (line[column+1] == 'h' && line[column+2] == 'i' && line[column+3] == 'l' && line[column+4] == 'e') {
					//Adds the 'while' token
					addToken("WHILE","while",cLine+1,column+1);
					//Moves the pointer
					column+=4;
				} else {
					//Adds the 'w' token
					addToken("ID","w",cLine+1,column+1);
				}
			}
			
			//Checks if the variable is the id 's'
			if (character == 's') {
				//Checks if its intended to be 'string' or just 's'
				if (line[column+1] == 't' && line[column+2] == 'r' && line[column+3] == 'i' && line[column+4] == 'n' && line[column+5] == 'g') {
					//Adds the 'string' token
					addToken("STRING","string",cLine+1,column+1);
					//Moves the pointer
					column+=5;
				} else {
					//Adds the 's' token
					addToken("ID","s",cLine+1,column+1);
				}
			}
			
			//Checks if the variable is the id 'b'
			if (character == 'b') {
				//Checks if its intended to be 'boolean' or just 'b'
				if (line[column+1] == 'o' && line[column+2] == 'o' && line[column+3] == 'l' && line[column+4] == 'e' && line[column+5] == 'a' && line[column+6] == 'n') {
					//Adds the 'boolean' token
					addToken("BOOLEAN","boolean",cLine+1,column+1);
					//Moves the pointer
					column+=6;
				} else {
					//Adds the 'b' token
					addToken("ID","b",cLine+1,column+1);
				}
			}
			
			//Checks if the variable is the id 't'
			if (character == 't') {
				//Checks if its intended to be 'true' or just 't'
				if (line[column+1] == 'r' && line[column+2] == 'u' && line[column+3] == 'e') {
					//Adds the 'true' token
					addToken("TRUE","true",cLine+1,column+1);
					//Moves the pointer
					column+=3;
				} else {
					//Adds the 't' token
					addToken("ID","t",cLine+1,column+1);
				}
			}
			
			//Checks if the variable is the id 'f'
			if (character == 'f') {
				//Checks if its intended to be 'false' or just 'f'
				if (line[column+1] == 'a' && line[column+2] == 'l' && line[column+3] == 's' && line[column+4] == 'e') {
					//Adds the 'false' token
					addToken("FALSE","false",cLine+1,column+1);
					//Moves the pointer
					column+=4;
				} else {
					//Adds the 'f' token
					addToken("ID","f",cLine+1,column+1);
				}
			}
		}
	}
	
	//Returns the tokens
	return tokens;
}

function addToken(type,val,line,col) {
	//Sets temp token
	var temp = new Token(type,val,line,col);
	//Addes to the token list
	tokens.push(temp);
	//Outputs new token to log
	LexLog(type+" [ "+val+" ] found on line "+line+", "+col+"...");
}

function LexLog(text) {
	//Appends new logging to current log
	var lText = $('#Lexer_log').val()+"LEXER -- "+text+"\n";
	//Sets the Log
	$('#Lexer_log').text(lText);
}
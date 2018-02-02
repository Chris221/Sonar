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
	//Defines the line variable for individual line checking, along with character for column checking, isString and isComment for tracking if current in one
	var line, character, isString, isComment;
	//Defines the program counter
	var program = 1;
	//Defines counter to know if program number was outputed
	var programOutCounter = 0;
	//Line by line analysis
	for (var cLine = 0; cLine < lines.length; cLine++) {
		//Sets the line
		line = lines[cLine];
		
		//Checks to confirm a new program
		if (program != programOutCounter) {
			//If not on the very first program
			if (program > 1) {
				//Output a blank line for spacing and readablity
				$('#Lexer_log').text($('#Lexer_log').val()+"\n\n");
			}
			//Outputs program number
			LexLog("Lexing program "+program);
			//Updates outpur counter
			programOutCounter++;
		}
		
		//When in a string it adds the new line
		if (isString) {
			//Adds Character token of new line
			addToken("CHAR",'\\n',cLine,column+1);
		}
		//Column by column analysis
		for (var column = 0; column < line.length; column++) {
			if (debug) {
				LexLog("*DEBUGGER* column location: "+(column+1));
			}
			//Sets current character;
			character = line[column];
			
			//Checks if the variable is the id '/*'
			if (character == '/' && line[column+1] == '*' && !isString) {
				//moves the pointer
				column++;
				//Checks if current comment
				if (isComment){
					//If so end it
					isComment = false;
				} else {
					//If not start it
					isComment = true;
				}
				if (debug) {
					LexLog("*DEBUGGER* **Comment starting will be ignored**");
				}
				continue;
			}
			
			//Checks if the variable is the id '/*'
			if (character == '*' && line[column+1] == '/' && !isString) {
				//moves the pointer
				column++;
				//Checks if current comment
				if (isComment){
					//If so end it
					isComment = false;
				} else {
					//If not start it
					isComment = true;
				}
				LexLog("**Comment ending will be ignored**");
				continue;
			}
			
			//Checks if in string mode
			if (isComment) {
				//ignore everything
				continue;
			}
			
			//Checks if the variable is the id '"'
			if (character == '"') {
				//Adds the '"' token
				addToken("QUOTE",'"',cLine+1,column+1);
				//Checks if current string
				if (isString){
					//If so end it
					isString = false;
				} else {
					//If not start it
					isString = true;
				}
				continue;
			}
			
			//Checks if in string mode
			if (isString) {
				//Adds Character token
				addToken("CHAR",character,cLine+1,column+1);
				continue;
			}
			
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
			
			//Checks if the variable is the id '='
			if (character == '=') {
				//Checks if its intended to be '==' or just '='
				if (line[column+1] == '=') {
					//Adds the '==' token
					addToken("DOUBLE_EQUALS","==",cLine+1,column+1);
					//Moves the pointer
					column+=4;
				} else {
					//Adds the '=' token
					addToken("ASSIGNMENT_OPERATOR","=",cLine+1,column+1);
				}
			}
			
			//Checks if the variable is the id '!='
			if (character == '!' && line[column+1] == '=') {
				//Adds the '==' token
				addToken("NOT_EQUALS","!=",cLine+1,column+1);
				//Moves the pointer
				column+=1;
			}
			
			//Checks if the variable is the id '+'
			if (character == '+') {
				//Adds the '+' token
				addToken("PLUS","+",cLine+1,column+1);
			}
			
			//Checks if the variable is the id '{'
			if (character == '{') {
				//Adds the '{' token
				addToken("LEFT_BRACE","{",cLine+1,column+1);
			}
			
			//Checks if the variable is the id '}'
			if (character == '}') {
				//Adds the '}' token
				addToken("RIGHT_BRACE","}",cLine+1,column+1);
			}
			
			//Checks if the variable is the id '('
			if (character == '(') {
				//Adds the '(' token
				addToken("LEFT_PARENTHESES","(",cLine+1,column+1);
			}
			
			//Checks if the variable is the id ')'
			if (character == ')') {
				//Adds the ')' token
				addToken("RIGHT_PARENTHESES",")",cLine+1,column+1);
			}
			
			//Checks if the variable is the id '$'
			if (character == '$') {
				//Adds the '$' token
				addToken("EOP","$",cLine+1,column+1);
				program++;
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
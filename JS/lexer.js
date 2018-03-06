// JavaScript Document

//The lexer makes much more sense now thanks to Dr. Dennis Mirante

//defines the token list
var tokens = [];

function lexer(input) {
	//Intializes warnings and errors
	var warnings = 0;
	var errors = 0;
	
	//Resets the token list
	tokens = [];
	//if the input is empty
	if ($.trim(input) == '') {
		//Throws error for no input
		LexLog("ERROR! Nothing to lex, the input is empty...");
		//kills the lexer
		return false;
	}
	//Check that the EOP operator is there
	if (input.trim().slice(-1) != "$") {
		//Throws warning
		LexLog("Warning: End Of Program operator was not found ( $ ), adding one for you.\n\n");
		//Adds the EOP operator
		input += "$";
		//Increases warnings
		warnings++;
	}
	
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
		
		//When in a string
		if (isString) {
			//Throws error for unterminated strings
			LexLog("ERROR! Unterminated string on "+cLine+"...");
			//Adds to errors
			errors++;
			//Sets isString false
			isString = false;
		}
		//Column by column analysis
		for (var column = 0; column < line.length; column++) {
			//Checks to confirm a new program
			if (program != programOutCounter) {
				//Outputs program number
				LexLog("Lexing program "+programNumber);
				//Updates outpur counter
				programOutCounter++;
			}
			
			//Which column we're at wile debugging
			if (debug && verbose) {
				LexLog("*DEBUGGER* Line number "+(cLine+1)+", column location "+(column+1));
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
				//Lets us know the comment is starting if debugging
				if (debug && verbose) {
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
				//Lets us know the comment is ending if debugging
				if (debug && verbose) {
					LexLog("*DEBUGGER* **Comment ending will be ignored**");
				}
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
				if ("abcdefghijklmnopqrstuvwxyz ".indexOf(character) != -1) {
					//Adds Character token
					addToken("CHAR",character,cLine+1,column+1);
					continue;
				}
				//Enexpected char found
				LexLog("ERROR! Unexpected char [ "+character+" ] string on "+(cLine+1)+", "+(column+1)+"...");
				//Adds to errors
				errors++;
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
					continue;
				} else if (line[column+1] == 'n' && line[column+2] == 't') {
					//Adds the 'int' token
					addToken("INT","int",cLine+1,column+1);
					//Moves the pointer
					column+=2;
					continue;
				} else {
					//Adds the 'i' token
					addToken("ID","i",cLine+1,column+1);
					continue;
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
					continue;
				} else {
					//Adds the 'p' token
					addToken("ID","p",cLine+1,column+1);
					continue;
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
					continue;
				} else {
					//Adds the 'w' token
					addToken("ID","w",cLine+1,column+1);
					continue;
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
					continue;
				} else {
					//Adds the 's' token
					addToken("ID","s",cLine+1,column+1);
					continue;
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
					continue;
				} else {
					//Adds the 'b' token
					addToken("ID","b",cLine+1,column+1);
					continue;
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
					continue;
				} else {
					//Adds the 't' token
					addToken("ID","t",cLine+1,column+1);
					continue;
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
					continue;
				} else {
					//Adds the 'f' token
					addToken("ID","f",cLine+1,column+1);
					continue;
				}
			}
			
			//Checks if the variable is the '='
			if (character == '=') {
				//Checks if its intended to be '==' or just '='
				if (line[column+1] == '=') {
					//Adds the '==' token
					addToken("DOUBLE_EQUALS","==",cLine+1,column+1);
					//Moves the pointer
					column+=1;
					continue;
				} else {
					//Adds the '=' token
					addToken("ASSIGNMENT_OPERATOR","=",cLine+1,column+1);
					continue;
				}
			}
			
			//Checks if the variable is the '!='
			if (character == '!' && line[column+1] == '=') {
				//Adds the '==' token
				addToken("NOT_EQUALS","!=",cLine+1,column+1);
				//Moves the pointer
				column+=1;
				continue;
			}
			
			//Checks if the variable is the '+'
			if (character == '+') {
				//Adds the '+' token
				addToken("PLUS","+",cLine+1,column+1);
				continue;
			}
			
			//Checks if the variable is the '{'
			if (character == '{') {
				//Adds the '{' token
				addToken("LEFT_BRACE","{",cLine+1,column+1);
				continue;
			}
			
			//Checks if the variable is the '}'
			if (character == '}') {
				//Adds the '}' token
				addToken("RIGHT_BRACE","}",cLine+1,column+1);
				continue;
			}
			
			//Checks if the variable is the '('
			if (character == '(') {
				//Adds the '(' token
				addToken("LEFT_PARENTHESES","(",cLine+1,column+1);
				continue;
			}
			
			//Checks if the variable is the ')'
			if (character == ')') {
				//Adds the ')' token
				addToken("RIGHT_PARENTHESES",")",cLine+1,column+1);
				continue;
			}
			
			//Checks if the variable is the '$'
			if (character == '$') {
				//Adds the '$' token
				addToken("EOP","$",cLine+1,column+1);
				program++;
				continue;
			}
			
			//Checks if the variable is a digit
			if (character >= '0' && character <= '9') {
				//Adds the digit token
				addToken("DIGIT",character,cLine+1,column+1);
				continue;
			}
			
			//Checks if the variable is one of the remaining ids
			if ("acdeghjklmnoqruvxyz".indexOf(character) != -1) {
				//Adds the id token
				addToken("ID",character,cLine+1,column+1);
				continue;
			}
			
			//Checks for space or tab and ignores it
			if (character.indexOf(' ') >= 0 || character.indexOf('	') >= 0) {
				//If bebugging this will output when white space is found
				if (debug && verbose) {
					LexLog("*DEBUGGER* Found whitespace at: "+(cLine+1)+", "+(column+1));
				}
				continue;
			}
			
			//If no token was handed out there must not be one, ERROR
			LexLog("ERROR! Unrecognized, could not define token [ "+character+" ] found on line "+(cLine+1)+", "+(column+1)+"...");
			//Adds to errors
			errors++;
		}
	}
	
	//Checks one last time to make sure no Unterminated strings
	//would fail either way but now it tells you :)
	if (isString) {
		//Throws error for Unterminated strings
		LexLog("ERROR! Unterminated string on "+cLine+"...");
		//Adds to errors
		errors++;
	}
	
	//Defines part of the completion text
	var cText = "passed";
	//If any errors
	if (errors) {
		//Sets failed for the completed lexer output and tokens to false
		cText = "FAILED";
		tokens = false;
		//Makes the visual lexer red
		//$('#lexer').addClass("btn-danger").removeClass("btn-secondary").removeClass("btn-btn-success").removeClass("btn-warning");
	} else if (warnings) {
		//If there are warnings
		//Makes the visual lexer yellow
		//$('#lexer').addClass("btn-warning").removeClass("btn-secondary").removeClass("btn-btn-success").removeClass("btn-danger");
	} else {
		//Makes the visual lexer green
		//$('#lexer').addClass("btn-success").removeClass("btn-secondary").removeClass("btn-warning").removeClass("btn-danger");
	}
	//Defines the full output of the completed text
	var completedText = "\nLexer "+cText+" with "+warnings+" warnings and "+errors+" errors!";
	//Outputs the completed Text
	$('#Lexer_log').text($('#Lexer_log').val()+completedText);
	
	//Returns the tokens
	return tokens;
}

function addToken(type,val,line,col) {
	//Sets temp token
	var temp = new Token(type,val,line,col);
	//Addes to the token list
	tokens.push(temp);
	//sets the text
	var text = type+" [ "+val+" ] found on line "+line+", "+col+"...";
	//if verbose mode
	if (!verbose) {
		//stops from ouputing
		text = "DO NOT OUTPUT";
	}
	//Outputs new token to log
	LexLog(text);
}

function LexLog(text) {
	//Appends new logging to current log
	var lText = $('#Lexer_log').val()+"LEXER -- "+text+"\n";
    //if not supposed to be output
    if (text == "DO NOT OUTPUT") {
        //No need to change
        lText = $('#Lexer_log').val();
    }
	//Sets the Log
	$('#Lexer_log').text(lText);
}
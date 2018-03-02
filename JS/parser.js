// JavaScript Document

//defines the token list, current token, parser errors, brace level, program level, program level counter, and in print.
var tokens = [];
var currentToken;
var pErrors = 0;
var braceLevel = 0;
var programLevel = 1;
var programLevelCounter = 0;
var inPrint = false;

//sets the debug for parser
var pDebug = true;

//resets the globals and changes debug
function resetGlobals() {
    tokens = [];
    currentToken;
    pErrors = 0;
    braceLevel = 0;
    programLevel = 1;
    programLevelCounter = 0;
    inPrint = false;
    pDebug = true;
}

function getToken() {
    //sets current token
    currentToken = tokens[0];
    //removes the token from the list
    tokens.shift();
    //returns the current token
    //return currentToken;
}

//runs the parser
function parser(input) {
    //resets the globals
    resetGlobals();
    //Outputs starting
    parserLog("Parser is starting..\n\n");
    //sets the token list
    tokens = input;
    //calls the first token check
    program();

    //Defines the completion text
    var completedText = "\nThe parser successfully passed";
    
    //if any errors
    if (pErrors) {
		//Sets failed for the completed parser output
		completedText = "\nThe parser FAILED with an error";
		//Makes the visual parser red
		$('#parser').addClass("btn-danger").removeClass("btn-secondary").removeClass("btn-btn-success");
	} else {
		//Makes the visual parser green
		$('#parser').addClass("btn-success").removeClass("btn-secondary").removeClass("btn-danger");
    }
	//Outputs the completed Text
	$('#Lexer_log').text($('#Lexer_log').val()+completedText);
    
    //returns error number
    return pErrors;
}

//handles the left brace
function leftBrace() {
    //Outputs the token found
    handle();
    //increases the braceLevel
    braceLevel++;
    //backs out
    return;
}

//handles the right brace
function rightBrace() {
    //Outputs the token found
    handle();
    //decreases the braceLevel
    braceLevel--;
    //backs out
    return;
}

//handles the right brace
function eOP() {
    //Outputs the token found
    handle();
    //increases the programLevel
    programLevel++;
    //backs out
    return;
}

function statementList() {
    //debugging
    if (pDebug) {
        parserLog("Statement List..");
    }
    if (currentToken.type == "PRINT" || currentToken.type == "ID" 
    || currentToken.type == "INT" || currentToken.type == "STRING"
    || currentToken.type == "BOOLEAN" || currentToken.type == "WHILE" 
    || currentToken.type == "IF" || currentToken.type == "LEFT_BRACE"
    || currentToken.type == "RIGHT_BRACE") {
        statement();
    } else {
        //increases errors
        pErrors++;
        //Outputs failed
        handle("PRINT, ID, INT, STRING, BOOLEAN, WHILE, STRING, IF, LEFT_BRACE, RIGHT_BRACE");
    }
    //backs out
    return;
}

//checks for blocks
function block() {
    //debugging
    if (pDebug) {
        parserLog("Block..");
    }
    //if current token is a lerft brace
    if (currentToken.type == "LEFT_BRACE") {
        leftBrace();
        //changes the token
        getToken();
        //Goes to statementList
        statementList();
    //if current token is a Right brace
    } else if (currentToken.type == "RIGHT_BRACE" ) {
        rightBrace();
        program();
    } else {
        //increases errors
        pErrors++;
        //Outputs failed
        handle("LEFT_BRACE, RIGHT_BRACE");
    }
    //backs out
    return;
}

//checks for programs
function program() {
    //Changes token
    getToken();
    //breaks out of the parsers loop
    if (tokens.length == 0) {
        //backs out of the program
        return;
    }
    //debugging
    if (pDebug) {
        parserLog("Program..");
    }
    if (programLevel != programLevelCounter) {
        //Outputs program number
        parserLog("Parsing Program #"+programLevel);
        parserLog("Parsing Program #"+programLevel);
        //increases the counter
        programLevelCounter++;
    }
    
    //if current token is a lerft brace
    if (currentToken.type == "LEFT_BRACE") {
        //Goes to the block
        block();
    } else if (braceLevel > 0) {
        //Goes to statementList
        statementList();
    } else if ((braceLevel == 0) && (currentToken.type != "EOP")) {
        //increases errors
        pErrors++;
        //Outputs failed
        handle("EOP");
    }
    //if current token is a EOP
    if (currentToken.type == "EOP" && tokens.length > 0) {
        //Processes the end of program
        eOP();
        //calls program
        program();
    }
    //backs out
    return;
}

//checks for statements
function statement() {
    //debugging
    if (pDebug) {
        parserLog("Statement..");
    }
    if (currentToken.type == "PRINT") {
        printStatement();
    } else if (currentToken.type == "ID") {
        assignmentStatement();
    } else if (currentToken.type == "INT" || currentToken.type == "STRING" || currentToken.type == "BOOLEAN") {
        varDecl();
    } else if (currentToken.type == "WHILE") {
        whileStatement();
    } else if (currentToken.type == "IF") {
        ifStatement();
    } else if (currentToken.type == "LEFT_BRACE" || currentToken.type == "RIGHT_BRACE") {
        block();
    } else {
        //increases errors
        pErrors++;
        //Outputs failed
        handle("PRINT, ID, INT, STRING, BOOLEAN, WHILE, STRING, IF, LEFT_BRACE, RIGHT_BRACE");
    }
    //backs out
    return;
}

//handles the print statement
function printStatement() {
    //handels the print
    handle();
    //Changes the token
    getToken();
    //changes to in print
    inPrint = true;
    if (currentToken.type == "LEFT_PARENTHESES") {
        //goes to left parentheses for print
        printLeftP();
    } else {
        //increases errors
        pErrors++;
        //Outputs failed
        handle("LEFT_PARENTHESES");
    }
}
//handles the parsering and CST
function handle(unexpected = '') {
    //sets the type of the token
    var type = currentToken.type;
    //sets the value of the token
    var value = currentToken.value;
    //sets the line of the token
	var line = currentToken.line;
    //sets the col of the token
    var column = currentToken.column;

    //Defines text
    var text;

    //Figures out if it is a successful or unexpected token output
    if (!unexpected) {
        text = "Passed! Expected token found [ "+type+" ] with a value of [ "+value+" ] on line "+line+", "+column+"..."; 
    } else {
        text = "Failed! Unexpected token found [ "+type+" ] on line "+line+", "+column;
        //processes the the first text
        parserLog(text);
        text =  "------  Expected token(s) [ "+unexpected+" ] on line "+line+", "+column+"...";
    }
    //processes the text
    parserLog(text);
}

//Sets the parsers log
function parserLog(text) {
    //Appends new logging to current log
    var lText = $('#Lexer_log').val()+"PARSER -- "+text+"\n";
    //Sets the Log
    $('#Lexer_log').text(lText);
}
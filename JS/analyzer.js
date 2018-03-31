// JavaScript Document

//defines the token list, current token, parser errors, brace level, program level, program level counter, in print, in bool, and finished.
var tokens = [];
var tokenNumber = 0;
var currentToken;
var aErrors = 0;
var tokenNumber = 0;
var scope = -1;
var scopeLevel = -1;

//sets the AST and root node
var ast = new Tree();
ast.addNode("Root", "branch");

//sets the symbol tree
var st = new symbolTree();

//resets the globals and AST
function resetGlobals() {
    tokens = [];
    currentToken;
    aErrors = 0;
    tokenNumber = 0;
    scope = -1;
    scopeLevel = -1;

    ast = new Tree();
    ast.addNode("Root", "branch");
}

function getToken() {
   //increases token count
    tokenNumber++;
    //sets current token
    currentToken = tokens[0];
    //removes the token from the list
    tokens.shift();
}

function checkNext() {
    //Gets next
    return tokens[0];
}
 
//runs the parser
function analyzer(input) {
    //resets the globals
    resetGlobals();
    //if verbose
    if (verbose) {
        //Outputs starting
        parserLog("Semantic Analysis is starting..\n");
    }
    //sets the token list
    tokens = input;
    //calls the first token check
    program();

    //Defines the completion text
    var completedText = "\nThe semantic analysis successfully passed";
    
    //if any errors
    if (pErrors) {
		//Sets failed for the completed semantic analysis output
		completedText = "\nThe semantic analysis FAILED with errors ("+aErrors+")";
	} else {
        $('#ast').val($('#ast').val()+ast.toString());
    }
	//Outputs the completed Text
	$('#Lexer_log').text($('#Lexer_log').val()+completedText);
    
    //returns error number
    return ast;
}


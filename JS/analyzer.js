// JavaScript Document

//defines the token list, current token, parser errors, brace level, program level, program level counter, in print, in bool, and finished.
var aTokens = [];
var aTokenNumber = 0;
var aCurrentToken;
var aErrors = 0;
var scope = -1;
var scopeLevel = -1;

//sets the AST and root node
var ast = new Tree();
ast.addNode("Root", "branch");

//sets the symbol tree
var st = new symbolTree();

//resets the globals and AST
function aResetGlobals() {
    aTokens = [];
    aTokenNumber = 0;
    aCurrentToken;
    aErrors = 0;
    scope = -1;
    scopeLevel = -1;

    ast = new Tree();
    ast.addNode("Root", "branch");
}

function aGetToken() {
    //increases token count
    aTokenNumber++;
    //sets current token
    aCurrentToken = aTokens[0];
    //removes the token from the list
    aTokens.shift();
}

function aCheckNext() {
    //Gets next
    return aTokens[0];
}
 
//runs the analyzer
function analyzer(input) {
    //resets the globals
    aResetGlobals();
    //if verbose
    if (verbose) {
        //Outputs starting
        parserLog("Semantic Analysis is starting..\n");
    }
    //sets the token list
    aTokens = input;
    //calls the first token check
    aProgram();

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

function addBranch(name) {
    //Creates a Branch
    ast.addNode(name, "branch", aCurrentToken.line, scope, name);
}

//Sets the parsers log
function analysisLog(text) {
    //Appends new logging to current log
    var lText = $('#Lexer_log').val()+"ANALYZER -- "+text+"\n";
    //if not supposed to be output
    if (text == "DO NOT OUTPUT") {
        //No need to change
        lText = $('#Lexer_log').val();
    }
    //Sets the Log
    $('#Lexer_log').text(lText);
}

function aProgram() {
    //starts ast branch
    ast.addNode("Program "+programNumber, "branch");

    //debugging
    if (debug && verbose) {
        analysisLog("Program..");
    }

    //moves token pointer
    aGetToken();

    // Initialize parsing of Block
    aBlock();
    
    //Checks for EOP
    if (aCurrentToken.type == "EOP") {
        //moves token pointer
        aGetToken();
    }
    
    //back out a level in the ast
    ast.kick();
}

function aBlock() {
    //increases the scope levels
    scopeLevel++;
    scope++;

    //debugging
    if (debug && verbose) {
        analysisLog("Block..");
    }
    
    //Creates Scope Node in Symbol Tree
    st.addNode("ScopeLevel: " + scope, "branch", scope);

    //Creates a Branch
    addBranch("Block");
    
    //Checks for LEFT_BRACE
    if (aCurrentToken.type == "LEFT_BRACE") {
        //nothing
    }

    // Initialize parsing of StatementList
    aStatementList();
    
    //Checks for RIGHT_BRACE
    if (aCurrentToken.type == "RIGHT_BRACE"){
        //moves token pointer
        aGetToken();
    }
    
    scopeLevel--;
    // Kicks you one Scope up the Symbol Tree
    st.kick();
}

// JavaScript Document

//defines the token list, current token, parser errors, brace level, program level, program level counter, in print, in bool, and finished.
var tokens = [];
var currentToken;
var aErrors = 0;

//sets the AST and root node
var ast = new Tree();
ast.addNode("Root", "branch");


var st = new symbolTree();

//resets the globals and AST
function resetGlobals() {
    tokens = [];
    currentToken;
    aErrors = 0;

    ast = new Tree();
    ast.addNode("Root", "branch");
}

function getToken() {
    //sets current token
    currentToken = tokens[0];
    //removes the token from the list
    tokens.shift();
    //returns the current token
    //return currentToken;
}

function checkNext() {
    //Gets next
    return tokens[0];
}
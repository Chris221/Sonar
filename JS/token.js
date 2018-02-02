// JavaScript Document

//Defining a new token
function Token(token, value, line, col) {
	this.type = token;
	this.value = value;
	this.line = line;
	this.column = col;
}

//Check token function
Token.is = function(check) {
	return this.type === check;
};
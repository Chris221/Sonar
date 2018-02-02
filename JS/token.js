// JavaScript Document

//Defining a new token
function Token(token, value, line) {
	this.type = token;
	this.value = value;
	this.line = line;
}

//Check token function
Token.is = function(check) {
	return this.type === check;
};
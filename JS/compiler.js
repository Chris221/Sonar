// JavaScript Document
function compile() {
	//Gets the input
	var input = $('#input').val();
	//Moves the input to the lexer
	var tokens = lexer(input);
}

// JavaScript Document

//Debugger
var debug = false;

function compile() {
	//Gets the input
	var input = $('#input').val();
	//Sets pass bool false
	var lPass = false;
	//Sets failed output text
	var text = "==============================\n"+
			   "\n"+
			   "                         Lexer Failed         \n"+
			   "\n"+
			   "==============================\n";
	//Moves the input to the lexer
	if (tokens = lexer(input)) {
		//Sets pass bool true
		lPass = true;
		//Sets success output text
		text = "==============================\n"+
			   "\n"+
			   "                         Lexer Passed         \n"+
			   "\n"+
			   "==============================\n";
	}
	//Outputs the Lexer output
	$('#Lexer_log').text($('#Lexer_log').val()+"\n\n"+text+"\n\n");
}
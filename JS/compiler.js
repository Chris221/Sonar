// JavaScript Document

//Debugger
var debug = false;

function compile() {
	//Gets the input
	var input = $('#input').val();
	//Sets pass bool false
	var lPass = false;
	//Sets failed output text
	var text = "=============================="+
			   "                              "+
			   "         Lexer Failed         "+
			   "                              "+
			   "==============================";
	//Moves the input to the lexer
	if (var tokens = lexer(input)) {
		//Sets pass bool true
		lPass = true;
		//Sets success output text
		text = "=============================="+
			   "                              "+
			   "         Lexer Passed         "+
			   "                              "+
			   "==============================";
	}
	//Outputs the Lexer output
	$('#Lexer_log').text($('#Lexer_log').val()+"\n\n"+text+"\n\n");
}
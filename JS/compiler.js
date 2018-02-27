// JavaScript Document

//Debugger
var debug = false;

//Starts the compile
function compile() {
	//Clears the marquee for tokens
	$('#token-marquee').text("");
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
		//Loops through each token in the list
		for(var tCount = 0; tCount < tokens.length; tCount++) {
			//Gets the current token
			var cToken = tokens[tCount];
			//Gets the token name
			var tName = cToken.type;
			//Gets the token value
			var tVal = cToken.value;
			//Adds token to the marquee
			$('#token-marquee').append('<span class="token small"><span class="text-cyan">'+tCount+'</span> <span class="text-blue">:</span> <span class="text-red">'+tName+'</span> <span class="text-cyan">[</span> <span class="text-gray">'+tVal+'</span> <span class="text-cyan">]</span></span>');
		}
		compileParser(tokens);
	} else {
		//Sets marquee to failed text :(
		$('#token-marquee').append('<span class="token small text-red">No tokens due to lexer error</span>');
	}
	//Outputs the Lexer output
	$('#Lexer_log').text($('#Lexer_log').val()+"\n\n"+text+"\n\n");
}

//Moves the compiler to parse
function compileParser(tokens) {
	parser(tokens);
}
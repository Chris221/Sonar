// JavaScript Document

//Debugger
var debug = false;

//verbose mode
var verbose = true;

//sets verbose button color
$(function() {
	if (verbose) {
		$('#verbose').addClass("btn-success").removeClass("btn-secondary")
	} else {
		$('#verbose').addClass("btn-secondary").removeClass("btn-success")
	}
});

//allows for the switching of verbose
function verboseChange() {
	//if on
	if (verbose) {
		//turn off
		verbose = false;
		$('#verbose').addClass("btn-secondary").removeClass("btn-success")
	} else {
		//otherwise turn on
		verbose = true;
		$('#verbose').addClass("btn-success").removeClass("btn-secondary")
	}
}

//Starts the compile
function compile() {
	//Sets the visualizer defaults
	$('#lexer').addClass("btn-secondary").removeClass("btn-success").removeClass("btn-danger").removeClass("btn-warning");
	$('#parser').addClass("btn-secondary").removeClass("btn-success").removeClass("btn-danger");
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
	} else {
		//Sets marquee to failed text :(
		$('#token-marquee').append('<span class="token small text-red">No tokens due to lexer error</span>');
	}
	//Outputs the Lexer output
	$('#Lexer_log').text($('#Lexer_log').val()+"\n\n"+text+"\n\n");
	//if the lexer passes
	if (lPass) {
		//Starts the parser handler function
		compileParser(tokens);
	}
}

//Moves the compiler to parse
function compileParser(tokens) {
	var pReturn = parser(tokens);
}
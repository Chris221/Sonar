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

//Scroll to the bottom of the log
function logScroll() {
	var textArea = $('#Lexer_log');
	textArea.scrollTop( textArea[0].scrollHeight - textArea.height()   );
}

//Starts the compile
function compile() {
	//clears the token array
	tokens = [];
	//if the lexer passes
	if (compileLexer()) {
		//Starts the parser handler function
		compileParser();
	} else {
		//No need to parse
		var text = "No need to parse program due to a lex error";
		$('#Lexer_log').text($('#Lexer_log').val()+text+"\n\n");
		//Scroll to the bottom of the log
		logScroll();
	}
}

//gets the input in a nice readable manor
function compileInput() {
	//Gets the input
	var input = $('#input').val();
	//checks if theres a $ at the end
	if (input.trim().slice(-1) != "$") {
		//if so
		var doNotAddToLast = true;
	}
	//splits the input up by program
	var programs = input.split("$");

	//if there was a $ there is now extra space
	if (!doNotAddToLast) {
		//remove it
		programs.pop();
	}

	//goes through and adds if its supposed too
	for (var i = 0; i < programs.length; i++) {
		if (!((programs.length == (i+1)) && doNotAddToLast)) {
			programs[i] += "$";
			console.log("adding $ to "+i);
		}
	}
	return programs;
}

//Starts the compile
function compileLexer() {
	//Sets the visualizer defaults
	$('#lexer').addClass("btn-secondary").removeClass("btn-success").removeClass("btn-danger").removeClass("btn-warning");
	$('#parser').addClass("btn-secondary").removeClass("btn-success").removeClass("btn-danger");
	//Clears the marquee for tokens
	$('#token-marquee').text("");
	//Clears the CST
	$('#cst').val("");
	//Gets the input
	var input = $('#input').val();
	//Sets failed output text
	var text = "==============================\n"+
			   "\n"+
			   "                         Lexer Failed         \n"+
			   "\n"+
			   "==============================";
	//Moves the input to the lexer
	if (tokensLex = lexer(input)) {
		//Sets success output text
		text = "==============================\n"+
			   "\n"+
			   "                         Lexer Passed         \n"+
			   "\n"+
			   "==============================";
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
	//Scroll to the bottom of the log
	logScroll();
	//rerurns token list
	return tokensLex;
}

//Moves the compiler to parse
function compileParser() {
	//Sets pass bool false
	var pPass = false;
	//Sets failed output text
	var text = "==============================\n"+
			   "\n"+
			   "                        Parser Failed         \n"+
			   "\n"+
			   "==============================";
	//runs parser gets the cst
	if (cst = parser(tokens)) {
		//Sets pass bool true
		pPass = true;
		//Sets success output text
		text = "==============================\n"+
			   "\n"+
			   "                        Parser Passed         \n"+
			   "\n"+
			   "==============================";
	}
	//Outputs the Lexer output
	$('#Lexer_log').text($('#Lexer_log').val()+"\n\n"+text+"\n\n");

	//if parsed output the cst
	if (cst) {
		$('#Lexer_log').text($('#Lexer_log').val()+cst.toString()+"\n\n");
	}
	//Scroll to the bottom of the log
	logScroll();
}
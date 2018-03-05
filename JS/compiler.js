// JavaScript Document

//Debugger
var debug = false;

//verbose mode
var verbose = true;

//program array
var programsTokens = [];

//program number
var programNumber = 1;

//lexer fail count
var lexfail = 0;

//parser fail count
var parsefail = 0;

//lexer and parser hover text
var lexHover, parseHover;

//sets verbose button color
$(function() {
	if (verbose) {
		$('#verbose').addClass("btn-success").removeClass("btn-secondary");
	} else {
		$('#verbose').addClass("btn-secondary").removeClass("btn-success");
	}
});

//enables tooltips in bootstrap
$(function () {
	$('[data-toggle="tooltip"]').tooltip();
})

//allows for the switching of verbose
function verboseChange() {
	//if on
	if (verbose) {
		//turn off
		verbose = false;
		$('#verbose').addClass("btn-secondary").removeClass("btn-success");
	} else {
		//otherwise turn on
		verbose = true;
		$('#verbose').addClass("btn-success").removeClass("btn-secondary");
	}
}

//Scroll to the bottom of the log
function logScroll() {
	var textArea = $('#Lexer_log');
	textArea.scrollTop( textArea[0].scrollHeight - textArea.height());
}

//Starts the compile
function compile() {
	//set defaults
	programNumber = 1;
	lexfail = 0;
	parsefail = 0;
	lexHover = "";
	parseHover = "";
	//Clears the log
	$('#Lexer_log').text("");
	//Clears the marquee for tokens
	$('#token-marquee').text("");
	//Clears the CST
	$('#cst').val("");
	//clears the token array
	programsTokens = [];
	//gets the list of programs
	var programs = compileInput();

	//removes the hover text
	$('#lexer').removeAttr("data-original-title");
	$('#parser').removeAttr("data-original-title");

	//if verbose
	if (verbose) {
		//Outputs the verbose mode
		$('#Lexer_log').text($('#Lexer_log').val()+"Sonar is running in Verbose mode..\n\n");
	} else {
		//Outputs the non verbose mode
		$('#Lexer_log').text($('#Lexer_log').val()+"Sonar is running..\n\n");
	}

	//loops through for each program
	for (var p = 0; p < programs.length; p++) {
		//sets current input text
		var inputText = programs[p];
		//if the lexer passes
		if (compileLexer(inputText)) {
			//adds the current program to the full array of tokens
			for (var t = 0; t < tokens.length; t++) {
				//adds each and every token :)
				programsTokens.push(tokens[t]);
			}
			//Adds hover text if lexer pass
			lexHover += "Program "+programNumber+": Passed<br/>" ;
			//Starts the parser handler function
			compileParser();
		} else {
			//Adds hover text if lexer fails
			lexHover += "Program "+programNumber+": Error<br/>" ;
			//increas lexfail count
			lexfail++;
			//No need to parse
			var text = "No need to parse program "+programNumber+" due to a lex error";
			$('#Lexer_log').text($('#Lexer_log').val()+text+"\n\n");
			//Scroll to the bottom of the log
			logScroll();
		}
		//increase the program number
		programNumber++;
	}
	if (!lexfail) {
		//Loops through each token in the list
		for(var tCount = 0; tCount < programsTokens.length; tCount++) {
			//Gets the current token
			var cToken = programsTokens[tCount];
			//Gets the token name
			var tName = cToken.type;
			//Gets the token value
			var tVal = cToken.value;
			//Adds token to the marquee
			$('#token-marquee').append($('#token-marquee').val()+'<span class="token small"><span class="text-cyan">'+tCount+'</span> <span class="text-blue">:</span> <span class="text-red">'+tName+'</span> <span class="text-cyan">[</span> <span class="text-gray">'+tVal+'</span> <span class="text-cyan">]</span></span>');
		}
	} else {
		//Sets marquee to failed text :(
		$('#token-marquee').append('<span class="token small text-red">No tokens due to lexer error</span>');
	}
	
	//adds new  hover text
	$('#lexer').attr("data-original-title", lexHover );
	$('#parser').attr("data-original-title", parseHover );
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
		}
	}
	//returns programs
	return programs;
}

//Starts the compile
function compileLexer(input) {
	//Sets the visualizer defaults
	$('#lexer').addClass("btn-secondary").removeClass("btn-success").removeClass("btn-danger").removeClass("btn-warning");
	$('#parser').addClass("btn-secondary").removeClass("btn-success").removeClass("btn-danger");
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
	if (!pErrors) {
		//Adds hover text if parser pass
		parseHover += "Program "+programNumber+": Passed<br/>" ;
		$('#Lexer_log').text($('#Lexer_log').val()+cst.toString()+"\n\n");
	} else {
		//Adds hover text if parser fails
		parseHover += "Program "+programNumber+": Error<br/>" ;
		//increas parsefail count
		parsefail++;
		//No CST to show
		var text = "No CST to showe due to a parse error";
		$('#Lexer_log').text($('#Lexer_log').val()+text+"\n\n");
	}
	//Scroll to the bottom of the log
	logScroll();
}
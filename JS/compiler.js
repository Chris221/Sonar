// JavaScript Document

//Debugger
var debug = false;

//verbose mode
var verbose = true;

//program array
var programsTokens = [];

//Token list for analysis
var analysisTokens = [];

//Symbol list
var allSymbols = [];

//program number
var programNumber = 1;

//lexer fail count
var lexfail = 0;

//parser fail count
var parsefail = 0;

//analyzer fail count
var analysisfail = 0;

//master line number
var masterLine = 0;

//lexer, parser, and analysis hover text
var lexHover, parseHover, analysisHover;

//sets verbose button color
$(function () {
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
	textArea.scrollTop(textArea[0].scrollHeight - textArea.height());
}

//Starts the compile
function compile() {
	//Sets the visualizer defaults
	$('#lexer').addClass("btn-secondary").removeClass("btn-success").removeClass("btn-danger").removeClass("btn-warning");
	$('#parser').addClass("btn-secondary").removeClass("btn-success").removeClass("btn-danger").removeClass("btn-warning");
	$('#analysis').addClass("btn-secondary").removeClass("btn-success").removeClass("btn-danger").removeClass("btn-warning");
	$('#code').addClass("btn-secondary").removeClass("btn-success").removeClass("btn-danger").removeClass("btn-warning");
	//set defaults
	programNumber = 1;
	lexfail = 0;
	parsefail = 0;
	analysisfail = 0;
	codefail = 0;
	masterLine = 0;
	lexHover = "";
	parseHover = "";
	analysisHover = "";
	codeHover = "";
	st = new symbolTree();
	allSymbols = [];
	scope = -1;
	scopeLevel = -1;
	symboltable = "";
	//Clears the log
	$('#Lexer_log').text("");
	//Clears the marquee for tokens
	$('#token-marquee').text("");
	//Clears the CST
	$('#cst').val("");
	//Clears the AST
	$('#ast').val("");
	//Clears the Scope Tree
	$('#scopetree').val("");
	//Clears the Symbol Table
	$('#symboltable').val("");
	//Clears the Code
	$('#codeBox').val("");
	//clears the token arrays
	programsTokens = [];
	analysisTokens = [];
	codeTokens = [];
	//clears the program pass/fail list
	var programPass = [];
	//gets the list of programs
	var programs = compileInput();

	//removes the hover text
	$('#lexer').removeAttr("data-original-title");
	$('#parser').removeAttr("data-original-title");
	$('#analysis').removeAttr("data-original-title");
	$('#code').removeAttr("data-original-title");

	//if verbose
	if (verbose) {
		//Outputs the verbose mode
		$('#Lexer_log').text($('#Lexer_log').val() + "Sonar is running in Verbose mode..\n\n");
	} else {
		//Outputs the non verbose mode
		$('#Lexer_log').text($('#Lexer_log').val() + "Sonar is running..\n\n");
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
				analysisTokens.push(tokens[t]);
				codeTokens.push(tokens[t]);
			}
			//Adds hover text if lexer pass
			lexHover += "Program " + programNumber + ": Passed<br/>";
			//Starts the parser handler function
			if (compileParser() == 0) {
				//Starts the semantic analysis handler function
				if (compileAnalysis() == 0) {
					//Starts the code gen handler function
					compileCode();
				}
			}
		} else {
			//adds a failure to the array
			programPass.push("Lex fail");
			//Adds hover text if lexer fails
			lexHover += "Program " + programNumber + ": Error<br/>";
			//Adds hover text if lexer fails
			parseHover += "Program " + programNumber + ": <em>None</em><br/>";
			//Adds hover text if lexer fails
			analysisHover += "Program " + programNumber + ": <em>None</em><br/>";
			//Adds hover text if lexer fails
			codeHover += "Program " + programNumber + ": <em>None</em><br/>";
			//increas lexfail count
			lexfail++;
			//No need to parse
			var text = "No need to parse program " + programNumber + " due to a lex error";
			$('#Lexer_log').text($('#Lexer_log').val() + text + "\n\n");
			//Scroll to the bottom of the log
			logScroll();
		}
		//increase the program number
		programNumber++;
	}
	if (!lexfail) {
		//Loops through each token in the list
		for (var tCount = 0; tCount < programsTokens.length; tCount++) {
			//Gets the current token
			var cToken = programsTokens[tCount];
			//Gets the token name
			var tName = cToken.type;
			//Gets the token value
			var tVal = cToken.value;
			//Adds token to the marquee
			$('#token-marquee').append($('#token-marquee').val() + '<span class="token small"><span class="text-cyan">' + tCount + '</span> <span class="text-blue">:</span> <span class="text-red">' + tName + '</span> <span class="text-cyan">[</span> <span class="text-gray">' + tVal + '</span> <span class="text-cyan">]</span></span>');
		}
	} else {
		//Sets marquee to failed text :(
		$('#token-marquee').append('<span class="token small text-red">No tokens due to lexer error</span>');
	}
	//removes the extra number from program number
	programNumber--;

	//go to change visualizer
	changeVisualizer();
	//adds new  hover text
	$('#lexer').attr("data-original-title", lexHover);
	$('#parser').attr("data-original-title", parseHover);
	$('#analysis').attr("data-original-title", analysisHover);
	$('#code').attr("data-original-title", codeHover);
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
		if (!((programs.length == (i + 1)) && doNotAddToLast)) {
			programs[i] += "$";
		}
	}
	//returns programs
	return programs;
}

//Starts the compile
function compileLexer(input) {
	//Sets failed output text
	var text = "==============================\n" +
		"\n" +
		"                         Lexer Failed         \n" +
		"\n" +
		"==============================";
	//Moves the input to the lexer
	if (tokensLex = lexer(input)) {
		//Sets success output text
		text = "==============================\n" +
			"\n" +
			"                         Lexer Passed         \n" +
			"\n" +
			"==============================";
	}
	//Outputs the Lexer output
	$('#Lexer_log').text($('#Lexer_log').val() + "\n" + text + "\n");
	//Scroll to the bottom of the log
	logScroll();
	//rerurns token list
	return tokensLex;
}

//Moves the compiler to parse
function compileParser() {
	//Sets failed output text
	var text = "==============================\n" +
		"\n" +
		"                        Parser Failed         \n" +
		"\n" +
		"==============================";
	//runs parser gets the cst
	if (!parser(tokens)) {
		//Sets success output text
		text = "==============================\n" +
			"\n" +
			"                        Parser Passed         \n" +
			"\n" +
			"==============================";
	}
	//Outputs the parser output
	$('#Lexer_log').text($('#Lexer_log').val() + "\n" + text + "\n");

	//if parsed output the cst
	if (!pErrors) {
		//Adds hover text if parser pass
		parseHover += "Program " + programNumber + ": Passed<br/>";
		$('#Lexer_log').text($('#Lexer_log').val() + cst.toString() + "\n\n");
	} else {
		//Adds hover text if parser fails
		parseHover += "Program " + programNumber + ": Error<br/>";
		//Adds hover text if parser fails
		analysisHover += "Program " + programNumber + ": <em>None</em><br/>";
		//Adds hover text if parser fails
		codeHover += "Program " + programNumber + ": <em>None</em><br/>";
		//increas parsefail count
		parsefail++;
		//No CST to show
		var text = "No CST to show due to a parse error";
		$('#Lexer_log').text($('#Lexer_log').val() + text + "\n\n");
	}
	//Scroll to the bottom of the log
	logScroll();
	//returns pass/fall
	return pErrors;
}

//Moves the compiler to analysis
function compileAnalysis() {
	//Sets failed output text
	var text = "==============================\n" +
		"\n" +
		"                      Analysis Failed         \n" +
		"\n" +
		"==============================";
	//runs analysis gets the ast
	if (analyzer(analysisTokens) == 0) {
		//Sets success output text
		text = "==============================\n" +
			"\n" +
			"                      Analysis Passed         \n" +
			"\n" +
			"==============================";
	}
	//Outputs the analysis output
	$('#Lexer_log').text($('#Lexer_log').val() + "\n" + text + "\n");

	//if analyzer output the ast
	if (!aErrors) {
		//Adds hover text if analysis pass
		analysisHover += "Program " + programNumber + ": Passed<br/>";
		//Outputs the ast, scope tree and symbol table text to the log
		$('#Lexer_log').text($('#Lexer_log').val() + ast.toString() + "\n");
		$('#Lexer_log').text($('#Lexer_log').val() + "Program " + programNumber + " Scope Tree\n" + st.toString() + "\n");
		$('#Lexer_log').text($('#Lexer_log').val() + "The Symbol Table is located below in the Symbol Table tab.\n\n");
	} else {
		//Adds hover text if analysis fails
		analysisHover += "Program " + programNumber + ": Error<br/>";
		//Adds hover text if analysis fails
		codeHover += "Program " + programNumber + ": <em>None</em><br/>";
		//increas analysisfail count
		analysisfail++;
		//No AST to show
		var text = "No AST or Symbol Table to show due to a semantic analysis error";
		$('#Lexer_log').text($('#Lexer_log').val() + text + "\n\n");
		//Also outputs that to the symbol table
		symboltable += "Program " + programNumber + "<br />No Symbol table due to a semantic analysis error<br />";
		$('#symboltable').html(symboltable);
	}
	//Scroll to the bottom of the log
	logScroll();
	//returns pass/fall
	return aErrors;
}

//Moves the compiler to code gen
function compileCode() {
	//Sets failed output text
	var text = "==============================\n" +
		"\n" +
		"                      Code Gen Failed         \n" +
		"\n" +
		"==============================";
	//runs code gen to get the code
	code = gen(ast);
	if (!cErrors) {

		//Sets success output text
		text = "==============================\n" +
			"\n" +
			"                      Code Gen Passed         \n" +
			"\n" +
			"==============================";
		//Outputs the code
		$('#codeBox').text($('#codeBox').val() + code + "\n");
	} else {
		$('#codeBox').text($('#codeBox').val() + "No code due to Code Generation Error\n");

	}
	//Outputs the code gen output
	$('#Lexer_log').text($('#Lexer_log').val() + "\n" + text + "\n");

	//if code
	if (!cErrors) {
		//Adds hover text if analysis pass
		codeHover += "Program " + programNumber + ": Passed<br/>";
		//outputs code to log
		$('#Lexer_log').text($('#Lexer_log').val() + "\n" + code);
	} else {
		//Adds hover text if code fails
		codeHover += "Program " + programNumber + ": Error<br/>";
		//outputs no code
		$('#Lexer_log').text($('#Lexer_log').val() + "\nNo code due to Code Generation Error");
		//increas analysisfail count
		codefail++;
	}
	//Scroll to the bottom of the log
	logScroll();
	//returns pass/fall
	return cErrors;
}

function changeVisualizer() {
	//sets the analysis visualizer
	//if code failed everytime
	if (codefail == programNumber) {
		//red
		$('#code').addClass("btn-danger").removeClass("btn-secondary").removeClass("btn-btn-success").removeClass("btn-warning");
		//if code failed in one program
	} else if (codefail) {
		//yellow
		$('#code').addClass("btn-warning").removeClass("btn-secondary").removeClass("btn-btn-success").removeClass("btn-danger");
		//if code never ran
	} else if ((analysisfail == programNumber) || (lexfail == programNumber) || (parsefail == programNumber)) {
		//gray
		$('#code').addClass("btn-secondary").removeClass("btn-danger").removeClass("btn-btn-success").removeClass("btn-warning");
		//otherwise code must have passed
	} else {
		//green
		$('#code').addClass("btn-success").removeClass("btn-secondary").removeClass("btn-warning").removeClass("btn-danger");
	}

	//if analysis failed everytime
	if (analysisfail == programNumber) {
		//red
		$('#analysis').addClass("btn-danger").removeClass("btn-secondary").removeClass("btn-btn-success").removeClass("btn-warning");
		//if analysis failed in one program
	} else if (analysisfail) {
		//yellow
		$('#analysis').addClass("btn-warning").removeClass("btn-secondary").removeClass("btn-btn-success").removeClass("btn-danger");
		//if analysis never ran
	} else if ((lexfail == programNumber) || (parsefail == programNumber)) {
		//gray
		$('#analysis').addClass("btn-secondary").removeClass("btn-danger").removeClass("btn-btn-success").removeClass("btn-warning");
		//otherwise analysis must have passed
	} else {
		//green
		$('#analysis').addClass("btn-success").removeClass("btn-secondary").removeClass("btn-warning").removeClass("btn-danger");
	}

	//sets the parser visualizer
	//if parser failed everytime
	if (parsefail == programNumber) {
		//red
		$('#parser').addClass("btn-danger").removeClass("btn-secondary").removeClass("btn-btn-success").removeClass("btn-warning");
		//if parse failed in one program
	} else if (parsefail) {
		//yellow
		$('#parser').addClass("btn-warning").removeClass("btn-secondary").removeClass("btn-btn-success").removeClass("btn-danger");
		//if parser never ran
	} else if (lexfail == programNumber) {
		//gray
		$('#parser').addClass("btn-secondary").removeClass("btn-danger").removeClass("btn-btn-success").removeClass("btn-warning");
		//otherwise parser must have passed
	} else {
		//green
		$('#parser').addClass("btn-success").removeClass("btn-secondary").removeClass("btn-warning").removeClass("btn-danger");
	}

	//sets the lexer visualizer
	//if lexer has failed
	if (lexfail == programNumber) {
		//red
		$('#lexer').addClass("btn-danger").removeClass("btn-secondary").removeClass("btn-btn-success").removeClass("btn-warning");
		//if lex failed in one program
	} else if (lexfail) {
		//yellow
		$('#lexer').addClass("btn-warning").removeClass("btn-secondary").removeClass("btn-btn-success").removeClass("btn-danger");
		//otherwise lexer must have passed
	} else {
		//green
		$('#lexer').addClass("btn-success").removeClass("btn-secondary").removeClass("btn-warning").removeClass("btn-danger");
	}
}

//copy to clipboard function
function copyToClipboard(element) {
	var $temp = $("<input>");
	$("body").append($temp);
	$temp.val($(element).text()).select();
	document.execCommand("copy");
	$temp.remove();
	$.notify({
		// options
		message: 'Copied!'
	}, {
			// settings
			type: 'info',
			delay: 500,
			timer: 1000,
			url_target: '_blank',
			mouse_over: null,
			animate: {
				enter: 'animated fadeInDown',
				exit: 'animated fadeOutUp'
			},
		});
}

$(document).delegate('#input', 'keydown', function(e) {
	var keyCode = e.keyCode || e.which;
  
	if (keyCode == 9) {
	  e.preventDefault();
	  var start = this.selectionStart;
	  var end = this.selectionEnd;
  
	  // set textarea value to: text before caret + tab + text after caret
	  $(this).val($(this).val().substring(0, start)
				  + "\t"
				  + $(this).val().substring(end));
  
	  // put caret at right position again
	  this.selectionStart =
	  this.selectionEnd = start + 1;
	}
  });
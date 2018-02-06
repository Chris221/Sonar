// JavaScript Document
//Allows for the submenus

//Project 1 clean
var project1 = "/* Project 1 */\n"+
	"{}$\n"+
	"{{{{{{}}}}}}$\n"+
	"{{{{{{}}}	/*	comments	are	ignored	*/	}}}}$\n"+
	"{	/*	comments	are	still	ignored	*/	int	@}$";

//Project 1 ugly
var project1Ugly = "/* Project 1 */"+
		"{}$"+
		"{{{{{{}}}}}}$"+
		"{{{{{{}}}	/*	comments	are	ignored	*/	}}}}$"+
		"{	/*	comments	are	still	ignored	*/	int	@}$";

//Lex errors
var project1Lex = "/* Invalid Characters */\n"+
				"{ int @}$";

var twoLineString = "/* Invalid Break Line in String */\n"+
					"\"two\n"+
					"lines\"$";

var invalidString = "/* Invalid String */\n"+
					"\"this is good Not:`~!@#$%^&*()_+-=0987654321{}|[]\;'<>?,./\"$";
//Good simple cases
var goodcase1 = "/* Simple good text case */\n"+
				"{}$";

//Good case with string
var goodcase2 = "/* Print a string */\n"+
				"{\n"+
				"string a\n"+
				"a = \"this is a string\"\n"+
				"print(a)\n"+
				"}$";

//Output the testprogram
function testProgram(name) {
	//Intializes the return text
	var rText;
	//switches through to set the rtext
	switch(name) {
		case "project1":
			rText  = project1+"\n\n"+project1Ugly;
			break;
		case "project1_clean":
			rText  = project1;
			break;
		case "project1_ugly":
			rText = project1Ugly;
			break;
		case "project1_lex":
			rText  = project1Lex;
			break;
		case "two_line_string":
			rText  = twoLineString;
			break;
		case "invalid_string":
			rText = invalidString;
			break;
		case "good_case_1":
			rText  = goodcase1;
			break;
		case "good_case_2":
			rText = goodcase2;
			break;
		default:
			rText = "";
	}
	//
	$('#input').val(rText);
}
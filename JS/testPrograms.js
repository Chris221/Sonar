// JavaScript Document

//Project 1 clean
var project1 = "/* Sample Data */\n" +
	"{}$\n" +
	"{{{{{{}}}}}}$\n" +
	"{{{{{{}}}	/*	comments	are	ignored	*/	}}}}$\n" +
	"{	/*	comments	are	still	ignored	*/	int	@}$";

//Project 1 ugly
var project1Ugly = "/* Sample Data Ugly */" +
	"{}$" +
	"{{{{{{}}}}}}$" +
	"{{{{{{}}}	/*	comments	are	ignored	*/	}}}}$" +
	"{	/*	comments	are	still	ignored	*/	int	@}$";

//Project 3
var project3 = "/* Project 3 */\n" +
	"{\int a\n" +
	"    boolean b\n" +
	"    {\n" +
	"        string c\n" +
	"        a = 5\n" +
	"        b = true\n" +
	"        /* no comment */\n" +
	"        c = \"inta\"\n" +
	"        print(c)\n" +
	"    }\n" +
	"    print(b)\n" +
	"    print(a)\n" +
	"}$";

//Project 3 fail
var project3fail = "/* Project 3 Failure */\n" +
	"{\n" +
	"    int a \n" +
	"    {\n" +
	"        boolean b \n" +
	"        a = 1\n" +
	"    }\n" +
	"    print(b)\n" +
	"}$\n";

//Lex errors
//Invalid characters
var project1Lex = "/* Invalid Characters */\n" +
	"{ int @}$";

//Invalid break line in string
var twoLineString = "/* Invalid Break Line in String */\n" +
	"{\n" +
	"	\"two\n" +
	"	lines\"\n" +
	"}$";

//Invalid string
var invalidString = "/* Invalid String */\n" +
	"{\n" +
	"	\"this is good Not:`~!@#$%^&*()_+-=0987654321{}|[]\;'<>?,./\"\n" +
	"}$";
//Good simple cases
var goodcase1 = "/* Simple good text case */\n" +
	"{}$";

//Good case with string
var goodcase2 = "/* Print a string */\n" +
	"{\n" +
	"	string a\n" +
	"	a = \"this is a string\"\n" +
	"	print(a)\n" +
	"}$";

/*
 * These Parse Failure test cases came from Tien's test cases
 */
//invalid string
var parseFail1 = "/* This will fail because an Identifier\n" +
	"- is expected but not provided */\n" +
	"{\n" +
	"	/* 1 is not a valid identifier */\n" +
	"	string 1\n" +
	"}$";

//invalid expression
var parseFail2 = "/* This will fail because you\n" +
	"- cannot add a int-type to a\n" +
	"- variable; however, you can\n" +
	"- add a variable to an int-type */\n" +
	"{\n" +
	"	a + 3\n" +
	"}$";

//cannot print EOP
var parseFail3 = "/* Printing an EPOS is an\n" +
	"- invalid operation that\n" +
	"- you should be killed for\n" +
	"- thinking that it would work */\n" +
	"{\n" +
	"	print($)\n" +
	"}$";

//missing expression
var parseFail4 = "/* There is a missing Expr on line 19\n" +
	"- that will cause this entire code to\n" +
	"- fail parse */\n" +
	"{\n" +
	"	int a\n" +
	"	int b\n" +
	"	a = 0\n" +
	"	b = 0\n" +
	"	while (a != 3) {\n" +
	"		print(a)\n" +
	"		while (b != 3) {\n" +
	"			print(b)\n" +
	"			b = 1 + b\n" +
	"			if (b == 2) {\n" +
	"				print(\"there is no spoon\")\n" +
	"			}\n" +
	"		}\n" +
	"		b = 0\n" +
	"		a = 1 + \n" +
	"	}\n" +
	"}$";
/*
 * These Analysis Failure test cases came from Tien's test cases
 */

//Output the testprogram
function testProgram(name) {
	//Intializes the return text
	var rText;
	//switches through to set the rtext
	switch (name) {
		case "project1":
			rText = project1 + "\n\n" + project1Ugly;
			break;
		case "project1_clean":
			rText = project1;
			break;
		case "project3":
			rText = project3 + "\n\n" + project3fail;
			break;
		case "project3_pass":
			rText = project3;
			break;
		case "project3_fail":
			rText = project3fail;
			break;
		case "project1_ugly":
			rText = project1Ugly;
			break;
		case "project1_lex":
			rText = project1Lex;
			break;
		case "two_line_string":
			rText = twoLineString;
			break;
		case "invalid_string":
			rText = invalidString;
			break;
		case "good_case_1":
			rText = goodcase1;
			break;
		case "good_case_2":
			rText = goodcase2;
			break;
		case "invalid_string_declare":
			rText = parseFail1;
			break;
		case "invalid_expression":
			rText = parseFail2;
			break;
		case "print_EOP":
			rText = parseFail3;
			break;
		case "missing_expression":
			rText = parseFail4;
			break;
		default:
			rText = "";
	}
	//Sets the actual program
	$('#input').val(rText);
}
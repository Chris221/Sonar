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
	"/* Prints this is a string */\n" +
	"{\n" +
	"	string a\n" +
	"	a = \"this is a string\"\n" +
	"	print(a)\n" +
	"}$";
/*
* These Good test cases came from Tien's test cases
*/
var goodcase3 = "/* Boolean Expression Printing */\n" +
	"/* Prints falsefalsetruefalsetrue */\n" +
	"{\n" +
	"	boolean a\n" +
	"	a = false\n" +
	"	print((a == true))\n" +
	"	print((true == a))\n" +
	"	print((a == false))\n" +
	"	print(a)\n" +
	"	if (a == false) {\n" +
	"	    a = true\n" +
	"	}\n" +
	"	print(a)\n" +
	"}$";

var goodcase4 = "/* Boolean Logic */\n" +
	"/* Prints success */\n" +
	"{\n" +
	"	if (true == (true == (true == (true == (true == (true == (true == (true == (true != (false == true)))))))))) {\n" +
	"		print(\"success\")\n" +
	"	}\n" +
	"}$";

var goodcase5 = "/* Prints a while a != 5 */\n" +
	"/* Prints 23458 */\n" +
	"{\n" +
	"	string s\n" +
	"	int a\n" +
	"	a = 1\n" +
	"	{\n" +
	"	    while (a != 5) {\n" +
	"	       a = 1 + a\n" +
	"	        print(a)\n" +
	"	    }\n" +
	"	    print(3 + a)\n" +
	"	    print(s)\n" +
	"	}\n" +
	"}$";

var goodcase6 = "/* Addition of digits and a and Prints a*/\n" +
	"/* Prints 45 */\n" +
	"{\n" +
	"	int a\n" +
	"	a = 1\n" +
	"	a = 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + a\n" +
	"	print(a)\n" +
	"}$";

var goodcase7 = "/* String Logic\n" +
	"Strings with value are true\n" +
	"Strings without value are false\n" +
	"Prints: stringcheck onestring nostring noequal\n" +
	"*/\n" +
	"{\n" +
	"	if (\"true\" == \"true\") {\n" +
	"		print(\"stringcheck\")\n" +
	"	}\n" +
	"	print(\" \")\n" +
	"	if (true == \"true\") {\n" +
	"		print(\"onestring\")\n" +
	"	}\n" +
	"	print(\" \")\n" +
	"	if (true != \"\") {\n" +
	"		print(\"nostring\")\n" +
	"	}\n" +
	"	print(\" \")\n" +
	"	if (\"true\" != \"false\") {\n" +
	"		print(\"noequal\")\n" +
	"	}\n" +
	"}$";

var goodcase8 = "/* ID Logic\n" +
	"IDs compare\n" +
	"Nested IDs check the ID not the value (they return true/false)\n" +
	"Prints: equal not equal a is a is true but a is not true\n" +
	"*/\n" +
	"{\n" +
	"	int a\n" +
	"	int b\n" +
	"	int c\n" +
	"	a = 7\n" +
	"	b = a\n" +
	"	if (a == b) {\n" +
	"		print(\"equal\")\n" +
	"	}\n" +
	"	print(\" \")\n" +
	"	if (b != c) {\n" +
	"		print(\"not equal\")\n" +
	"	}\n" +
	"	print(\" \")\n" +
	"	if (a != (a == a)) {\n" +
	"		print(\"a is a is true but a is not true\")\n" +
	"	}\n" +
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
var analysisFail1 = "{\n" +
	"	int a\n" +
	"	a = 0\n" +
	"	string z\n" +
	"	z = \"bond\"\n" +
	"	while (a != 9) {\n" +
	"		if (a != 5) {\n" +
	"			print(\"bond\")\n" +
	"		}\n" +
	"		{\n" +
	" 			a = 1 + a\n" +
	"			string b\n" +
	"			b = \"james bond\"\n" +
	"			print(b)\n" +
	"		}\n" +
	"	}\n" +
	"	{/*Holy Hell This is Disgusting*/}\n" +
	"	boolean c\n" +
	"	c = true\n" +
	"	boolean d\n" +
	"	d = (true == (true == false))\n" +
	"	d = (a == b)\n" +
	"	d = (1 == a)\n" +
	"	d = (1 != 1)\n" +
	"	d = (\"string\" == 1)\n" +
	"	d = (a != \"string\")\n" +
	"	d = (\"string\" != \"string\")\n" +
	"	if (d == true) {\n" +
	"		int c\n" +
	"		c = 1 + d\n" +
	"		if (c == 1) {\n" +
	" 			print(\"ugh\")\n" +
	"		}\n" +
	"	}\n" +
	"	while (\"string\" == a) {\n" +
	"		while (1 == true) {\n" +
	"			a = 1 + \"string\"\n" +
	"		}\n" +
	"	}\n" +
	"}$";

var analysisFail2 = "{\n" +
	"	string a\n" +
	"	a = true\n" +
	"}$";

var analysisFail3 = "{\n" +
	"	int a\n" +
	"	a = 1\n" +
	"	if(\"a\" == 3) {\n" +
	"		a = 2\n" +
	"	}\n" +
	"	if(a != 1) {\n" +
	"		a = 3\n" +
	"	}\n" +
	"	if(a == 1) {\n" +
	"		a = 3\n" +
	"	}\n" +
	"}$";

var analysisFail4 = "{\n" +
	"	int a\n" +
	"	a = 9\n" +
	"	boolean a\n" +
	"}$";

var analysisFail5 = "{\n" +
	"	int a\n" +
	"	a = 4\n" +
	"	boolean b\n" +
	"	b = true\n" +
	"	boolean c\n" +
	"	string d\n" +
	"	d = \"there is no spoon\"\n" +
	"	c = (d != \"there is a spoon\")\n" +
	"	if(c == (false != (b == (true == (a == 3+1))))) {\n" +
	"		print((b != d))\n" +
	"	}\n" +
	"}$";

var analysisFail6 = "{\n" +
	"	int a\n" +
	"	{\n" +
	"	  int b\n" +
	"	  b = 2\n" +
	"	}\n" +
	"	a = b\n" +
	"}$";

/*
* These CodeGen Failure test cases came from Tien's test cases
*/
var codeFail1 = "{\n" +
	"	print(\"alan\")\n" +
	"	print(\"alan\")\n" +
	"	print(\"alan\")\n" +
	"	print(\"alan\")\n" +
	"	print(\"alan\")\n" +
	"	print(\"alan\")\n" +
	"	print(\"alan\")\n" +
	"	print(\"alan\")\n" +
	"	print(\"alan\")\n" +
	"	print(\"alan\")\n" +
	"	print(\"alan\")\n" +
	"	print(\"alan\")\n" +
	"	print(\"alan\")\n" +
	"	print(\"alan\")\n" +
	"	print(\"alan\")\n" +
	"	print(\"alan\")\n" +
	"}$";

var codeFail2 = "{\n" +
	"	int a\n" +
	"	a = 0\n" +
	"	string z\n" +
	"	z = \"bond\"\n" +
	"	while (a != 9) {\n" +
	"	   if (a != 5) {\n" +
	"		   print(\"bond\")\n" +
	"	   }\n" +
	"	  {\n" +
	"		   a = 1 + a\n" +
	"		   string b\n" +
	"		   b = \"james bond\"\n" +
	"		   print(b)\n" +
	"	   }\n" +
	"	}\n" +
	"	{}\n" +
	"	boolean c\n" +
	"	c = true\n" +
	"	boolean d\n" +
	"	int b\n" +
	"	b = 7\n" +
	"	d = (true == (true == false))\n" +
	"	d = (a == b)\n" +
	"	d = (1 == a)\n" +
	"	d = (1 != 1)\n" +
	"	d = (\"string\" == z)\n" +
	"	d = (z != \"string\")\n" +
	"	d = (\"string\" != \"string\")\n" +
	"	if (d == true) {\n" +
	"		int c\n" +
	"		c = 1 + b\n" +
	"		if (c == 1) {\n" +
	"			print(\"ugh\")\n" +
	"		}\n" +
	"	}\n" +
	"	while (\"string\" == z) {\n" +
	"		while (d == true) {\n" +
	"			a = 1 + b\n" +
	"		}\n" +
	"	}\n" +
	"}$";

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
		case "undeclaredB":
			rText = analysisFail1;
			break;
		case "StringBool":
			rText = analysisFail2;
			break;
		case "stringint":
			rText = analysisFail3;
			break;
		case "varRedclare":
			rText = analysisFail4;
			break;
		case "Boolhell":
			rText = analysisFail5;
			break;
		case "a1=b2":
			rText = analysisFail6;
			break;
		case "NoMem":
			rText = codeFail1;
			break;
		case "Alan_NoMem":
			rText = codeFail2;
			break;
		case "good_case_3":
			rText = goodcase3;
			break;
		case "booleanLogic":
			rText = goodcase4;
			break;
		case "whilePrint":
			rText = goodcase5;
			break;
		case "add_a_then_print":
			rText = goodcase6;
			break;
		case "stringlogic":
			rText = goodcase7;
			break;
		case "idlogic":
			rText = goodcase8;
			break;
		default:
			rText = "";
	}
	//Sets the actual program
	$('#input').val(rText);
}
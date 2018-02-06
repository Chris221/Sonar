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

//Output the testprogram
function testProgram(name) {
	//Intializes the return text
	var rText;
	//switches through to set the rtext
	switch(name) {
		case "lab1":
			rText  = project1+"\n\n"+project1Ugly;
			break;
		case "lab1_clean":
			rText  = project1;
			break;
		case "lab1_ugly":
			rText = project1Ugly;
			break;
		default:
			rText = "";
	}
	//
	$('#input').text(rText);
}
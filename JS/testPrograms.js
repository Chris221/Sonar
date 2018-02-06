// JavaScript Document
//Allows for the submenus
$('[data-submenu]').submenupicker();

//Lab 1 clean
var lab1 = "{}$\n"+
	"{{{{{{}}}}}}$\n"+
	"{{{{{{}}}	/*	comments	are	ignored	*/	}}}}$\n"+
	"{	/*	comments	are	still	ignored	*/	int	@}$";

//Lab 1 ugly
var lab1Ugly = "{}$"+
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
			rText  = lab1+"\n\n"+lab1Ugly;
			break;
		case "lab1_clean":
			rText  = lab1;
			break;
		case "lab1_ugly":
			rText = lab1Ugly;
			break;
		default:
			rText = "";
	}
	//
	$('#input').text(rText);
}
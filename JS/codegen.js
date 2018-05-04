var tree;
var code = [];
var cErrors = 0;
var cWarnings = 0;

function gen(ast) {
    tree = ast;
    code = [];
    cErrors = 0;
    cWarnings = 0;

    code = generate();
    
    return code;
}

function generate() {
}
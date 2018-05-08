/** 
 * A class that contains data associated with strings
 */

function stringTable() {
    this.variables = {};
};

// Adds a variable to the static data table
stringTable.prototype.add = function (address, string) {
    this.variables["'" + string + "'"] = new IdentifierString(address, string);
};

// Gets a variable from the static data table
stringTable.prototype.get = function (string) {
    //tries if there is an element otherwise
    try {
        //returns the address
        return this.variables["'" + string + "'"].address;
    } catch {
        //returns false to escape
        return false;
    }
};

/** 
 * A class that contains data associated with an identifier
 */

function IdentifierString(address, string) {
    this.address = address;
    this.string = string;
};
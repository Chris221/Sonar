/** 
 * A class that contains data associated with jumps
 * Modified from svegliator
 */

function JumpTable() {
    this.address = 0;
    this.variables = {};
};

// Adds a jump location to the jump table
JumpTable.prototype.add = function (startingAddress) {
    var address = 'J' + this.address++;
    this.variables[address] = new JumpVariable(startingAddress);
    return address;
};

// Gets a jump location from the jump table
JumpTable.prototype.get = function (address) {
    return this.variables[address];
};


/** 
 * A class that contains data associated with a jump location
 */

function JumpVariable(startingAddress) {
    this.startingAddress = startingAddress;
    this.endingAddress = null;
};
/** 
 * A class that contains data associated with variables
 * Modified from svegliator.
 */

function StaticData() {
    this.currentAddress = 0;
    this.offset = 0;
    this.variables = {};
};

// Adds a variable to the static data table
StaticData.add = function(node, scope) {
    var adjustedAddress = 'T' + pad(this.currentAddress++, 3, '0');
    this.variables[this.getKey(node, scope)] = new IdentifierVariable(adjustedAddress, this.offset++);
    return adjustedAddress;
};

// Gets a variable from the static data table
StaticData.get = function(node, scope) {
    var identifier = this.variables[this.getKey(node, scope)];
    
    if (!identifier) {
        var parentScopeLevel = node.parent.scope;
        identifier = this.variables[node.value + "@" + parentScopeLevel];
    }
    
    return identifier.address;
};

// Generates the key for a given variable
StaticData.getKey = function(node, scope) {
    var key = node.value + "@" + scope;
    return key;
};

/** 
 * A class that contains data associated with an identifier
 */

function IdentifierVariable(address, offset) {
    this.address = address;
    this.offset = offset;
};
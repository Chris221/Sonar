// Creates Symbol class for Symbol Table
class Symbol {
	constructor(key, type, line, scope, scopeLevel, programNumber, initialized, utilized, value, stringHex, tempStore) {
		this.key = key;
		this.type = type;
		this.line = line;
		this.scope = scope;
		this.scopeLevel = scopeLevel;
		this.programNumber = programNumber;
		this.initialized = initialized;
		this.utilized = utilized;
		this.value = value;
		this.stringHex = stringHex;
		this.tempStore = tempStore;
	}

	getKey() {
		return this.key;
	}
	
	getType() {
		return this.type;
	}

	getLine() {
		return this.line;
	}

	getScope() {
		return this.scope;
	}

	getDetails() {
		var details = {
			type: this.type,
			line: this.line,
			initialized: this.initialized,
			utilized: this.utilized
		};
		return details;
	}
}